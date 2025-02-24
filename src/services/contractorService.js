const { User, Order } = require('../models');
const { Op } = require('sequelize');
const { calculateDistance } = require('../utils/geoUtils');

const findNearestContractors = async (orderLocation, orderType) => {
  try {
    // Получаем всех активных подрядчиков с подходящей специализацией
    const contractors = await User.findAll({
      where: {
        type: 'contractor',
        status: 'active',
        isVerified: true,
        specialization: {
          [Op.contains]: [orderType]
        }
      }
    });

    // Фильтруем по загруженности
    const availableContractors = await filterByWorkload(contractors);

    // Сортируем по расстоянию и рейтингу
    const rankedContractors = availableContractors
      .map(contractor => ({
        contractor,
        distance: calculateDistance(orderLocation, contractor.location),
        score: calculateScore(contractor)
      }))
      .filter(item => item.distance <= item.contractor.workRadius)
      .sort((a, b) => b.score - a.score);

    return rankedContractors;
  } catch (error) {
    console.error('Find contractors error:', error);
    throw error;
  }
};

const filterByWorkload = async (contractors) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = await Promise.all(
    contractors.map(async (contractor) => {
      const dailyOrders = await Order.count({
        where: {
          contractorId: contractor.id,
          status: {
            [Op.in]: ['принят', 'в_работе']
          },
          createdAt: {
            [Op.gte]: today
          }
        }
      });

      return {
        contractor,
        available: dailyOrders < contractor.maxDailyOrders
      };
    })
  );

  return results
    .filter(result => result.available)
    .map(result => result.contractor);
};

const calculateScore = (contractor) => {
  // Базовый рейтинг
  let score = contractor.rating * 10;

  // Бонус за высокий рейтинг
  if (contractor.rating >= 4.5) score += 20;
  
  // Бонус за верификацию
  if (contractor.isVerified) score += 15;

  return score;
};

module.exports = {
  findNearestContractors
}; 