import axios from 'axios';

// In production VITE_API_URL = "https://your-backend.vercel.app"
// In development Vite's proxy rewrites /api → http://localhost:5001
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to /login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Posts ────────────────────────────────────────────────────────────────────
export const postApi = {
  getPublished: (params?: Record<string, string | number>) =>
    api.get('/posts', { params }),
  getBySlug: (slug: string) =>
    api.get(`/posts/slug/${slug}`),
  getById: (id: string) =>
    api.get(`/posts/${id}`),
  getMine: (params?: Record<string, string | number>) =>
    api.get('/posts/mine', { params }),
  getAllAdmin: (params?: Record<string, string | number>) =>
    api.get('/posts/admin/all', { params }),
  create: (formData: FormData) =>
    api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) =>
    api.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) =>
    api.delete(`/posts/${id}`),
  toggleStatus: (id: string, status: 'draft' | 'published') =>
    api.patch(`/posts/${id}/status`, { status }),
  getRelated: (id: string) =>
    api.get(`/posts/${id}/related`),
};

// ─── Comments ─────────────────────────────────────────────────────────────────
export const commentApi = {
  getByPost: (postId: string) =>
    api.get(`/comments/post/${postId}`),
  create: (postId: string, data: { content: string; parentComment?: string }) =>
    api.post(`/comments/post/${postId}`, data),
  delete: (id: string) =>
    api.delete(`/comments/${id}`),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get('/users'),
  updateProfile: (data: { name?: string; bio?: string }) =>
    api.put('/users/profile', data),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
  toggleStatus: (id: string) =>
    api.patch(`/users/${id}/toggle-status`),
};

export default api;
