const dashboardService = require('../services/dashboardService');

async function getStats(req, res) {
  const stats = await dashboardService.getDashboardStats();
  res.json(stats);
}

module.exports = { getStats };
