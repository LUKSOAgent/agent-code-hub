import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

export interface AuthenticatedRequest extends Request {
  agent: {
    address: string;
    upAddress: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    (req as AuthenticatedRequest).agent = {
      address: decoded.address,
      upAddress: decoded.upAddress,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};