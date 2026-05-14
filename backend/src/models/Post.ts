import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IPost } from '../types';

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [20, 'Content must be at least 20 characters'],
    },
    excerpt: { type: String, maxlength: [300, 'Excerpt cannot exceed 300 characters'] },
    coverImage: { type: String, default: '' },
    coverImagePublicId: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    category: { type: String, trim: true, default: 'General' },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: live comment count via populate
PostSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true,
});

PostSchema.pre('save', async function (next) {
  // Generate unique slug on title change
  if (this.isModified('title')) {
    const base = slugify(this.title, { lower: true, strict: true });
    this.slug = `${base}-${Date.now().toString(36)}`;
  }
  // Auto-excerpt from plain text
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content.replace(/<[^>]*>/g, '').substring(0, 200).trimEnd() + '…';
  }
  // Stamp publishedAt when going live
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Compound indexes for fast queries
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ author: 1, status: 1 });
// slug index is already created by unique:true on the field definition

export default mongoose.model<IPost>('Post', PostSchema);
