const jwt = require('jsonwebtoken');
const { jwt: cfg } = require('../config');

exports.verify = (token) =>
  jwt.verify(token, cfg.secret, { algorithms: ['HS256'], issuer: cfg.issuer });
