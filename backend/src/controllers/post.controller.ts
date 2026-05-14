import { Response, NextFunction } from 'express';
import * as PostService from '../services/post.service';

export const getRelatedPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const posts = await PostService.getRelatedPosts(req.params.id);
    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};
import { AuthRequest } from '../types';

// ─── Public ───────────────────────────────────────────────────────────────────

export const getPublishedPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await PostService.getPublishedPosts(req.query as Record<string, string>);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const getPostBySlug = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await PostService.getPublishedPostBySlug(req.params.slug);
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// ─── Author ───────────────────────────────────────────────────────────────────

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const file = req.file as Express.Multer.File & { path?: string; filename?: string };
    const post = await PostService.createPost(
      req.user!.id,
      req.body,
      file?.path,
      file?.filename
    );
    res.status(201).json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

export const getMyPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await PostService.getMyPosts(req.user!.id, req.query as Record<string, string>);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const getPostById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await PostService.getPostById(req.params.id);
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const file = req.file as Express.Multer.File & { path?: string; filename?: string };
    const post = await PostService.updatePost(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body,
      file?.path,
      file?.filename
    );
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await PostService.deletePost(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

export const toggleStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await PostService.togglePostStatus(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body.status
    );
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllPostsAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await PostService.getAllPostsAdmin(req.query as Record<string, string>);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};
