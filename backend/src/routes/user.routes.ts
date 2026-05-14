import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  updateProfile,
  uploadAvatar,
  changePassword,
  toggleUserStatus,
} from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadAvatar as uploadAvatarMiddleware } from '../config/cloudinary';

const router = Router();

// Admin only
router.get('/', protect, authorize('admin'), getAllUsers);
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

// Authenticated users
router.put(
  '/profile',
  protect,
  validate([
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
    body('bio').optional().isLength({ max: 250 }).withMessage('Bio cannot exceed 250 characters'),
  ]),
  updateProfile
);

// Avatar upload — multipart/form-data with field name "avatar"
router.post('/avatar', protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

router.put(
  '/change-password',
  protect,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ]),
  changePassword
);

export default router;
