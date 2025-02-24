const express = require('express');
const path = require('path');
const { User, Order } = require('../models');
const { Op } = require('sequelize');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница дашборда
app.get('/', async (req, res) => {
  try {
    // Получаем общую статистику
    const stats = await getDashboardStats();
    
    // Получаем топ подрядчиков
    const topContractors = await getTopContractors();

    // Получаем последние отзывы
    const recentReviews = await getRecentReviews();

    res.render('dashboard', {
      stats,
      topContractors,
      recentReviews
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Произошла ошибка при загрузке дашборда');
  }
});

// API для получения данных в реальном времени
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    dailyOrders,
    activeContractors,
    averageRating
  ] = await Promise.all([
    Order.count(),
    Order.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    }),
    User.count({
      where: {
        type: 'contractor',
        status: 'active'
      }
    }),
    Order.findAll({
      where: {
        rating: {
          [Op.not]: null
        }
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ]
    })
  ]);

  return {
    totalOrders,
    dailyOrders,
    activeContractors,
    averageRating: parseFloat(averageRating[0].get('avgRating')).toFixed(1)
  };
}

async function getTopContractors() {
  return User.findAll({
    where: {
      type: 'contractor',
      status: 'active',
      rating: {
        [Op.not]: null
      }
    },
    order: [['rating', 'DESC']],
    limit: 10,
    attributes: ['fullName', 'rating', 'specialization']
  });
}

async function getRecentReviews() {
  return Order.findAll({
    where: {
      review: {
        [Op.not]: null
      }
    },
    include: [
      {
        model: User,
        as: 'contractor',
        attributes: ['fullName']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: 5,
    attributes: ['rating', 'review', 'createdAt']
  });
}

const PORT = process.env.DASHBOARD_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dashboard server running on port ${PORT}`);
}); 