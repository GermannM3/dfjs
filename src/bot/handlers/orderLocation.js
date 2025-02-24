const { User, Order } = require('../../models');
const { findNearestContractors } = require('../../services/contractorService');
const { notifyContractors } = require('../notifications');

const handleOrderLocation = async (msg) => {
  const chatId = msg.chat.id;
  const userState = global.userStates[chatId];

  try {
    // Сохраняем адрес и просим описание
    await bot.sendMessage(
      chatId,
      'Отлично! Теперь опишите задачу подробнее:\n' +
      '- Что конкретно нужно сделать?\n' +
      '- Есть ли особые требования?\n' +
      '- Когда удобно начать работы?\n\n' +
      'Также можете прикрепить фото (до 3 штук).'
    );

    userState.step = 'enter_description';
  } catch (error) {
    console.error('Order location handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже.'
    );
  }
};

const handleOrderDescription = async (msg) => {
  const chatId = msg.chat.id;
  const userState = global.userStates[chatId];

  try {
    userState.orderData.description = msg.text;
    
    // Запрашиваем подтверждение создания заказа
    const orderSummary = 
      '📋 Проверьте данные заказа:\n\n' +
      `🔧 Тип работ: ${userState.orderData.type}\n` +
      `📍 Адрес: ${userState.orderData.address}\n` +
      `📝 Описание: ${userState.orderData.description}\n\n` +
      '💰 Предоплата: 20% от стоимости работ\n\n' +
      'Всё верно?';

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Подтвердить', callback_data: 'confirm_order' },
            { text: '❌ Отменить', callback_data: 'cancel_order' }
          ]
        ]
      }
    };

    await bot.sendMessage(chatId, orderSummary, keyboard);
    userState.step = 'confirm_order';
  } catch (error) {
    console.error('Order description handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже.'
    );
  }
};

module.exports = {
  handleOrderLocation,
  handleOrderDescription
}; 