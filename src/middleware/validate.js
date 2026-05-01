module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
        request_id: req.id,
      }
    });
  }
  req.body = result.data;
  next();
};
