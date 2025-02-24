const { User } = require('../models');

const notifyContractors = async (contractors, order) => {
  const orderInfo = 
    '🆕 Новый заказ!\n\n' +
    `🔧 Тип работ: ${order.type}\n` +
    `📍 Район: ${order.address}\n` +
    `📝 Описание: ${order.description}\n\n` +
    '⏰ У вас есть 5 минут на принятие заказа!';

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Принять заказ', callback_data: `accept_order_${order.id}` },
          { text: '❌ Отклонить', callback_data: `decline_order_${order.id}` }
        ]
      ]
    }
  };

  // Отправляем уведомления подрядчикам
  const notifications = contractors.map(async (contractor) => {
    try {
      await bot.sendMessage(contractor.telegramId, orderInfo, keyboard);
      
      // Записываем в Redis информацию о том, что подрядчику отправлено уведомление
      await redis.setex(
        `order_notification:${order.id}:${contractor.id}`,
        300, // 5 минут
        'pending'
      );
    } catch (error) {
      console.error(`Error notifying contractor ${contractor.id}:`, error);
    }
  });

  await Promise.all(notifications);
};

const notifyClient = async (orderId, status, contractorInfo = null) => {
  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: User, as: 'client' }]
    });

    let message = '';
    let keyboard = null;

    switch (status) {
      case 'contractor_found':
        message = 
          '✅ Найден исполнитель для вашего заказа!\n\n' +
          `👤 ${contractorInfo.fullName}\n` +
          `⭐️ Рейтинг: ${contractorInfo.rating}/5\n` +
          `📱 Телефон: ${contractorInfo.phone}\n\n` +
          '💰 Для подтверждения заказа внесите предоплату 20%';
        
        keyboard = {
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Внести предоплату', callback_data: `prepay_order_${orderId}` }]
            ]
          }
        };
        break;

      case 'no_contractors':
        message = 
          '😔 К сожалению, сейчас нет свободных исполнителей.\n' +
          'Попробуйте разместить заказ позже или измените условия.';
        break;
    }

    await bot.sendMessage(order.client.telegramId, message, keyboard);
  } catch (error) {
    console.error('Client notification error:', error);
  }
};

module.exports = {
  notifyContractors,
  notifyClient
}; 