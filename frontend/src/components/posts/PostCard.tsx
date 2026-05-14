import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { getAvatarUrl } from '../../utils/avatar';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const formatted = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const authorName = typeof post.author === 'object' ? post.author.name : 'Unknown';
  const authorAvatar = typeof post.author === 'object' && post.author.avatar
    ? post.author.avatar
    : getAvatarUrl(authorName);

  return (
    <article className="card overflow-hidden group hover:shadow-md transition-shadow">
      {/* Cover */}
      <Link to={`/posts/${post.slug}`}>
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:opacity-95 transition-opacity"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-primary-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-5">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge-blue text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link to={`/posts/${post.slug}`}>
          <h2 className="text-lg font-semibold text-gray-900 leading-snug mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-7 w-7 rounded-full object-cover border border-gray-200"
            />
            <span className="text-xs font-medium text-gray-700">{authorName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {formatted && <span>{formatted}</span>}
            <span>{post.views} views</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
