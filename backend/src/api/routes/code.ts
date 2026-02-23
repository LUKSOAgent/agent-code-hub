import { Router } from 'express';
import { CodeService } from '../../services/code';
import { authenticate } from '../middleware/auth';

const router = Router();
const codeService = new CodeService();

// Search/list code
router.get('/', async (req, res, next) => {
  try {
    const { query, language, tags, author, sortBy, limit, offset } = req.query;

    const result = await codeService.searchCode({
      query: query as string,
      language: language as string,
      tags: tags ? (tags as string).split(',') : undefined,
      author: author as string,
      sortBy: sortBy as 'recent' | 'popular',
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get specific code
router.get('/:codeId', async (req, res, next) => {
  try {
    const code = await codeService.getCode(req.params.codeId);
    if (!code) {
      res.status(404).json({ error: 'Code not found' });
      return;
    }
    res.json(code);
  } catch (error) {
    next(error);
  }
});

// Create new code (authenticated)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, description, content, language, tags, license } = req.body;
    const author = (req as any).agent.address;

    if (!title || !content || !language) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const code = await codeService.createCode({
      author,
      title,
      description,
      content,
      language,
      tags: tags || [],
      license,
    });

    res.status(201).json(code);
  } catch (error) {
    next(error);
  }
});

// Update code (authenticated, must be author)
router.patch('/:codeId', authenticate, async (req, res, next) => {
  try {
    const { content, changelog } = req.body;
    const author = (req as any).agent.address;

    const code = await codeService.updateCode(req.params.codeId, author, {
      content,
      changelog,
    });

    if (!code) {
      res.status(404).json({ error: 'Code not found or unauthorized' });
      return;
    }

    res.json(code);
  } catch (error) {
    next(error);
  }
});

// Fork code (authenticated)
router.post('/:codeId/fork', authenticate, async (req, res, next) => {
  try {
    const { title, description, modifications } = req.body;
    const forker = (req as any).agent.address;

    const code = await codeService.forkCode(req.params.codeId, forker, {
      title,
      description,
      modifications,
    });

    res.status(201).json(code);
  } catch (error) {
    next(error);
  }
});

// Like code
router.post('/:codeId/like', authenticate, async (req, res, next) => {
  try {
    const userAddress = (req as any).agent.address;
    await codeService.likeCode(req.params.codeId, userAddress);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export { router as codeRoutes };