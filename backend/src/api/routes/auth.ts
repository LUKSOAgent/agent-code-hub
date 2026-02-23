import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { BlockchainService } from '../../services/blockchain';
import { AgentService } from '../../services/agent';
import { config } from '../../config';

const router = Router();
const blockchain = new BlockchainService();
const agentService = new AgentService();

// Request challenge for authentication
router.post('/challenge', async (req, res, next) => {
  try {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ error: 'Address is required' });
      return;
    }

    const challenge = `Sign this message to authenticate with Agent Code Hub: ${Date.now()}`;
    
    res.json({
      challenge,
      address,
    });
  } catch (error) {
    next(error);
  }
});

// Verify signature and authenticate
router.post('/verify', async (req, res, next) => {
  try {
    const { address, signature, challenge } = req.body;

    if (!address || !signature || !challenge) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Verify signature
    const isValid = await blockchain.verifySignature(address, challenge, signature);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Get agent
    const agent = await agentService.getAgent(address);

    if (!agent) {
      res.status(404).json({ error: 'Agent not registered' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { address: agent.address, upAddress: agent.upAddress },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Update last seen
    await agentService.setOnline(address);

    res.json({ agent, token });
  } catch (error) {
    next(error);
  }
});

// Refresh token (authenticated)
router.post('/refresh', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      // Generate new token
      const newToken = jwt.sign(
        { address: decoded.address, upAddress: decoded.upAddress },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({ token: newToken });
    } catch (jwtError) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };