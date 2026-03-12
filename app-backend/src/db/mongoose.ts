import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ultimate-ai-assistant';

/**
 * Connect to MongoDB
 */
export async function connectDatabase(): Promise<void> {
  try {
    console.log('🔄 Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI, {
      // Mongoose 6+ options
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('👋 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
}

/**
 * Get MongoDB connection status
 */
export function getDatabaseStatus(): { connected: boolean; name: string | null } {
  return {
    connected: mongoose.connection.readyState === 1,
    name: mongoose.connection.name
  };
}
