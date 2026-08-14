/**
 * Centralized Express Error Handling Middleware for SkillGraph API
 */
function errorHandler(err, req, res, next) {
  console.error(`❌ [API Error] ${req.method} ${req.originalUrl}:`, err.message);

  // Status code default
  const statusCode = err.statusCode || err.status || 500;

  // Mask database credentials or sensitive details if present in error message
  let cleanMessage = err.message || 'An unexpected error occurred.';
  if (cleanMessage.includes('password') || cleanMessage.includes('auth') || cleanMessage.includes('Credentials')) {
    cleanMessage = 'Database connection or authentication error. Please verify server configuration.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: cleanMessage
    }
  });
}

/**
 * 404 Not Found Middleware for unhandled routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
