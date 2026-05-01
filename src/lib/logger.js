const pino = require('pino');
const config = require('../config');

module.exports = pino({
  level: config.logLevel,
  base: { service: 'expense-service', env: config.env },
  formatters: { level: (label) => ({ level: label }) },
  timestamp: pino.stdTimeFunctions.isoTime,
});
