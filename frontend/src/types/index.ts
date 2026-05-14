// ─── Domain types ─────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'author';
export type PostStatus = 'draft' | 'published';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  status: PostStatus;
  author: Pick<User, '_id' | 'name' | 'avatar' | 'bio'>;
  tags: string[];
  category: string;
  views: number;
  publishedAt?: string;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  post: string;
  author: Pick<User, '_id' | 'name' | 'avatar'>;
  parentComment?: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean;
  posts: T[];
  total: number;
  page: number;
  pages: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// ─── Form payloads ────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  status: PostStatus;
  tags: string;
  category: string;
  coverImage?: File | null;
}
