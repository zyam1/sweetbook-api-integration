function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const detail = err.details || err.body || err.data || null;

  console.error(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${message}`);
  if (detail) console.error('  detail:', JSON.stringify(detail));
  if (err.stack) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    error: message,
    detail,
  });
}

module.exports = errorHandler;
