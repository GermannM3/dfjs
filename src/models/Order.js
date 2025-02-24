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
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  contractorId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('бурение', 'ремонт_скважин', 'канализация'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'новый',
      'поиск_исполнителя',
      'принят',
      'в_работе',
      'выполнен',
      'отменен'
    ),
    defaultValue: 'новый'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  photos: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  prepayment: {
    type: DataTypes.DECIMAL(10, 2)
  },
  completionDate: {
    type: DataTypes.DATE
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: DataTypes.TEXT
  }
});

module.exports = Order;