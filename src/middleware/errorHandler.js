const logger = require('../lib/logger');

module.exports = (err, req, res, _next) => {
  logger.error({ err: err.message, stack: err.stack, request_id: req.id }, 'unhandled');
  if (res.headersSent) return;
  res.status(err.status || 500).json({
    error: {
      code:       err.code || 'INTERNAL_ERROR',
      message:    err.expose ? err.message : 'internal server error',
      request_id: req.id,
    }
  });
};
