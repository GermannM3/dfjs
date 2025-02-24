const { Sequelize } = require('sequelize');
const User = require('./user');
const Order = require('./order');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Инициализируем модели
User.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  telegramId: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  // ... остальные поля из User.js
}, {
  sequelize,
  modelName: 'User'
});

Order.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: Sequelize.ENUM('бурение', 'ремонт_скважин', 'канализация'),
    allowNull: false
  },
  // ... остальные поля из Order.js
}, {
  sequelize,
  modelName: 'Order'
});

// Настраиваем ассоциации
User.hasMany(Order, { 
  as: 'clientOrders', 
  foreignKey: 'clientId' 
});

User.hasMany(Order, { 
  as: 'contractorOrders', 
  foreignKey: 'contractorId' 
});

Order.belongsTo(User, { 
  as: 'client', 
  foreignKey: 'clientId' 
});

Order.belongsTo(User, { 
  as: 'contractor', 
  foreignKey: 'contractorId' 
});

// Добавляем статические методы
Order.findContractor = require('../services/orderDistribution').findBestContractor;

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database connection established and models synchronized');
  } catch (error) {
    console.error('Database synchronization error:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Order,
  syncDatabase
}; 