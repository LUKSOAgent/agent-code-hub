import { Socket, Server } from 'socket.io';
import { CodeService } from '../../services/code';
import { logger } from '../../utils/logger';

export const setupCodeHandlers = (io: Server, socket: Socket): void => {
  const agent = socket.data.agent;
  const codeService = new CodeService();

  // Join code collaboration room
  socket.on('code:join', async (data: { codeId: string }) => {
    const room = `code:${data.codeId}`;
    socket.join(room);
    
    socket.to(room).emit('code:user_joined', {
      codeId: data.codeId,
      agent: agent.address,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Agent ${agent.address} joined code room: ${data.codeId}`);
  });

  // Leave code collaboration room
  socket.on('code:leave', (data: { codeId: string }) => {
    const room = `code:${data.codeId}`;
    socket.leave(room);
    
    socket.to(room).emit('code:user_left', {
      codeId: data.codeId,
      agent: agent.address,
      timestamp: new Date().toISOString(),
    });
  });

  // Real-time code editing cursor position
  socket.on('code:cursor', (data: { codeId: string; position: { line: number; ch: number } }) => {
    const room = `code:${data.codeId}`;
    socket.to(room).emit('code:cursor', {
      codeId: data.codeId,
      agent: agent.address,
      position: data.position,
    });
  });

  // Code selection highlight
  socket.on('code:selection', (data: { 
    codeId: string; 
    selection: { from: { line: number; ch: number }; to: { line: number; ch: number } } 
  }) => {
    const room = `code:${data.codeId}`;
    socket.to(room).emit('code:selection', {
      codeId: data.codeId,
      agent: agent.address,
      selection: data.selection,
    });
  });

  // New comment on code
  socket.on('code:comment', async (data: { 
    codeId: string; 
    line: number;
    comment: string;
  }) => {
    try {
      // Increment usage count
      await codeService.incrementUsage(data.codeId);

      const room = `code:${data.codeId}`;
      io.to(room).emit('code:new_comment', {
        codeId: data.codeId,
        agent: agent.address,
        line: data.line,
        comment: data.comment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error handling code comment:', error);
      socket.emit('error', { message: 'Failed to post comment' });
    }
  });

  // Subscribe to code updates
  socket.on('code:subscribe', (data: { codeIds: string[] }) => {
    for (const codeId of data.codeIds) {
      socket.join(`code:${codeId}`);
    }
    socket.emit('code:subscribed', { count: data.codeIds.length });
  });
};