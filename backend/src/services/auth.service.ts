import User from '../models/User';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { RegisterBody, LoginBody } from '../types';

export const registerUser = async (body: RegisterBody) => {
  const existing = await User.findOne({ email: body.email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create(body);
  const token = signToken({ id: user._id.toString(), role: user.role });
  return { user, token };
};

export const loginUser = async (body: LoginBody) => {
  const user = await User.findOne({ email: body.email }).select('+password');
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid email or password');

  const match = await user.comparePassword(body.password);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ id: user._id.toString(), role: user.role });
  return { user, token };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};
