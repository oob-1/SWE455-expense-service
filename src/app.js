const express = require('express');
const pinoHttp = require('pino-http');
const logger = require('./lib/logger');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');

const expenses = require('./routes/expenses.routes');
const health   = require('./routes/health.routes');

function buildApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use(requestId);
  app.use(pinoHttp({ logger, customProps: (req) => ({ request_id: req.id }) }));

  app.use(health);
  app.use(expenses);

  app.use((req, res) => res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'route not found', request_id: req.id }}));
  app.use(errorHandler);
  return app;
}

module.exports = { buildApp };
