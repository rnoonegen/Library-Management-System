function getDbMode() {
  const profile = (process.env.DB_PROFILE || 'online').toLowerCase();

  if (profile === 'local' || profile === 'online') {
    return profile;
  }

  return 'online';
}

function getPostgreSQLConfig() {
  const mode = getDbMode();

  let config;

  if (process.env.DATABASE_URL) {
    const parsed = new URL(process.env.DATABASE_URL);
    config = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    };
  } else {
    config = {
      host: process.env.DB_HOST || (mode === 'local' ? 'localhost' : ''),
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
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
    local: 'Local PostgreSQL',
    online: 'Online PostgreSQL',
  };
  return labels[getDbMode()];
}

module.exports = {
  getDbMode,
  getPostgreSQLConfig,
  getDbModeLabel,
};
