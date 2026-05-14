import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postApi, commentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Post, Comment } from '../types';
import { getAvatarUrl } from '../utils/avatar';
import Loader from '../components/common/Loader';
import PostCard from '../components/posts/PostCard';
import usePageTitle from '../hooks/usePageTitle';

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [related, setRelated] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Dynamic page title — updates once the post loads
  usePageTitle(post ? post.title : undefined);

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setRelated([]);

    postApi
      .getBySlug(slug)
      .then((res) => {
        const p: Post = res.data.post;
        setPost(p);
        // Fetch comments and related posts in parallel
        return Promise.all([
          commentApi.getByPost(p._id),
          postApi.getRelated(p._id),
        ]).then(([commentsRes, relatedRes]) => {
          setComments(commentsRes.data.comments);
          setRelated(relatedRes.data.posts);
        });
      })
      .catch(() => setError('Post not found.'))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const refreshComments = () => {
    if (!post) return;
    commentApi.getByPost(post._id).then((res) => setComments(res.data.comments));
  };

  const submitComment = async (content: string, parentId?: string) => {
    if (!post || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await commentApi.create(post._id, { content, parentComment: parentId });
      setCommentText('');
      setReplyText('');
      setReplyingTo(null);
      refreshComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    await commentApi.delete(id);
    refreshComments();
  };

  if (isLoading) return <Loader fullPage />;
  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-6">{error || 'Post not found.'}</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const canEdit =
    user &&
    (user.role === 'admin' ||
      (typeof post.author === 'object' && post.author._id === user._id));

  const authorName = typeof post.author === 'object' ? post.author.name : 'Unknown';
  const authorAvatar =
    typeof post.author === 'object' && post.author.avatar
      ? post.author.avatar
      : getAvatarUrl(authorName);
  const authorBio = typeof post.author === 'object' ? post.author.bio : '';

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((t) => <span key={t} className="badge-blue">{t}</span>)}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-5">
        {post.title}
      </h1>

      {/* Author + meta bar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={authorName}
            className="h-11 w-11 rounded-full object-cover border border-gray-200"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">{authorName}</p>
            {publishedDate && <p className="text-xs text-gray-400">{publishedDate}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">{post.views} views</span>
          {canEdit && (
            <Link to={`/posts/${post._id}/edit`} className="btn-secondary text-xs px-3 py-1.5">
              Edit Post
            </Link>
          )}
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full rounded-xl mb-10 object-cover max-h-96"
        />
      )}

      {/* Content */}
      <article className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base mb-12">
        {post.content}
      </article>

      {/* Author bio card */}
      <div className="card p-5 flex items-start gap-4 mb-12">
        <img
          src={authorAvatar}
          alt={authorName}
          className="h-14 w-14 rounded-full object-cover border border-gray-200 flex-shrink-0"
        />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{authorName}</p>
          <p className="text-xs text-gray-400 mb-1 capitalize">{typeof post.author === 'object' ? (post.author as { role?: string }).role || 'Author' : 'Author'}</p>
          {authorBio ? (
            <p className="text-sm text-gray-500 leading-relaxed">{authorBio}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No bio yet.</p>
          )}
        </div>
      </div>

      {/* ── Related posts ──────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {related.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        </section>
      )}

      {/* ── Comments ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Comments ({comments.length})
        </h2>

        {isAuthenticated ? (
          <div className="card p-4 mb-8">
            <div className="flex items-start gap-3">
              <img
                src={user?.avatar || getAvatarUrl(user?.name || '')}
                alt={user?.name}
                className="h-8 w-8 rounded-full object-cover border border-gray-200 mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  rows={3}
                  className="input resize-none mb-3"
                />
                <button
                  onClick={() => submitComment(commentText)}
                  disabled={isSubmitting || !commentText.trim()}
                  className="btn-primary text-sm"
                >
                  {isSubmitting ? 'Posting…' : 'Post comment'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-5 mb-8 text-center">
            <p className="text-sm text-gray-500">
              <Link to="/login" className="text-primary-600 font-medium">Sign in</Link> to leave a comment.
            </p>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No comments yet — be the first!</p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comment.author.avatar || getAvatarUrl(comment.author.name)}
                      alt={comment.author.name}
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{comment.author.name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {isAuthenticated && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Reply
                      </button>
                    )}
                    {user && (user.role === 'admin' || user._id === comment.author._id) && (
                      <button
                        onClick={() => deleteComment(comment._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed ml-10">{comment.content}</p>

                {/* Reply input */}
                {replyingTo === comment._id && (
                  <div className="ml-10 mt-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author.name}…`}
                      rows={2}
                      className="input resize-none mb-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitComment(replyText, comment._id)}
                        disabled={isSubmitting || !replyText.trim()}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        Post reply
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
                    {comment.replies.map((reply) => (
                      <div key={reply._id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <img
                              src={reply.author.avatar || getAvatarUrl(reply.author.name)}
                              alt={reply.author.name}
                              className="h-6 w-6 rounded-full object-cover border border-gray-200"
                            />
                            <span className="text-sm font-semibold text-gray-800">{reply.author.name}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {user && (user.role === 'admin' || user._id === reply.author._id) && (
                            <button
                              onClick={() => deleteComment(reply._id)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 ml-8">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PostDetail;
