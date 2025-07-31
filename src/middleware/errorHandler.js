const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error with request context
  logger.error('Error:', {
    requestId: req.id,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
  });

  // Default error
  let error = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  };
  let statusCode = 500;

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    error = {
      error: 'Validation Error',
      message: 'Invalid data provided',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    error = {
      error: 'Duplicate Entry',
      message: 'A record with this value already exists',
      fields: err.errors.map(e => e.path)
    };
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    error = {
      error: 'Invalid Reference',
      message: 'Referenced record does not exist'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error = {
      error: 'Invalid Token',
      message: 'The provided token is invalid'
    };
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error = {
      error: 'Token Expired',
      message: 'Your session has expired'
    };
  }

  // Custom application errors
  if (err.statusCode) {
    statusCode = err.statusCode;
    error = {
      error: err.error || 'Error',
      message: err.message
    };
  }

  // Send error response
  res.status(statusCode).json(error);
};

module.exports = errorHandler;