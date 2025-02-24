const { User, Order } = require('../../models');
const { findNearestContractors } = require('../../services/contractorService');

const handleCreateOrder = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const user = await User.findOne({
      where: { telegramId: chatId.toString() }
    });

    if (!user) {
      return bot.sendMessage(
        chatId,
        'Для создания заказа необходимо зарегистрироваться.\nИспользуйте команду /register'
      );
    }

    // Инициализируем состояние заказа
    global.userStates[chatId] = {
      step: 'select_type',
      orderData: {}
    };

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔨 Ремонт', callback_data: 'order_type_repair' },
            { text: '🏗 Строительство', callback_data: 'order_type_construction' }
          ],
          [
            { text: '🔧 Сантехника', callback_data: 'order_type_plumbing' },
            { text: '⚡️ Электрика', callback_data: 'order_type_electrical' }
          ]
        ]
      }
    };

    return bot.sendMessage(
      chatId,
      'Выберите тип работ:',
      keyboard
    );
  } catch (error) {
    console.error('Create order handler error:', error);
    return bot.sendMessage(
      chatId,
      'Произошла ошибка при создании заказа. Попробуйте позже.'
    );
  }
};

const handleOrderTypeSelection = async (query) => {
  const chatId = query.message.chat.id;
  const type = query.data.split('_')[2];

  try {
    global.userStates[chatId].orderData = {
      type: type
    };
    global.userStates[chatId].step = 'enter_address';

    return bot.sendMessage(
      chatId,
      'Отправьте адрес работ одним из способов:\n\n' +
      '1️⃣ Отправьте геолокацию\n' +
      '2️⃣ Напишите адрес текстом\n\n' +
      '❗️ Для отмены создания заказа используйте /cancel'
    );
  } catch (error) {
    console.error('Order type selection error:', error);
    return bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже.'
    );
  }
};

module.exports = {
  handleCreateOrder,
  handleOrderTypeSelection
}; 