import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { postApi } from '../../api/client';

interface PostsTableProps {
  posts: Post[];
  onRefetch: () => void;
  showAuthor?: boolean;
}

const PostsTable = ({ posts, onRefetch, showAuthor = false }: PostsTableProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setLoadingId(id);
    try {
      await postApi.delete(id);
      onRefetch();
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    setLoadingId(post._id);
    try {
      await postApi.toggleStatus(post._id, post.status === 'published' ? 'draft' : 'published');
      onRefetch();
    } finally {
      setLoadingId(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Title</th>
            {showAuthor && <th className="text-left py-3 px-4 font-semibold text-gray-600">Author</th>}
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Views</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {posts.map((post) => (
            <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">{post.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{post.category}</p>
              </td>
              {showAuthor && (
                <td className="py-3 px-4 text-gray-600">
                  {typeof post.author === 'object' ? post.author.name : '—'}
                </td>
              )}
              <td className="py-3 px-4">
                <span className={post.status === 'published' ? 'badge-green' : 'badge-yellow'}>
                  {post.status}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-500">{post.category}</td>
              <td className="py-3 px-4 text-gray-500">{post.views}</td>
              <td className="py-3 px-4 text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {/* Toggle publish */}
                  <button
                    onClick={() => handleToggleStatus(post)}
                    disabled={loadingId === post._id}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40"
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  {/* Edit */}
                  <Link
                    to={`/posts/${post._id}/edit`}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </Link>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(post._id)}
                    disabled={loadingId === post._id}
                    className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostsTable;
