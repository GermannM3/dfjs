const { Telegraf } = require('telegraf');
const logger = require('./utils/logger');

if (!process.env.BOT_TOKEN) {
  logger.error('BOT_TOKEN must be provided!');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработка ошибок
bot.catch((err, ctx) => {
  logger.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// Базовые команды
bot.command('start', async (ctx) => {
  try {
    await ctx.reply('Добро пожаловать в DrillFlow! Чем могу помочь?');
  } catch (error) {
    logger.error('Error in start command:', error);
  }
});

// Запуск бота
const launchBot = async () => {
  try {
    await bot.launch();
    logger.info('Bot started successfully');
  } catch (error) {
    logger.error('Error starting bot:', error);
    process.exit(1);
  }
};

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = {
  bot,
  launchBot
}; 