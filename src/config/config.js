module.exports = {
  // ... существующие настройки ...
  dashboard: {
    port: process.env.DASHBOARD_PORT || 3000,
    updateInterval: 5 * 60 * 1000, // 5 минут
    maxReviews: 5,
    topContractorsLimit: 10
  }
}; 