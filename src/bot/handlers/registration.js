const { User } = require('../../models');

const handleRegistration = async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await User.findOne({
      where: { telegramId: chatId.toString() }
    });

    if (user) {
      return bot.sendMessage(
        chatId,
        'Вы уже зарегистрированы в системе.\n' +
        'Используйте кнопку "👤 Профиль" для просмотра данных.'
      );
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '👤 Клиент', callback_data: 'register_client' },
            { text: '🔧 Подрядчик', callback_data: 'register_contractor' }
          ]
        ]
      }
    };

    await bot.sendMessage(
      chatId,
      'Выберите тип аккаунта:',
      keyboard
    );
  } catch (error) {
    console.error('Registration handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
};

const handleRegistrationType = async (query) => {
  const chatId = query.message.chat.id;
  const type = query.data.split('_')[1];

  try {
    global.userStates[chatId] = {
      step: 'registration_name',
      type: type,
      data: {}
    };

    if (type === 'contractor') {
      await bot.sendMessage(
        chatId,
        'Регистрация подрядчика.\n\n' +
        'Шаг 1 из 4: Введите ваше полное имя'
      );
    } else {
      await bot.sendMessage(
        chatId,
        'Регистрация клиента.\n\n' +
        'Шаг 1 из 2: Введите ваше имя'
      );
    }
  } catch (error) {
    console.error('Registration type handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
};

const handleRegistrationData = async (msg) => {
  const chatId = msg.chat.id;
  const userState = global.userStates[chatId];
  const text = msg.text;

  try {
    switch (userState.step) {
      case 'registration_name':
        userState.data.fullName = text;
        userState.step = 'registration_phone';
        
        await bot.sendMessage(
          chatId,
          `${userState.type === 'contractor' ? 'Шаг 2 из 4' : 'Шаг 2 из 2'}: Введите ваш номер телефона\n` +
          'Формат: +7XXXXXXXXXX'
        );
        break;

      case 'registration_phone':
        if (!/^\+7\d{10}$/.test(text)) {
          await bot.sendMessage(
            chatId,
            'Неверный формат номера.\n' +
            'Пожалуйста, введите номер в формате: +7XXXXXXXXXX'
          );
          return;
        }

        userState.data.phone = text;

        if (userState.type === 'contractor') {
          userState.step = 'registration_specialization';
          const keyboard = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🚰 Бурение', callback_data: 'spec_drilling' },
                  { text: '🔧 Ремонт скважин', callback_data: 'spec_repair' }
                ],
                [
                  { text: '🏗 Канализация', callback_data: 'spec_sewage' }
                ]
              ]
            }
          };
          await bot.sendMessage(
            chatId,
            'Шаг 3 из 4: Выберите вашу специализацию',
            keyboard
          );
        } else {
          // Завершаем регистрацию клиента
          await finishRegistration(chatId, userState);
        }
        break;

      case 'registration_radius':
        const radius = parseInt(text);
        if (isNaN(radius) || radius < 1 || radius > 100) {
          await bot.sendMessage(
            chatId,
            'Пожалуйста, введите число от 1 до 100'
          );
          return;
        }

        userState.data.workRadius = radius;
        await finishRegistration(chatId, userState);
        break;
    }
  } catch (error) {
    console.error('Registration data handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
};

const handleSpecialization = async (query) => {
  const chatId = query.message.chat.id;
  const userState = global.userStates[chatId];
  const spec = query.data.split('_')[1];

  try {
    userState.data.specialization = spec;
    userState.step = 'registration_radius';

    await bot.sendMessage(
      chatId,
      'Шаг 4 из 4: Укажите радиус работы в километрах (от 1 до 100)'
    );
  } catch (error) {
    console.error('Specialization handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
};

const finishRegistration = async (chatId, userState) => {
  try {
    const userData = {
      telegramId: chatId.toString(),
      type: userState.type,
      fullName: userState.data.fullName,
      phone: userState.data.phone,
      status: userState.type === 'contractor' ? 'pending' : 'active'
    };

    if (userState.type === 'contractor') {
      userData.specialization = userState.data.specialization;
      userData.workRadius = userState.data.workRadius;
    }

    await User.create(userData);

    let message;
    let keyboard;

    if (userState.type === 'contractor') {
      message = 'Регистрация подрядчика завершена!\n\n' +
                'Ваша заявка отправлена на проверку. ' +
                'Это может занять до 24 часов.\n\n' +
                'Мы уведомим вас о результатах проверки.';
      
      keyboard = {
        reply_markup: {
          keyboard: [
            ['👤 Профиль'],
            ['❓ Помощь', '📞 Поддержка']
          ],
          resize_keyboard: true
        }
      };
    } else {
      message = 'Регистрация успешно завершена!\n\n' +
                'Теперь вы можете создавать заказы и управлять ими.';
      
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
    }

    await bot.sendMessage(chatId, message, keyboard);
    delete global.userStates[chatId];
  } catch (error) {
    console.error('Finish registration error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка при завершении регистрации. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
};

module.exports = {
  handleRegistration,
  handleRegistrationType,
  handleRegistrationData,
  handleSpecialization
}; 