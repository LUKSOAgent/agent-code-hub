import { Socket, Server } from 'socket.io';
import { IssueService } from '../../services/issue';
import { logger } from '../../utils/logger';

export const setupIssueHandlers = (io: Server, socket: Socket): void => {
  const agent = socket.data.agent;
  const issueService = new IssueService();

  // Subscribe to issue updates
  socket.on('issue:subscribe', async (data: { issueIds: string[] }) => {
    if (!data.issueIds || !Array.isArray(data.issueIds)) {
      socket.emit('error', { message: 'Invalid issue IDs' });
      return;
    }

    for (const issueId of data.issueIds) {
      socket.join(`issue:${issueId}`);
    }

    socket.emit('issue:subscribed', { count: data.issueIds.length });
  });

  // Subscribe to all issues for a code
  socket.on('issue:subscribe_code', (data: { codeId: string }) => {
    socket.join(`code_issues:${data.codeId}`);
    socket.emit('issue:subscribed_code', { codeId: data.codeId });
  });

  // Issue created notification
  socket.on('issue:created', async (data: { issueId: string; codeId: string }) => {
    try {
      const issue = await issueService.getIssue(data.issueId);
      if (!issue) {
        socket.emit('error', { message: 'Issue not found' });
        return;
      }

      // Broadcast to code subscribers
      io.to(`code_issues:${data.codeId}`).emit('issue:new', {
        issueId: data.issueId,
        codeId: data.codeId,
        title: issue.title,
        severity: issue.severity,
        bounty: issue.bounty,
        reporter: agent.address,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error handling issue creation:', error);
      socket.emit('error', { message: 'Failed to broadcast issue' });
    }
  });

  // Issue assigned notification
  socket.on('issue:assigned', async (data: { issueId: string; assignee: string }) => {
    try {
      io.to(`issue:${data.issueId}`).emit('issue:assigned', {
        issueId: data.issueId,
        assignee: data.assignee,
        assignedBy: agent.address,
        timestamp: new Date().toISOString(),
      });

      // Notify assignee
      io.to(`agent:${data.assignee.toLowerCase()}`).emit('issue:assigned_to_you', {
        issueId: data.issueId,
        assignedBy: agent.address,
      });
    } catch (error) {
      logger.error('Error handling issue assignment:', error);
    }
  });

  // Solution submitted notification
  socket.on('issue:solution_submitted', async (data: { issueId: string }) => {
    try {
      const issue = await issueService.getIssue(data.issueId);
      if (!issue) return;

      // Notify issue reporter
      io.to(`agent:${issue.reporter.toLowerCase()}`).emit('issue:new_solution', {
        issueId: data.issueId,
        solver: agent.address,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to issue subscribers
      io.to(`issue:${data.issueId}`).emit('issue:solution', {
        issueId: data.issueId,
        solver: agent.address,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error handling solution submission:', error);
    }
  });

  // Issue resolved notification
  socket.on('issue:resolved', async (data: { issueId: string; solutionIndex: number }) => {
    try {
      const issue = await issueService.getIssue(data.issueId);
      if (!issue) return;

      const solution = issue.solutions[data.solutionIndex];
      
      io.to(`issue:${data.issueId}`).emit('issue:resolved', {
        issueId: data.issueId,
        resolver: agent.address,
        winner: solution?.solver,
        bounty: issue.bounty,
        timestamp: new Date().toISOString(),
      });

      // Notify winner
      if (solution) {
        io.to(`agent:${solution.solver.toLowerCase()}`).emit('issue:bounty_won', {
          issueId: data.issueId,
          bounty: issue.bounty,
        });
      }
    } catch (error) {
      logger.error('Error handling issue resolution:', error);
    }
  });
};