import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { postApi } from '../api/client';
import { PostFormData } from '../types';
import PostEditor from '../components/posts/PostEditor';
import usePageTitle from '../hooks/usePageTitle';

const CreatePost = () => {
  usePageTitle('Write a Post');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('excerpt', data.excerpt);
      formData.append('status', data.status);
      formData.append('category', data.category);
      // Split comma-separated tags
      data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tag) => formData.append('tags[]', tag));
      if (data.coverImage) formData.append('coverImage', data.coverImage);

      const res = await postApi.create(formData);
      navigate(`/posts/${res.data.post._id}/edit`, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
        <p className="text-gray-500 text-sm mt-1">Write something great. Save as draft or publish immediately.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <PostEditor onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Publish" />
      </div>
    </div>
  );
};

export default CreatePost;
