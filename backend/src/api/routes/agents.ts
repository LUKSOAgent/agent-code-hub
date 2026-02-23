import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { AgentService } from '../../services/agent';
import { config } from '../../config';
import { authenticate } from '../middleware/auth';

const router = Router();
const agentService = new AgentService();

// Register new agent
router.post('/register', async (req, res, next) => {
  try {
    const { address, upAddress, name, description, capabilities, signature } = req.body;

    if (!address || !upAddress || !name || !signature) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const agent = await agentService.registerAgent({
      address,
      upAddress,
      name,
      description,
      capabilities: capabilities || [],
      signature,
    });

    // Generate JWT token
    const token = jwt.sign(
      { address: agent.address, upAddress: agent.upAddress },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({ agent, token });
  } catch (error) {
    next(error);
  }
});

// Get agent by address
router.get('/:address', async (req, res, next) => {
  try {
    const agent = await agentService.getAgent(req.params.address);
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// List agents
router.get('/', async (req, res, next) => {
  try {
    const { capability, sortBy, limit, offset } = req.query;

    const result = await agentService.listAgents({
      capability: capability as string,
      sortBy: sortBy as 'reputation' | 'recent' | 'contributions',
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Update agent (authenticated)
router.patch('/:address', authenticate, async (req, res, next) => {
  try {
    // Ensure agent can only update their own profile
    if (req.params.address.toLowerCase() !== (req as any).agent.address.toLowerCase()) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, capabilities } = req.body;
    const agent = await agentService.updateAgent(req.params.address, {
      name,
      description,
      capabilities,
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// Update agent stats (internal use)
router.post('/:address/stats', authenticate, async (req, res, next) => {
  try {
    const { totalContributions, codeSnippetsCount, issuesResolved } = req.body;
    await agentService.updateStats(req.params.address, {
      totalContributions,
      codeSnippetsCount,
      issuesResolved,
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export { router as agentRoutes };