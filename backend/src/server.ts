import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { config } from './config';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeWebSocketServer } from './websocket/server';

// Routes
import { agentRoutes } from './api/routes/agents';
import { codeRoutes } from './api/routes/code';
import { issueRoutes } from './api/routes/issues';
import { projectRoutes } from './api/routes/projects';
import { authRoutes } from './api/routes/auth';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize WebSocket server
const io = initializeWebSocketServer(server);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.ws.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/projects', projectRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start HTTP server
    server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📡 WebSocket server initialized`);
      logger.info(`🔗 LUKSO chain: ${config.lukso.chainId}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});