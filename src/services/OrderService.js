const { Order, User } = require('../models');
const { calculateDistance } = require('../utils/geoUtils');

class OrderService {
  static async createOrder(orderData) {
    try {
      const order = await Order.create(orderData);
      await this.findMatchingContractors(order);
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  static async findMatchingContractors(order) {
    const contractors = await User.findAll({
      where: {
        type: 'contractor',
        isVerified: true,
        status: 'active',
        specialization: {
          [Op.contains]: [order.service]
        }
      }
    });

    const matchingContractors = contractors.filter(contractor => {
      const distance = calculateDistance(
        order.location.coordinates,
        contractor.location.coordinates
      );
      return distance <= contractor.workRadius;
    });

    return matchingContractors.sort((a, b) => b.rating - a.rating);
  }

  static async assignOrder(orderId, contractorId) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) throw new Error('Order not found');

      order.contractorId = contractorId;
      order.status = 'assigned';
      await order.save();

      return order;
    } catch (error) {
      throw new Error(`Failed to assign order: ${error.message}`);
    }
  }
}

module.exports = OrderService;