import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
