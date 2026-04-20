const levels = { info: '✅', warn: '⚠️ ', error: '❌' };

const log = (level, message, meta = '') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${levels[level] || '📌'} [${level.toUpperCase()}] ${message}`, meta);
};

module.exports = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};
