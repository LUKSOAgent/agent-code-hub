import { Router } from 'express';
import { IssueService } from '../../services/issue';
import { authenticate } from '../middleware/auth';

const router = Router();
const issueService = new IssueService();

// List issues
router.get('/', async (req, res, next) => {
  try {
    const { codeId, reporter, assignee, status, severity, sortBy, limit, offset } = req.query;

    const result = await issueService.listIssues({
      codeId: codeId as string,
      reporter: reporter as string,
      assignee: assignee as string,
      status: status as any,
      severity: severity as any,
      sortBy: sortBy as 'recent' | 'bounty',
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get specific issue
router.get('/:issueId', async (req, res, next) => {
  try {
    const issue = await issueService.getIssue(req.params.issueId);
    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }
    res.json(issue);
  } catch (error) {
    next(error);
  }
});

// Create issue (authenticated)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { codeId, title, description, severity, bounty } = req.body;
    const reporter = (req as any).agent.address;

    if (!codeId || !title || !description || !severity || !bounty) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const issue = await issueService.createIssue({
      codeId,
      reporter,
      title,
      description,
      severity,
      bounty,
    });

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
});

// Assign issue to agent (authenticated)
router.post('/:issueId/assign', authenticate, async (req, res, next) => {
  try {
    const assignee = (req as any).agent.address;

    const issue = await issueService.assignIssue(req.params.issueId, assignee);
    if (!issue) {
      res.status(404).json({ error: 'Issue not found or cannot be assigned' });
      return;
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

// Submit solution (authenticated)
router.post('/:issueId/solutions', authenticate, async (req, res, next) => {
  try {
    const { codeHash, ipfsHash, description } = req.body;
    const solver = (req as any).agent.address;

    const issue = await issueService.submitSolution(req.params.issueId, {
      solver,
      codeHash,
      ipfsHash,
      description,
    });

    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

// Accept solution (authenticated, must be reporter)
router.post('/:issueId/accept/:solutionIndex', authenticate, async (req, res, next) => {
  try {
    const reporter = (req as any).agent.address;
    const solutionIndex = parseInt(req.params.solutionIndex, 10);

    const issue = await issueService.acceptSolution(
      req.params.issueId,
      solutionIndex,
      reporter
    );

    if (!issue) {
      res.status(404).json({ error: 'Issue not found or unauthorized' });
      return;
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

// Close issue (authenticated, must be reporter)
router.post('/:issueId/close', authenticate, async (req, res, next) => {
  try {
    const reporter = (req as any).agent.address;

    const issue = await issueService.closeIssue(req.params.issueId, reporter);
    if (!issue) {
      res.status(404).json({ error: 'Issue not found or unauthorized' });
      return;
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

// Get bounty stats
router.get('/stats/bounties', async (req, res, next) => {
  try {
    const stats = await issueService.getBountyStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export { router as issueRoutes };