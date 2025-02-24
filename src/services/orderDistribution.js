const { Op } = require('sequelize');
const { User, Order } = require('../models');
const geolib = require('geolib');

class OrderDistributionService {
  static async findBestContractor(order) {
    try {
      const contractors = await User.findAll({
        where: {
          type: 'contractor',
          status: 'active',
          isVerified: true,
          specialization: {
            [Op.contains]: [order.type]
          }
        },
        order: [['rating', 'DESC']]
      });

      const eligibleContractors = await Promise.all(
        contractors.map(async (contractor) => {
          // Проверка количества заказов на сегодня
          const todayOrders = await Order.count({
            where: {
              contractorId: contractor.id,
              status: {
                [Op.in]: ['принят', 'в_работе']
              },
              createdAt: {
                [Op.gte]: new Date().setHours(0, 0, 0, 0)
              }
            }
          });

          if (todayOrders >= contractor.maxDailyOrders) {
            return null;
          }

          // Проверка радиуса работы
          if (!contractor.location || !order.location) {
            return null;
          }

          const distance = geolib.getDistance(
            order.location,
            contractor.location
          );

          if (distance > contractor.workRadius * 1000) {
            return null;
          }

          return {
            contractor,
            distance,
            score: this.calculateScore(contractor, distance)
          };
        })
      );

      // Фильтруем null значения и сортируем по score
      const validContractors = eligibleContractors
        .filter(item => item !== null)
        .sort((a, b) => b.score - a.score);

      return validContractors[0]?.contractor || null;
    } catch (error) {
      console.error('Error finding contractor:', error);
      return null;
    }
  }

  static calculateScore(contractor, distance) {
    // Вес для каждого параметра
    const RATING_WEIGHT = 0.4;
    const DISTANCE_WEIGHT = 0.3;
    const ORDERS_WEIGHT = 0.3;

    // Нормализуем значения от 0 до 1
    const ratingScore = contractor.rating / 5;
    const distanceScore = 1 - (distance / (contractor.workRadius * 1000));
    const ordersScore = 1 - (contractor.completedOrders / contractor.maxDailyOrders);

    // Считаем общий скор
    return (
      ratingScore * RATING_WEIGHT +
      distanceScore * DISTANCE_WEIGHT +
      ordersScore * ORDERS_WEIGHT
    );
  }
}

module.exports = OrderDistributionService; 