import { useState, useEffect, useCallback } from 'react';
import { postApi } from '../api/client';
import { Post, PaginatedResponse } from '../types';

interface UsePostsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  tag?: string;
}

interface UsePostsResult {
  posts: Post[];
  total: number;
  pages: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePublishedPosts = (options: UsePostsOptions = {}): UsePostsResult => {
  const [data, setData] = useState<Omit<UsePostsResult, 'isLoading' | 'error' | 'refetch'>>({
    posts: [],
    total: 0,
    pages: 1,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params: Record<string, string | number> = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.search) params.search = options.search;
    if (options.status) params.status = options.status;
    if (options.category) params.category = options.category;
    if (options.tag) params.tag = options.tag;

    postApi
      .getPublished(params)
      .then((res) => {
        if (!cancelled) {
          const d: PaginatedResponse<Post> = res.data;
          setData({ posts: d.posts, total: d.total, pages: d.pages, page: d.page });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load posts');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.page, options.limit, options.search, options.status, options.category, options.tag, tick]);

  return { ...data, isLoading, error, refetch };
};

export const useMyPosts = (options: UsePostsOptions = {}): UsePostsResult => {
  const [data, setData] = useState<Omit<UsePostsResult, 'isLoading' | 'error' | 'refetch'>>({
    posts: [],
    total: 0,
    pages: 1,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const params: Record<string, string | number> = {};
    if (options.page) params.page = options.page;
    if (options.search) params.search = options.search;
    if (options.status) params.status = options.status;

    postApi
      .getMine(params)
      .then((res) => {
        if (!cancelled) {
          const d: PaginatedResponse<Post> = res.data;
          setData({ posts: d.posts, total: d.total, pages: d.pages, page: d.page });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load posts');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.page, options.search, options.status, tick]);

  return { ...data, isLoading, error, refetch };
};
