require('dotenv').config();
const { sequelize, syncDatabase } = require('./models');
const { launchBot } = require('./bot');
const logger = require('./utils/logger');

const start = async () => {
  try {
    // Синхронизируем базу данных
    await syncDatabase();
    logger.info('Database synchronized successfully');

    // Запускаем бота
    await launchBot();
    logger.info('Bot started successfully');

  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
};

// Обработка graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  await sequelize.close();
  process.exit(0);
});

start();