module.exports = {
  initUser: (sequelize) => {
    const { User } = require('./user');
    
    User.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      // ... остальные поля
    }, {
      sequelize,
      modelName: 'User'
    });

    return User;
  },

  initOrder: (sequelize) => {
    const { Order } = require('./order');
    
    Order.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.ENUM('бурение', 'ремонт_скважин', 'канализация'),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      // ... остальные поля
    }, {
      sequelize,
      modelName: 'Order'
    });

    return Order;
  }
}; 