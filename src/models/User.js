const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  telegramId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('client', 'contractor', 'admin'),
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  specialization: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  workRadius: {
    type: DataTypes.INTEGER,
    validate: {
      max: 100 // максимальный радиус 100 км
    }
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  maxDailyOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  },
  documents: {
    type: DataTypes.JSONB, // для хранения ссылок на загруженные документы
    defaultValue: {}
  },
  location: {
    type: DataTypes.JSONB, // для хранения координат
    defaultValue: {}
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'blocked', 'pending'),
    defaultValue: 'pending'
  },
  notificationSettings: {
    type: DataTypes.JSONB,
    defaultValue: {
      telegram: true,
      sms: false
    }
  },
  deviceInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  lastIp: {
    type: DataTypes.STRING
  }
});

module.exports = User;