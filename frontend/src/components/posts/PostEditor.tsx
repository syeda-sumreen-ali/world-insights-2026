import { useState, useRef } from 'react';
import { PostFormData, PostStatus } from '../../types';

interface PostEditorProps {
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

const CATEGORIES = ['General', 'Technology', 'Design', 'Business', 'Lifestyle', 'Science', 'Other'];

const PostEditor = ({ initialData, onSubmit, isSubmitting, submitLabel = 'Save' }: PostEditorProps) => {
  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    status: initialData?.status || 'draft',
    tags: initialData?.tags || '',
    category: initialData?.category || 'General',
    coverImage: null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof PostFormData, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof PostFormData, value: string | PostStatus | File | null) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleImage = (file: File | null) => {
    set('coverImage', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof PostFormData, string>> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.length < 5) errs.title = 'Title must be at least 5 characters';
    if (!form.content.trim()) errs.content = 'Content is required';
    else if (form.content.length < 20) errs.content = 'Content must be at least 20 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Write a compelling title…"
          className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          placeholder="Write your post content here…"
          rows={14}
          className={`input resize-y ${errors.content ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
        {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
        <p className="mt-1 text-xs text-gray-400 text-right">{form.content.length} chars</p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Excerpt <span className="text-gray-400 text-xs">(optional — auto-generated if empty)</span>
        </label>
        <textarea
          value={form.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          placeholder="Short summary shown in listings…"
          rows={3}
          maxLength={300}
          className="input resize-none"
        />
        <p className="mt-1 text-xs text-gray-400 text-right">{form.excerpt.length}/300</p>
      </div>

      {/* Category + Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tags <span className="text-gray-400 text-xs">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="react, typescript, webdev"
            className="input"
          />
        </div>
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer
                     hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-lg object-cover" />
          ) : (
            <div className="text-gray-400 space-y-1">
              <svg className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Click to upload cover image</p>
              <p className="text-xs">JPG, PNG, WebP — max 5 MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImage(e.target.files?.[0] || null)}
        />
        {preview && (
          <button
            type="button"
            onClick={() => { handleImage(null); if (fileRef.current) fileRef.current.value = ''; }}
            className="mt-2 text-xs text-red-600 hover:underline"
          >
            Remove image
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => set('status', 'draft')}
          className="btn-secondary"
        >
          {isSubmitting ? 'Saving…' : 'Save as Draft'}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => set('status', 'published')}
          className="btn-primary"
        >
          {isSubmitting ? 'Publishing…' : submitLabel === 'Save' ? 'Publish' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PostEditor;
