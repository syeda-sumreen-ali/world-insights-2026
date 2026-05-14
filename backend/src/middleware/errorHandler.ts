import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: string;
}

const errorHandler = (
  err: MongoError | ApiError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation
    statusCode = 400;
    message = err.message;
  } else if ((err as MongoError).code === 11000) {
    // Duplicate key
    const field = Object.keys((err as MongoError).keyValue || {})[0];
    statusCode = 409;
    message = `${field ? `"${field}"` : 'A field'} already exists`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${(err as MongoError).path}"`;
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
