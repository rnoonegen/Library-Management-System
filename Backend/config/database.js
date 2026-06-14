function getDbMode() {
  const profile = (process.env.DB_PROFILE || '').toLowerCase();

  if (profile === 'local' || profile === 'online') {
    return profile;
  }

  // Backward compatibility with older USE_MYSQL flag
  if (process.env.USE_MYSQL === 'true') {
    return 'local';
  }

  return 'memory';
}

function isMySQLEnabled() {
  return getDbMode() !== 'memory';
}

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '3306', 10),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
  };
}

function getMySQLConfig() {
  const mode = getDbMode();
  if (mode === 'memory') return null;

  let config;

  if (process.env.DATABASE_URL) {
    config = parseDatabaseUrl(process.env.DATABASE_URL);
  } else {
    config = {
      host: process.env.DB_HOST || (mode === 'local' ? 'localhost' : ''),
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'library_db',
    };
  }

  if (mode === 'online' || process.env.DB_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    };
  }

  return config;
}

function getDbModeLabel() {
  const labels = {
    memory: 'In-Memory',
    local: 'Local MySQL',
    online: 'Online MySQL',
  };
  return labels[getDbMode()];
}

module.exports = {
  getDbMode,
  isMySQLEnabled,
  getMySQLConfig,
  getDbModeLabel,
};
