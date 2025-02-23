const TelegramBot = require('node-telegram-bot-api');
const { handleStart } = require('./handlers/start');
const { handleRegistration } = require('./handlers/registration');
const { handleOrders } = require('./handlers/orders');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Make bot available globally
global.bot = bot;

// Command handlers
bot.onText(/\/start/, handleStart);
bot.onText(/\/register/, handleRegistration);
bot.onText(/\/orders/, handleOrders);

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

module.exports = bot;