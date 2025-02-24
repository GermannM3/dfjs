const { Order, User } = require('../../models');
const { findNearestContractors } = require('../../services/contractorService');
const { notifyContractors, notifyClient } = require('../notifications');
const redis = require('../../config/redis');

const distributeOrder = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: User, as: 'client' }]
    });

    // Находим подходящих подрядчиков
    const contractors = await findNearestContractors(order.location, order.type);

    if (contractors.length === 0) {
      await notifyClient(orderId, 'no_contractors');
      return;
    }

    // Отправляем уведомления подрядчикам
    await notifyContractors(contractors, order);

    // Запускаем таймер на 5 минут
    setTimeout(async () => {
      await checkOrderAcceptance(orderId);
    }, 5 * 60 * 1000);

  } catch (error) {
    console.error('Order distribution error:', error);
  }
};

const handleOrderAcceptance = async (query) => {
  const [, orderId] = query.data.split('_');
  const contractorId = query.from.id;

  try {
    // Проверяем, не принят ли уже заказ
    const order = await Order.findByPk(orderId);
    if (order.status !== 'поиск_исполнителя') {
      return bot.answerCallbackQuery(query.id, {
        text: 'Этот заказ уже принят другим исполнителем',
        show_alert: true
      });
    }

    const contractor = await User.findOne({
      where: { telegramId: contractorId.toString() }
    });

    // Обновляем заказ
    await order.update({
      contractorId: contractor.id,
      status: 'принят'
    });

    // Уведомляем клиента
    await notifyClient(orderId, 'contractor_found', contractor);

    // Уведомляем подрядчика
    await bot.sendMessage(
      contractorId,
      '✅ Вы приняли заказ! Ожидайте внесения предоплаты клиентом.'
    );

  } catch (error) {
    console.error('Order acceptance error:', error);
    await bot.answerCallbackQuery(query.id, {
      text: 'Произошла ошибка. Попробуйте позже.',
      show_alert: true
    });
  }
};

const checkOrderAcceptance = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId);
    
    if (order.status === 'поиск_исполнителя') {
      // Если заказ не принят, уведомляем клиента
      await notifyClient(orderId, 'no_contractors');
      
      // Обновляем статус заказа
      await order.update({ status: 'отменен' });
    }
  } catch (error) {
    console.error('Check order acceptance error:', error);
  }
};

module.exports = {
  distributeOrder,
  handleOrderAcceptance
}; 