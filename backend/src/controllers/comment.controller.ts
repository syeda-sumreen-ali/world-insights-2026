import { Request, Response, NextFunction } from 'express';
import * as CommentService from '../services/comment.service';
import { AuthRequest } from '../types';

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await CommentService.getPostComments(req.params.postId);
    res.json({ success: true, comments });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comment = await CommentService.createComment(req.params.postId, req.user!.id, req.body);
    res.status(201).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
};

export const removeComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await CommentService.deleteComment(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
