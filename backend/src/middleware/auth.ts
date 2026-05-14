import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { AuthRequest, UserRole } from '../types';

/** Require a valid JWT in the Authorization header. */
export const protect = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Not authenticated — please log in'));
  }

  try {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = { id: decoded.id as string, role: decoded.role as UserRole };
    next();
  } catch {
    next(new ApiError(401, 'Token is invalid or has expired'));
  }
};

/** Restrict access to specific roles. Call after `protect`. */
export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
