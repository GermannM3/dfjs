const { User } = require('../../models');

const handleRegistration = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const existingUser = await User.findOne({
      where: { telegramId: chatId.toString() }
    });

    if (existingUser) {
      return bot.sendMessage(
        chatId,
        'You are already registered!'
      );
    }

    // Создаем нового пользователя с базовыми данными
    await User.create({
      telegramId: chatId.toString(),
      type: 'client', // По умолчанию регистрируем как клиента
      fullName: msg.from.first_name || 'Unknown',
      status: 'pending'
    });

    return bot.sendMessage(
      chatId,
      'Registration successful! Welcome to DrillFlow.'
    );
  } catch (error) {
    console.error('Registration handler error:', error);
    return bot.sendMessage(
      chatId,
      'Sorry, there was an error during registration. Please try again later.'
    );
  }
};

module.exports = { handleRegistration }; 