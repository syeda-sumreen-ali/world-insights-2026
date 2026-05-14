import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

const PORT = Number(process.env.PORT) || 5001;

if (process.env.VERCEL === '1') {
  // Vercel serverless — connect lazily on first request via app.use below
} else {
  // Local dev — connect once then start listening
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}  [${process.env.NODE_ENV ?? 'development'}]`);
    });
  }).catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
}

// Default export — used by Vercel as the serverless request handler.
export default app;
