const handleSupport = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const message = 
      '📞 Служба поддержки DrillFlow\n\n' +
      '1️⃣ Для связи с оператором напишите @Sherstikbot\n\n' +
      '2️⃣ Часто задаваемые вопросы:\n' +
      '- Регистрация и профиль\n' +
      '- Создание и управление заказами\n' +
      '- Оплата и безопасность сделок\n\n' +
      '⚡️ Время работы: 24/7\n' +
      '⏱ Среднее время ответа: 5-15 минут';

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📝 Регистрация', callback_data: 'faq_registration' },
            { text: '📋 Заказы', callback_data: 'faq_orders' }
          ],
          [
            { text: '💳 Оплата', callback_data: 'faq_payment' },
            { text: '🔒 Безопасность', callback_data: 'faq_security' }
          ],
          [
            { text: '👨‍💻 Связаться с поддержкой', url: 'https://t.me/Sherstikbot' }
          ]
        ]
      }
    };

    await bot.sendMessage(chatId, message, keyboard);
  } catch (error) {
    console.error('Support handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже или напишите напрямую @Sherstikbot'
    );
  }
};

const handleFaqRegistration = async (msg) => {
  const chatId = msg.chat.id;
  
  const message = 
    '📝 Регистрация в системе:\n\n' +
    '1. Нажмите кнопку "Регистрация" в главном меню\n' +
    '2. Выберите тип аккаунта (клиент/подрядчик)\n' +
    '3. Заполните необходимые данные\n\n' +
    '❗️ Для подрядчиков требуется верификация:\n' +
    '- Подтверждение личности\n' +
    '- Подтверждение квалификации\n' +
    '- Проверка документов\n\n' +
    '⚡️ Время проверки: до 24 часов';

  await bot.sendMessage(chatId, message);
};

const handleFaqOrders = async (msg) => {
  const chatId = msg.chat.id;
  
  const message = 
    '📋 Работа с заказами:\n\n' +
    '1. Создание заказа:\n' +
    '- Выберите тип работ\n' +
    '- Укажите адрес\n' +
    '- Опишите задачу\n\n' +
    '2. Управление заказами:\n' +
    '- Просмотр статуса\n' +
    '- Общение с исполнителем\n' +
    '- Оплата и подтверждение\n\n' +
    '❗️ Отмена заказа возможна до начала работ';

  await bot.sendMessage(chatId, message);
};

module.exports = {
  handleSupport,
  handleFaqRegistration,
  handleFaqOrders
}; 