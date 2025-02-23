const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  contractorId: {
    type: DataTypes.UUID
  },
  service: {
    type: DataTypes.ENUM('drilling', 'repair', 'sewage'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'assigned',
      'in_progress',
      'completed',
      'cancelled'
    ),
    defaultValue: 'pending'
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  photos: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  prepaymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  rating: {
    type: DataTypes.INTEGER
  },
  review: {
    type: DataTypes.TEXT
  },
  completedAt: {
    type: DataTypes.DATE
  }
});

module.exports = Order;