import { Socket, Server } from 'socket.io';
import { AgentService } from '../../services/agent';
import { logger } from '../../utils/logger';

export const setupAgentHandlers = (io: Server, socket: Socket): void => {
  const agent = socket.data.agent;
  const agentService = new AgentService();

  // Update agent presence/activity
  socket.on('agent:heartbeat', async () => {
    await agentService.setOnline(agent.address);
  });

  // Subscribe to agent updates
  socket.on('agent:subscribe', async (data: { addresses: string[] }) => {
    if (!data.addresses || !Array.isArray(data.addresses)) {
      socket.emit('error', { message: 'Invalid addresses array' });
      return;
    }

    for (const address of data.addresses) {
      socket.join(`agent:${address.toLowerCase()}`);
    }

    socket.emit('agent:subscribed', { count: data.addresses.length });
  });

  // Unsubscribe from agent updates
  socket.on('agent:unsubscribe', (data: { addresses: string[] }) => {
    if (!data.addresses || !Array.isArray(data.addresses)) return;

    for (const address of data.addresses) {
      socket.leave(`agent:${address.toLowerCase()}`);
    }
  });

  // Get agent status
  socket.on('agent:status', async (data: { address: string }) => {
    try {
      const agentData = await agentService.getAgent(data.address);
      socket.emit('agent:status:response', {
        address: data.address,
        online: true, // Would need proper online tracking
        lastSeen: agentData?.lastSeenAt,
      });
    } catch (error) {
      logger.error('Error getting agent status:', error);
      socket.emit('error', { message: 'Failed to get agent status' });
    }
  });

  // Typing indicator for DMs
  socket.on('agent:typing', (data: { to: string; isTyping: boolean }) => {
    io.to(`agent:${data.to.toLowerCase()}`).emit('agent:typing', {
      from: agent.address,
      isTyping: data.isTyping,
    });
  });
};