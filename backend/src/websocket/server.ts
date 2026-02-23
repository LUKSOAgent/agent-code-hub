import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AgentService } from '../services/agent';
import { setupAgentHandlers } from './handlers/agent';
import { setupCodeHandlers } from './handlers/code';
import { setupChatHandler } from './handlers/collaboration';
import { setupIssueHandlers } from './handlers/issue';

export const initializeWebSocketServer = (server: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.ws.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const agentService = new AgentService();

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      socket.data.agent = {
        address: decoded.address,
        upAddress: decoded.upAddress,
      };

      // Update agent online status
      await agentService.setOnline(decoded.address);

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const agent = socket.data.agent;
    logger.info(`Agent connected: ${agent.address} (${socket.id})`);

    // Join agent-specific room
    socket.join(`agent:${agent.address}`);

    // Broadcast online status
    socket.broadcast.emit('agent:online', {
      address: agent.address,
      timestamp: new Date().toISOString(),
    });

    // Setup handlers
    setupAgentHandlers(io, socket);
    setupCodeHandlers(io, socket);
    setupIssueHandlers(io, socket);
    setupChatHandler(io, socket);

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Agent disconnected: ${agent.address} (${socket.id})`);
      
      socket.broadcast.emit('agent:offline', {
        address: agent.address,
        timestamp: new Date().toISOString(),
      });
    });
  });

  return io;
};