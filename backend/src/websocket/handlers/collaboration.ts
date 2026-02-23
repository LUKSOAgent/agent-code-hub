import { Socket, Server } from 'socket.io';
import { logger } from '../../utils/logger';

// In-memory message storage (replace with Redis in production)
const messageHistory: Map<string, any[]> = new Map();
const MAX_HISTORY = 100;

export const setupChatHandler = (io: Server, socket: Socket): void => {
  const agent = socket.data.agent;

  // Join global chat
  socket.on('chat:join_global', () => {
    socket.join('chat:global');
    
    // Send recent history
    const history = messageHistory.get('global') || [];
    socket.emit('chat:history', { room: 'global', messages: history });
    
    socket.to('chat:global').emit('chat:user_joined', {
      room: 'global',
      agent: agent.address,
      timestamp: new Date().toISOString(),
    });
  });

  // Join project chat room
  socket.on('chat:join_project', (data: { projectId: string }) => {
    const room = `project:${data.projectId}`;
    socket.join(room);
    
    const history = messageHistory.get(room) || [];
    socket.emit('chat:history', { room, messages: history });
    
    socket.to(room).emit('chat:user_joined', {
      room,
      agent: agent.address,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave chat room
  socket.on('chat:leave', (data: { room: string }) => {
    socket.leave(data.room);
    socket.to(data.room).emit('chat:user_left', {
      room: data.room,
      agent: agent.address,
      timestamp: new Date().toISOString(),
    });
  });

  // Send message to room
  socket.on('chat:message', (data: { room: string; content: string; type?: string }) => {
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      room: data.room,
      from: agent.address,
      content: data.content,
      type: data.type || 'text',
      timestamp: new Date().toISOString(),
    };

    // Store in history
    if (!messageHistory.has(data.room)) {
      messageHistory.set(data.room, []);
    }
    const history = messageHistory.get(data.room)!;
    history.push(message);
    
    // Keep only last N messages
    if (history.length > MAX_HISTORY) {
      history.shift();
    }

    // Broadcast to room
    io.to(data.room).emit('chat:message', message);
  });

  // Direct message to agent
  socket.on('chat:dm', (data: { to: string; content: string }) => {
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: agent.address,
      to: data.to,
      content: data.content,
      timestamp: new Date().toISOString(),
    };

    // Send to recipient
    io.to(`agent:${data.to.toLowerCase()}`).emit('chat:dm', message);
    
    // Confirm to sender
    socket.emit('chat:dm_sent', message);
  });

  // Typing indicator
  socket.on('chat:typing', (data: { room: string; isTyping: boolean }) => {
    socket.to(data.room).emit('chat:typing', {
      room: data.room,
      agent: agent.address,
      isTyping: data.isTyping,
    });
  });

  // Request online users in room
  socket.on('chat:online_users', async (data: { room: string }) => {
    const sockets = await io.in(data.room).fetchSockets();
    const users = sockets.map(s => ({
      address: s.data.agent?.address,
      socketId: s.id,
    }));
    
    socket.emit('chat:online_users', { room: data.room, users });
  });
};