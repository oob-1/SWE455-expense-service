const router = require('express').Router();
const pkg = require('../../package.json');

router.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'expense-service', version: pkg.version }));

module.exports = router;
