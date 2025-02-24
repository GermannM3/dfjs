const { User, Order } = require('../../models');
const { Op } = require('sequelize');

const handleAdmin = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const admin = await User.findOne({
      where: { 
        telegramId: chatId.toString(),
        type: 'admin'
      }
    });

    if (!admin) {
      return bot.sendMessage(
        chatId,
        'У вас нет доступа к админ-панели.'
      );
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '👥 Пользователи', callback_data: 'admin_users' },
            { text: '📋 Заказы', callback_data: 'admin_orders' }
          ],
          [
            { text: '✅ Верификация', callback_data: 'admin_verification' },
            { text: '📊 Статистика', callback_data: 'admin_stats' }
          ]
        ]
      }
    };

    await bot.sendMessage(
      chatId,
      '🔧 Панель администратора\n\nВыберите раздел:',
      keyboard
    );
  } catch (error) {
    console.error('Admin handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже.'
    );
  }
};

const handleAdminUsers = async (query) => {
  const chatId = query.message.chat.id;

  try {
    const pendingContractors = await User.findAll({
      where: {
        type: 'contractor',
        status: 'pending'
      }
    });

    if (pendingContractors.length === 0) {
      return bot.sendMessage(
        chatId,
        'Нет подрядчиков, ожидающих верификации.'
      );
    }

    for (const contractor of pendingContractors) {
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Подтвердить', callback_data: `verify_${contractor.id}_approve` },
              { text: '❌ Отклонить', callback_data: `verify_${contractor.id}_reject` }
            ]
          ]
        }
      };

      await bot.sendMessage(
        chatId,
        `👤 Подрядчик на проверке:\n\n` +
        `ФИО: ${contractor.fullName}\n` +
        `Телефон: ${contractor.phone}\n` +
        `Специализация: ${contractor.specialization?.join(', ')}\n` +
        `Радиус работы: ${contractor.workRadius} км`,
        keyboard
      );
    }
  } catch (error) {
    console.error('Admin users handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка при загрузке списка пользователей.'
    );
  }
};

const handleAdminStats = async (query) => {
  const chatId = query.message.chat.id;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Статистика за день
    const dailyStats = await Order.findAndCountAll({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });

    // Средний рейтинг подрядчиков
    const contractors = await User.findAll({
      where: {
        type: 'contractor',
        rating: {
          [Op.not]: null
        }
      }
    });

    const avgRating = contractors.reduce((sum, c) => sum + c.rating, 0) / contractors.length;

    const stats = 
      '📊 Статистика:\n\n' +
      `Заказов за сегодня: ${dailyStats.count}\n` +
      `Активных подрядчиков: ${contractors.length}\n` +
      `Средний рейтинг: ${avgRating.toFixed(1)}⭐️\n`;

    await bot.sendMessage(chatId, stats);
  } catch (error) {
    console.error('Admin stats handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка при загрузке статистики.'
    );
  }
};

module.exports = {
  handleAdmin,
  handleAdminUsers,
  handleAdminStats
}; 