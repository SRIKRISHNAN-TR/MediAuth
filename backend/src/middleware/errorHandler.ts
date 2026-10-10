import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('💥 Error:', err.message);

  if (err.name === 'ValidationError') {
    sendError(res, 'Validation failed', 400, err.message);
    return;
  }

  if (err.name === 'CastError') {
    sendError(res, 'Resource not found', 404);
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  sendError(res, 'Internal server error', 500, err.message);
};
