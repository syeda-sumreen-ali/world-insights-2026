import { Router } from 'express';
import { body } from 'express-validator';
import { getComments, addComment, removeComment } from '../controllers/comment.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET comments for a post — public
router.get('/post/:postId', getComments);

// POST a new comment — authenticated
router.post(
  '/post/:postId',
  protect,
  validate([body('content').trim().notEmpty().withMessage('Comment cannot be empty')]),
  addComment
);

// DELETE a comment — owner or admin
router.delete('/:id', protect, removeComment);

export default router;
