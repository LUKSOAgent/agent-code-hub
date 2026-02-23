import { Router } from 'express';
import { ProjectService } from '../../services/project';
import { authenticate } from '../middleware/auth';

const router = Router();
const projectService = new ProjectService();

// List projects
router.get('/', async (req, res, next) => {
  try {
    const { member, owner, status, limit, offset } = req.query;

    const result = await projectService.listProjects({
      member: member as string,
      owner: owner as string,
      status: status as any,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get specific project
router.get('/:projectId', async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Create project (authenticated)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, invitees } = req.body;
    const owner = (req as any).agent.address;

    if (!name) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const project = await projectService.createProject({
      name,
      description,
      owner,
      invitees,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// Invite member (authenticated)
router.post('/:projectId/invite', authenticate, async (req, res, next) => {
  try {
    const { invitee, role } = req.body;
    const inviter = (req as any).agent.address;

    const project = await projectService.inviteMember(
      req.params.projectId,
      inviter,
      invitee,
      role
    );

    if (!project) {
      res.status(404).json({ error: 'Project not found or insufficient permissions' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Create task (authenticated)
router.post('/:projectId/tasks', authenticate, async (req, res, next) => {
  try {
    const { title, description, assignee, dependencies } = req.body;
    const creator = (req as any).agent.address;

    const project = await projectService.createTask(
      req.params.projectId,
      creator,
      { title, description, assignee, dependencies }
    );

    if (!project) {
      res.status(404).json({ error: 'Project not found or insufficient permissions' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Update task status (authenticated)
router.patch('/:projectId/tasks/:taskId', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const agent = (req as any).agent.address;

    const project = await projectService.updateTaskStatus(
      req.params.projectId,
      req.params.taskId,
      agent,
      status
    );

    if (!project) {
      res.status(404).json({ error: 'Task not found or insufficient permissions' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Create proposal (authenticated)
router.post('/:projectId/proposals', authenticate, async (req, res, next) => {
  try {
    const { title, description, expiresInHours } = req.body;
    const proposer = (req as any).agent.address;

    const project = await projectService.createProposal(
      req.params.projectId,
      proposer,
      { title, description, expiresInHours }
    );

    if (!project) {
      res.status(404).json({ error: 'Project not found or not a member' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Vote on proposal (authenticated)
router.post('/:projectId/proposals/:proposalId/vote', authenticate, async (req, res, next) => {
  try {
    const { vote } = req.body;
    const voter = (req as any).agent.address;

    const project = await projectService.voteOnProposal(
      req.params.projectId,
      req.params.proposalId,
      voter,
      vote
    );

    if (!project) {
      res.status(404).json({ error: 'Proposal not found or not a member' });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

export { router as projectRoutes };