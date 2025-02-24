const handleHelp = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const message = 
      '❓ Помощь по использованию бота:\n\n' +
      '1️⃣ Регистрация:\n' +
      '- Нажмите "📝 Регистрация"\n' +
      '- Выберите тип аккаунта\n' +
      '- Следуйте инструкциям\n\n' +
      '2️⃣ Создание заказа:\n' +
      '- Нажмите "📝 Создать заказ"\n' +
      '- Выберите тип работ\n' +
      '- Укажите адрес\n' +
      '- Опишите задачу\n\n' +
      '3️⃣ Управление заказами:\n' +
      '- Нажмите "📋 Мои заказы"\n' +
      '- Выберите заказ для просмотра\n\n' +
      '4️⃣ Поддержка:\n' +
      '- Нажмите "📞 Поддержка"\n' +
      '- Выберите раздел или напишите оператору';

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📝 О регистрации', callback_data: 'faq_registration' },
            { text: '📋 О заказах', callback_data: 'faq_orders' }
          ],
          [
            { text: '👨‍💻 Написать в поддержку', url: 'https://t.me/Sherstikbot' }
          ]
        ]
      }
    };

    await bot.sendMessage(chatId, message, keyboard);
  } catch (error) {
    console.error('Help handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
};

module.exports = {
  handleHelp
}; 