import { env } from '../config/env.js';

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const isProduction = env.nodeEnv === 'production';

  if (statusCode >= 500) {
    console.error({
      message: error.message,
      method: req.method,
      path: req.originalUrl,
      stack: error.stack
    });
  }

  return res.status(statusCode).json({
    error: error.message || 'An unexpected error occurred.',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(!isProduction && { stack: error.stack })
  });
};