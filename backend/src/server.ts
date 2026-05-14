import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

const PORT = Number(process.env.PORT) || 5001;

// Connect to MongoDB.
// - Local: runs once before the server starts listening.
// - Vercel: module-level call; connection is cached across warm invocations.
connectDB().then(() => {
  // Only start the HTTP server in local / non-serverless environments.
  // Vercel invokes the exported `app` directly — no listen() needed there.
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}  [${process.env.NODE_ENV ?? 'development'}]`);
    });
  }
});

// Default export — used by Vercel as the serverless request handler.
export default app;
