import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import userRoutes from './routes/user.routes';
import errorHandler from './middleware/errorHandler';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,          // set this on Vercel → your frontend URL
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure MongoDB is connected before every request (critical for Vercel serverless)
app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database connection failed', error: String(err) });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
