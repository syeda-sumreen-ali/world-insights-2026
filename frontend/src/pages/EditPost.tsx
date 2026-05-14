import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { postApi } from '../api/client';
import { Post, PostFormData } from '../types';
import PostEditor from '../components/posts/PostEditor';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/common/Loader';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  usePageTitle(post ? `Edit — ${post.title}` : 'Edit Post');

  useEffect(() => {
    if (!id) return;
    postApi
      .getById(id)
      .then((res) => setPost(res.data.post))
      .catch(() => setError('Post not found or access denied.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (data: PostFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('excerpt', data.excerpt);
      formData.append('status', data.status);
      formData.append('category', data.category);
      data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tag) => formData.append('tags[]', tag));
      if (data.coverImage) formData.append('coverImage', data.coverImage);

      await postApi.update(id, formData);
      setSuccess('Post updated successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to update post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader fullPage />;
  if (!post && error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/dashboard" className="btn-primary">← Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
          <p className="text-gray-500 text-sm mt-1">Update your post content and settings.</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
          ← Back
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 mb-6 flex items-center justify-between">
          <span>{success}</span>
          {post?.status === 'published' && (
            <Link to={`/posts/${post.slug}`} className="font-medium underline text-green-800">
              View post →
            </Link>
          )}
        </div>
      )}

      <div className="card p-6 sm:p-8">
        {post && (
          <PostEditor
            initialData={{
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              status: post.status,
              tags: post.tags.join(', '),
              category: post.category,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update & Publish"
          />
        )}
      </div>
    </div>
  );
};

export default EditPost;
