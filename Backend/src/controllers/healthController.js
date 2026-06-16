const { getPool } = require('../config/connection');
const { getDbMode } = require('../config/database');

function healthCheck(req, res) {
  res.json({
    status: 'ok',
    dbMode: getPool() ? getDbMode() : 'disconnected',
  });
}

module.exports = { healthCheck };
