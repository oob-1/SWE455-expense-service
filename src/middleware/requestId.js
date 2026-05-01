const { v4: uuid } = require('uuid');

module.exports = (req, res, next) => {
  const id = req.header('X-Request-Id') || uuid();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};
