import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(
      res,
      'Validation error',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  console.error('Unhandled server error:', err);
  return sendError(
    res,
    err.message || 'Internal server error',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}
