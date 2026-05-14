import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'author';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  bio: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// ─── Post ────────────────────────────────────────────────────────────────────

export type PostStatus = 'draft' | 'published';

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  coverImagePublicId: string;
  status: PostStatus;
  author: Types.ObjectId | IUser;
  tags: string[];
  category: string;
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  post: Types.ObjectId | IPost;
  author: Types.ObjectId | IUser;
  parentComment?: Types.ObjectId | IComment | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Request extensions ───────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreatePostBody {
  title: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  tags?: string[];
  category?: string;
}

export interface UpdatePostBody extends Partial<CreatePostBody> {}

export interface CreateCommentBody {
  content: string;
  parentComment?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: PostStatus;
  category?: string;
  tag?: string;
}
