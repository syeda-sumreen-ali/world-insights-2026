import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types';

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
