const TelegramBot = require('node-telegram-bot-api');
const { handleStart } = require('./handlers/start');
const { handleRegistration, handleRegistrationType, handleSpecialization } = require('./handlers/registration');
const { handleOrders } = require('./handlers/orders');
const { handleProfile } = require('./handlers/profile');
const { handleSupport, handleFaqRegistration, handleFaqOrders } = require('./handlers/support');
const { handleCreateOrder, handleOrderTypeSelection } = require('./handlers/createOrder');
const { handleOrderLocation, handleOrderDescription } = require('./handlers/orderLocation');
const { handleOrderAcceptance } = require('./handlers/orderDistribution');
const { handleRating, handleRatingSelection, handleReview } = require('./handlers/rating');
const { handleAdmin, handleAdminUsers, handleAdminStats } = require('./handlers/admin');
const { handleHelp } = require('./handlers/help');
require('dotenv').config();

// Инициализируем глобальное хранилище состояний пользователей
global.userStates = {};

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Make bot available globally
global.bot = bot;

// Command handlers
bot.onText(/\/start/, (msg) => {
  // Инициализируем состояние пользователя при старте
  const chatId = msg.chat.id;
  global.userStates[chatId] = {
    step: 'start'
  };
  handleStart(msg);
});
bot.onText(/\/register/, handleRegistration);
bot.onText(/\/orders/, handleOrders);
bot.onText(/\/profile/, handleProfile);
bot.onText(/\/support/, handleSupport);
bot.onText(/\/create_order/, handleCreateOrder);
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Доступные команды:\n' +
    '/register - Регистрация в системе\n' +
    '/profile - Ваш профиль\n' +
    '/orders - Управление заказами\n' +
    '/support - Служба поддержки\n' +
    '/help - Справка'
  );
});

// Добавляем команду для админ-панели
bot.onText(/\/admin/, handleAdmin);

// Очистка состояния при отмене
bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id;
  delete global.userStates[chatId];
  bot.sendMessage(chatId, 'Действие отменено. Используйте /help для просмотра доступных команд.');
});

// Callback query handler
bot.on('callback_query', async (query) => {
  try {
    const chatId = query.message.chat.id;
    
    switch (true) {
      case query.data === 'register':
        await handleRegistration(query.message);
        break;
      
      case query.data.startsWith('register_'):
        await handleRegistrationType(query);
        break;
      
      case query.data.startsWith('spec_'):
        await handleSpecialization(query);
        break;
      
      case query.data.startsWith('order_type_'):
        await handleOrderTypeSelection(query);
        break;
      
      case query.data.startsWith('accept_order_'):
        await handleOrderAcceptance(query);
        break;
      
      case query.data.startsWith('rate_'):
        await handleRatingSelection(query);
        break;
      
      case query.data === 'create_order':
        await handleCreateOrder(query.message);
        break;
      
      case query.data === 'my_orders':
        await handleOrders(query.message);
        break;
      
      case query.data === 'profile':
        await handleProfile(query.message);
        break;
      
      case query.data === 'help':
        await handleSupport(query.message);
        break;
      
      case query.data.startsWith('faq_'):
        const faqType = query.data.split('_')[1];
        switch (faqType) {
          case 'registration':
            await handleFaqRegistration(query.message);
            break;
          case 'orders':
            await handleFaqOrders(query.message);
            break;
          case 'payment':
          case 'security':
            await bot.sendMessage(chatId, 'Раздел находится в разработке');
            break;
        }
        break;
      
      case query.data.startsWith('admin_'):
        const action = query.data.split('_')[1];
        switch (action) {
          case 'users':
            await handleAdminUsers(query);
            break;
          case 'stats':
            await handleAdminStats(query);
            break;
        }
        break;
    }

    // Убираем часики с кнопки
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Callback query handler error:', error);
    await bot.sendMessage(
      query.message.chat.id,
      'Произошла ошибка. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
});

// Обработка геолокации
bot.on('location', async (msg) => {
  const chatId = msg.chat.id;
  const userState = global.userStates[chatId] || {};

  if (userState.step === 'enter_address') {
    await handleOrderLocation(msg);
  }
});

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const userState = global.userStates[chatId] || {};

  try {
    switch (msg.text) {
      case '📝 Создать заказ':
        await handleCreateOrder(msg);
        break;

      case '📋 Мои заказы':
        await handleOrders(msg);
        break;

      case '👤 Профиль':
        await handleProfile(msg);
        break;

      case '📞 Поддержка':
        await handleSupport(msg);
        break;

      case '❓ Помощь':
        await handleHelp(msg);
        break;

      case '📝 Регистрация':
        await handleRegistration(msg);
        break;

      default:
        if (userState.step === 'enter_description') {
          await handleOrderDescription(msg);
        } else if (userState.step === 'waiting_review') {
          await handleReview(msg);
        } else if (userState.step === 'registration') {
          await handleRegistrationData(msg);
        }
    }
  } catch (error) {
    console.error('Message handler error:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Попробуйте позже или обратитесь в поддержку @Sherstikbot'
    );
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

module.exports = bot;