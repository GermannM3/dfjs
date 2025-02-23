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
    unique: true
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
    type: DataTypes.INTEGER
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  maxDailyOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'blocked', 'pending'),
    defaultValue: 'pending'
  }
});

module.exports = User;