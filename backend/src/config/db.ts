import mongoose from 'mongoose';

// Reuse the connection across Vercel serverless invocations (warm starts)
let cached = (global as { mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose;
if (!cached) {
  cached = (global as { mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose = { conn: null, promise: null };
}

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

  // Already connected — skip
  if (cached!.conn) return;

  // Reuse in-flight connection promise
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, { bufferCommands: false }).then((m) => {
      console.log(`✅  MongoDB connected — ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (err) {
    cached!.promise = null;
    console.error('❌  MongoDB connection failed:', err);
    process.exit(1);
  }
};

export default connectDB;
