import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] MONGODB_URI not provided. Running in resilient memory-store mode.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('[Database] MongoDB connected successfully to ' + uri.replace(/:[^:]*@/, ':****@'));
  } catch (err: any) {
    console.warn('[Database] MongoDB connection failed (' + err.message + '). Falling back to resilient in-memory database store.');
  }
}
