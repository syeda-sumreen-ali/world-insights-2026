import Comment from '../models/Comment';
import Post from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { CreateCommentBody } from '../types';

export const getPostComments = async (postId: string): Promise<unknown[]> => {
  const comments = await Comment.find({ post: postId, parentComment: null })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();

  // Attach replies for each top-level comment
  const withReplies = await Promise.all(
    comments.map(async (c) => {
      const replies = await Comment.find({ parentComment: c._id })
        .populate('author', 'name avatar')
        .sort({ createdAt: 1 })
        .lean();
      return { ...c, replies };
    })
  );

  return withReplies;
};

export const createComment = async (
  postId: string,
  authorId: string,
  body: CreateCommentBody
) => {
  const post = await Post.findOne({ _id: postId, status: 'published' });
  if (!post) throw new ApiError(404, 'Post not found or not published');

  const comment = await Comment.create({
    content: body.content,
    post: postId,
    author: authorId,
    parentComment: body.parentComment || null,
  });

  await comment.populate('author', 'name avatar');
  return comment;
};

export const deleteComment = async (
  commentId: string,
  requesterId: string,
  requesterRole: string
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const isOwner = comment.author.toString() === requesterId;
  if (!isOwner && requesterRole !== 'admin') {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  // Also remove any replies
  await Comment.deleteMany({ parentComment: commentId });
  await comment.deleteOne();
};
