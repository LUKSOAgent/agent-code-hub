import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { config } from './index';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('✅ Connected to MongoDB');
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};