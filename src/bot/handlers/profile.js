const { User } = require('../../models');

const handleProfile = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const user = await User.findOne({
      where: { telegramId: chatId.toString() }
    });

    if (!user) {
      return bot.sendMessage(
        chatId,
        'Для просмотра профиля необходимо зарегистрироваться.\nИспользуйте команду /register'
      );
    }

    const profileInfo = `🔑 Ваш профиль:\n\n` +
      `👤 ФИО: ${user.fullName}\n` +
      `📱 Телефон: ${user.phone || 'Не указан'}\n` +
      `📋 Статус: ${getStatusText(user.status)}\n` +
      (user.type === 'contractor' ? getContractorInfo(user) : '') +
      `\nДля изменения данных используйте команды:\n` +
      `/edit_name - Изменить ФИО\n` +
      `/edit_phone - Изменить телефон\n` +
      (user.type === 'contractor' ? getContractorCommands() : '');

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📝 Изменить профиль', callback_data: 'edit_profile' }],
          [{ text: '📊 Статистика', callback_data: 'show_stats' }]
        ]
      }
    };

    return bot.sendMessage(chatId, profileInfo, keyboard);
  } catch (error) {
    console.error('Profile handler error:', error);
    return bot.sendMessage(
      chatId,
      'Произошла ошибка при загрузке профиля. Попробуйте позже.'
    );
  }
};

const getStatusText = (status) => {
  const statusMap = {
    'active': '✅ Активен',
    'blocked': '🚫 Заблокирован',
    'pending': '⏳ На проверке'
  };
  return statusMap[status] || status;
};

const getContractorInfo = (user) => {
  return `📍 Радиус работы: ${user.workRadius || 0} км\n` +
    `⭐️ Рейтинг: ${user.rating}/5\n` +
    `🔧 Специализация: ${user.specialization?.join(', ') || 'Не указана'}\n` +
    `📦 Макс. заказов в день: ${user.maxDailyOrders}\n` +
    `✅ Верификация: ${user.isVerified ? 'Пройдена' : 'Не пройдена'}\n`;
};

const getContractorCommands = () => {
  return `/edit_radius - Изменить радиус работы\n` +
    `/edit_specialization - Изменить специализацию\n` +
    `/edit_workload - Изменить макс. количество заказов\n`;
};

module.exports = { handleProfile }; 