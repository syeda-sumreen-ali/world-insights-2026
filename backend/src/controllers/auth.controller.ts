import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await AuthService.registerUser(req.body);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await AuthService.loginUser(req.body);
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
