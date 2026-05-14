import { Response, NextFunction } from 'express';
import User from '../models/User';
import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../types';

export const getAllUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allowed = ['name', 'bio'] as const;
    const updates: Record<string, unknown> = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user!.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new ApiError(404, 'User not found');

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/** Upload a new avatar image to Cloudinary and save URL on the user document. */
export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const file = req.file as (Express.Multer.File & { path?: string; filename?: string }) | undefined;
    if (!file?.path) throw new ApiError(400, 'No image file provided');

    const user = await User.findById(req.user!.id);
    if (!user) throw new ApiError(404, 'User not found');

    // Delete previous avatar from Cloudinary if it was uploaded (not a DiceBear URL)
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      // Extract public_id from URL — format: .../folder/public_id.ext
      const parts = user.avatar.split('/');
      const publicIdWithExt = parts.slice(-2).join('/'); // folder/filename
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId).catch(() => null);
    }

    user.avatar = file.path; // Cloudinary secure URL
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.id).select('+password');
    if (!user) throw new ApiError(404, 'User not found');

    const match = await user.comparePassword(currentPassword);
    if (!match) throw new ApiError(400, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (user._id.toString() === req.user!.id) {
      throw new ApiError(400, 'You cannot deactivate your own account');
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
