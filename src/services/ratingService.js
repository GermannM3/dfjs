const { User, Order } = require('../models');
const { Op } = require('sequelize');

const updateContractorRating = async (contractorId) => {
  try {
    const orders = await Order.findAll({
      where: {
        contractorId,
        rating: {
          [Op.not]: null
        }
      }
    });

    if (orders.length === 0) return;

    // Рассчитываем средний рейтинг
    const totalRating = orders.reduce((sum, order) => sum + order.rating, 0);
    const averageRating = totalRating / orders.length;

    // Обновляем рейтинг подрядчика
    await User.update(
      { rating: averageRating },
      { where: { id: contractorId } }
    );

    return averageRating;
  } catch (error) {
    console.error('Update contractor rating error:', error);
    throw error;
  }
};

const calculateRatingImpact = (order) => {
  let impact = 0;

  // Базовые баллы за выполнение
  if (order.status === 'выполнен') {
    impact += 1;
  }

  // Дополнительные баллы за отличный рейтинг
  if (order.rating === 5) {
    impact += 0.5;
  }

  // Штрафы
  if (order.status === 'отменен') {
    impact -= 2;
  }
  if (order.rating && order.rating < 3) {
    impact -= 3;
  }

  return impact;
};

class RatingService {
  static async updateRating(userId, points) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Обновляем рейтинг с учетом весов
    const newRating = ((user.rating * user.completedOrders) + points) / (user.completedOrders + 1);
    
    await user.update({
      rating: parseFloat(newRating.toFixed(2)),
      completedOrders: user.completedOrders + 1
    });

    return user;
  }

  static async calculateOrderPoints(order) {
    let points = 0;

    // За выполнение в срок
    if (order.status === 'выполнен' && new Date() <= order.completionDate) {
      points += 1;
    }

    // За отзыв
    if (order.rating === 5) {
      points += 0.5;
    }

    // Штрафы
    if (order.status === 'отменен') {
      points -= 2;
    }
    if (order.rating <= 2) {
      points -= 3;
    }

    return points;
  }
}

module.exports = {
  updateContractorRating,
  calculateRatingImpact,
  RatingService
}; 