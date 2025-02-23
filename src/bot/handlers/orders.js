const { User } = require('../../models');

const handleOrders = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const user = await User.findOne({
      where: { telegramId: chatId.toString() }
    });

    if (!user) {
      return bot.sendMessage(
        chatId,
        'Please register first using /register command.'
      );
    }

    // Базовая реализация
    return bot.sendMessage(
      chatId,
      'Orders functionality is coming soon!'
    );
  } catch (error) {
    console.error('Orders handler error:', error);
    return bot.sendMessage(
      chatId,
      'Sorry, there was an error. Please try again later.'
    );
  }
};

module.exports = { handleOrders }; 