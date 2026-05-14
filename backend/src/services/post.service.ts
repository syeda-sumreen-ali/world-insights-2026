import Post from '../models/Post';
import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';
import { CreatePostBody, UpdatePostBody, PaginationQuery, PostStatus } from '../types';

const PAGE_SIZE = 12;

// ─── Public ───────────────────────────────────────────────────────────────────

export const getPublishedPosts = async (query: PaginationQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || PAGE_SIZE, 50);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'published' };

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.category) filter.category = query.category;
  if (query.tag) filter.tags = query.tag;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return { posts, total, page, pages: Math.ceil(total / limit) };
};

export const getPublishedPostBySlug = async (slug: string) => {
  const post = await Post.findOneAndUpdate(
    { slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name avatar bio');

  if (!post) throw new ApiError(404, 'Post not found');
  return post;
};

// ─── Authenticated ────────────────────────────────────────────────────────────

export const createPost = async (
  authorId: string,
  body: CreatePostBody,
  coverImageUrl?: string,
  coverImagePublicId?: string
) => {
  const post = await Post.create({
    ...body,
    author: authorId,
    coverImage: coverImageUrl || '',
    coverImagePublicId: coverImagePublicId || '',
  });
  return post;
};

export const getMyPosts = async (
  authorId: string,
  query: PaginationQuery
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || PAGE_SIZE, 50);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { author: authorId };
  if (query.status) filter.status = query.status;
  if (query.search) filter.$text = { $search: query.search };

  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  return { posts, total, page, pages: Math.ceil(total / limit) };
};

export const getAllPostsAdmin = async (query: PaginationQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || PAGE_SIZE, 50);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.search) filter.$text = { $search: query.search };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return { posts, total, page, pages: Math.ceil(total / limit) };
};

export const getPostById = async (id: string) => {
  const post = await Post.findById(id).populate('author', 'name avatar');
  if (!post) throw new ApiError(404, 'Post not found');
  return post;
};

export const updatePost = async (
  id: string,
  requesterId: string,
  requesterRole: string,
  body: UpdatePostBody,
  coverImageUrl?: string,
  coverImagePublicId?: string
) => {
  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  const isOwner = post.author.toString() === requesterId;
  if (!isOwner && requesterRole !== 'admin') {
    throw new ApiError(403, 'You can only edit your own posts');
  }

  // Delete old Cloudinary image if replaced
  if (coverImagePublicId && post.coverImagePublicId) {
    await cloudinary.uploader.destroy(post.coverImagePublicId);
  }

  Object.assign(post, body);
  if (coverImageUrl) {
    post.coverImage = coverImageUrl;
    post.coverImagePublicId = coverImagePublicId || '';
  }

  await post.save();
  return post;
};

export const deletePost = async (id: string, requesterId: string, requesterRole: string) => {
  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  const isOwner = post.author.toString() === requesterId;
  if (!isOwner && requesterRole !== 'admin') {
    throw new ApiError(403, 'You can only delete your own posts');
  }

  if (post.coverImagePublicId) {
    await cloudinary.uploader.destroy(post.coverImagePublicId);
  }

  await post.deleteOne();
};

export const togglePostStatus = async (
  id: string,
  requesterId: string,
  requesterRole: string,
  status: PostStatus
) => {
  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  const isOwner = post.author.toString() === requesterId;
  if (!isOwner && requesterRole !== 'admin') {
    throw new ApiError(403, 'Forbidden');
  }

  post.status = status;
  await post.save();
  return post;
};

/**
 * Return up to 4 published posts that share tags or category with the given post.
 * Sorted by number of matching tags (desc) then by recency.
 */
export const getRelatedPosts = async (postId: string) => {
  const post = await Post.findById(postId).lean();
  if (!post) throw new ApiError(404, 'Post not found');

  const related = await Post.find({
    _id: { $ne: postId },
    status: 'published',
    $or: [
      { tags: { $in: post.tags } },
      { category: post.category },
    ],
  })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(4)
    .lean();

  return related;
};
