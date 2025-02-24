// Обновление статистики в реальном времени
async function updateStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    // Обновляем значения на странице
    document.querySelector('.stat-number.total').textContent = stats.totalOrders;
    document.querySelector('.stat-number.daily').textContent = stats.dailyOrders;
    document.querySelector('.stat-number.contractors').textContent = stats.activeContractors;
    document.querySelector('.stat-number.rating').textContent = `⭐️ ${stats.averageRating}`;
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// График заказов
const ctx = document.getElementById('ordersChart').getContext('2d');
const ordersChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [], // Будет заполнено датами
    datasets: [{
      label: 'Количество заказов',
      data: [], // Будет заполнено данными
      borderColor: '#2196F3',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Обновление графика
async function updateChart() {
  try {
    const response = await fetch('/api/orders/chart');
    const data = await response.json();
    
    ordersChart.data.labels = data.labels;
    ordersChart.data.datasets[0].data = data.values;
    ordersChart.update();
  } catch (error) {
    console.error('Error updating chart:', error);
  }
}

// Обновляем данные каждые 5 минут
setInterval(updateStats, 5 * 60 * 1000);
setInterval(updateChart, 5 * 60 * 1000);

// Инициализация
updateStats();
updateChart(); 