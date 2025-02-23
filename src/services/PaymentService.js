const crypto = require('crypto');
const axios = require('axios');

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
}

module.exports = PaymentService;