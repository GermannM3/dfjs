const crypto = require('crypto');
const axios = require('axios');
const { Order } = require('../models');

class PaymentService {
  static async createPayment(amount, orderId) {
    try {
      // Using free YooKassa test environment
      const payment = {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.BASE_URL}/payment/callback`
        },
        metadata: {
          orderId
        }
      };

      // In test mode, simulate payment
      const testPaymentId = crypto.randomUUID();
      
      return {
        id: testPaymentId,
        confirmation_url: `${process.env.BASE_URL}/payment/test/${testPaymentId}`,
        status: 'pending'
      };
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  static async processRefund(paymentId, amount) {
    try {
      // Simulate refund in test mode
      return {
        status: 'succeeded',
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        }
      };
    } catch (error) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  static async calculatePrepayment(order) {
    return order.price * 0.2; // 20% предоплата
  }

  static async processPayment(orderId, amount, method) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    try {
      // Здесь будет интеграция с платежными системами
      const paymentResult = await this.executePayment(amount, method);

      await order.update({
        paymentStatus: 'prepaid',
        paymentMethod: method,
        prepayment: amount
      });

      return paymentResult;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  static async executePayment(amount, method) {
    // Заглушка для демонстрации
    // Здесь будет реальная интеграция с платежными системами
    return {
      success: true,
      transactionId: Date.now().toString(),
      amount,
      method
    };
  }

  static async refund(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    try {
      // Здесь будет логика возврата средств
      await order.update({
        paymentStatus: 'refunded'
      });

      return true;
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;