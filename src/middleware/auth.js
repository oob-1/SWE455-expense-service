const { verify } = require('../lib/jwt');

module.exports = (req, res, next) => {
  const header = req.header('x-forwarded-authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'missing bearer token', request_id: req.id }});
  }
  try {
    const claims = verify(token);
    req.user = { id: Number(claims.sub), email: claims.email };
    next();
  } catch {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'invalid or expired token', request_id: req.id }});
  }
};
