const { User, Order } = require('../../models');
const { updateContractorRating } = require('../../services/ratingService');

const handleRating = async (msg, orderId) => {
  const chatId = msg.chat.id;
  
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'contractor' },
        { model: User, as: 'client' }
      ]
    });

    if (!order || order.client.telegramId !== chatId.toString()) {
      return bot.sendMessage(
        chatId,
        'Заказ не найден или у вас нет прав для оценки.'
      );
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⭐️', callback_data: `rate_${orderId}_1` },
            { text: '⭐️⭐️', callback_data: `rate_${orderId}_2` },
            { text: '⭐️⭐️⭐️', callback_data: `rate_${orderId}_3` },
            { text: '⭐️⭐️⭐️⭐️', callback_data: `rate_${orderId}_4` },
            { text: '⭐️⭐️⭐️⭐️⭐️', callback_data: `rate_${orderId}_5` }
          ]
        ]
      }
    };

    await bot.sendMessage(
      chatId,
      'Оцените работу исполнителя:',
      keyboard
    );

    global.userStates[chatId] = {
      action: 'rating',
      orderId: orderId,
      step: 'waiting_rating'
    };

  } catch (error) {
    console.error('Rating handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже.'
    );
  }
};

const handleRatingSelection = async (query) => {
  const [, orderId, rating] = query.data.split('_');
  const chatId = query.message.chat.id;

  try {
    const order = await Order.findByPk(orderId);
    await order.update({
      rating: parseInt(rating)
    });

    await bot.sendMessage(
      chatId,
      'Спасибо за оценку! Пожалуйста, напишите краткий отзыв о работе исполнителя:'
    );

    global.userStates[chatId].step = 'waiting_review';
  } catch (error) {
    console.error('Rating selection error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже.'
    );
  }
};

const handleReview = async (msg) => {
  const chatId = msg.chat.id;
  const userState = global.userStates[chatId];

  try {
    const order = await Order.findByPk(userState.orderId);
    await order.update({
      review: msg.text
    });

    // Обновляем рейтинг подрядчика
    await updateContractorRating(order.contractorId);

    await bot.sendMessage(
      chatId,
      'Спасибо за ваш отзыв! Он поможет другим клиентам в выборе исполнителя.'
    );

    delete global.userStates[chatId];
  } catch (error) {
    console.error('Review handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка при сохранении отзыва. Попробуйте позже.'
    );
  }
};

module.exports = {
  handleRating,
  handleRatingSelection,
  handleReview
}; 