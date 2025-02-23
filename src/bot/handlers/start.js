const models = require('../../models');
const { User } = models;

const handleStart = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const user = await User.findOne({
      where: { telegramId: chatId.toString() }
    });

    if (!user) {
      return bot.sendMessage(
        chatId,
        'Welcome to DrillFlow! Please register using /register command.'
      );
    }

    const welcomeBack = `Welcome back to DrillFlow!\n\nUse these commands:\n` +
      `/profile - View your profile\n` +
      `/orders - Manage orders\n` +
      `/support - Get help`;

    return bot.sendMessage(chatId, welcomeBack);
  } catch (error) {
    console.error('Start handler error:', error);
    return bot.sendMessage(
      chatId,
      'Sorry, there was an error. Please try again later.'
    );
  }
};

module.exports = { handleStart };