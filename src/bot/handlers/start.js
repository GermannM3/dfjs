const { User } = require('../../models');

const handleStart = async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await User.findOne({
      where: { telegramId: chatId.toString() }
    });

    let message;
    let keyboard;

    if (user) {
      message = `👋 Добро пожаловать, ${user.fullName}!\n\nВыберите действие:`;
      
      keyboard = {
        reply_markup: {
          keyboard: [
            ['📝 Создать заказ', '📋 Мои заказы'],
            ['👤 Профиль', '📞 Поддержка'],
            ['❓ Помощь', '⚙️ Настройки']
          ],
          resize_keyboard: true
        }
      };
    } else {
      message = '👋 Добро пожаловать в DrillFlow!\n\nДля начала работы нажмите кнопку "Регистрация":';
      
      keyboard = {
        reply_markup: {
          keyboard: [
            ['📝 Регистрация'],
            ['❓ Помощь', '📞 Поддержка']
          ],
          resize_keyboard: true
        }
      };
    }

    await bot.sendMessage(chatId, message, keyboard);
  } catch (error) {
    console.error('Start handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
};

module.exports = {
  handleStart
};