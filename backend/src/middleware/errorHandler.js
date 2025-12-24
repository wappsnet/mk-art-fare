import { sendError } from '../utils/response.js';

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  console.error('Error:', err);

  if (process.env.NODE_ENV === 'development') {
    sendError(res, err.message || 'Internal server error', 500);
  } else {
    sendError(res, 'Internal server error', 500);
  }
};

export const notFoundHandler = (req, res, _next) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
