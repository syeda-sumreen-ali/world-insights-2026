import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPublishedPosts,
  getPostBySlug,
  createPost,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleStatus,
  getAllPostsAdmin,
  getRelatedPosts,
} from '../controllers/post.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../config/cloudinary';

const router = Router();

const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 150 }).withMessage('Title must be 5–150 characters'),
  body('content').trim().notEmpty().withMessage('Content is required')
    .isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
];

// Public
router.get('/', getPublishedPosts);
router.get('/slug/:slug', getPostBySlug);

// Author/Admin — own posts
router.get('/mine', protect, getMyPosts);
router.post('/', protect, upload.single('coverImage'), validate(postValidation), createPost);
router.get('/:id', protect, getPostById);
router.put('/:id', protect, upload.single('coverImage'), validate(postValidation), updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/status', protect, toggleStatus);

// Related posts — public
router.get('/:id/related', getRelatedPosts);

// Admin only
router.get('/admin/all', protect, authorize('admin'), getAllPostsAdmin);

export default router;
