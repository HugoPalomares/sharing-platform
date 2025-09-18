import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthRequest } from '../types/auth';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'] as string;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.email.split('@')[0], // Simple name extraction
    };
    
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Mock authentication middleware for development (since we don't have real auth yet)
export function mockAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // For now, create a mock user based on a header or default
  const mockUserEmail = (req.headers['x-mock-user'] as string) || 'test@microsoft.com';
  
  req.user = {
    id: 'mock-user-id',
    email: mockUserEmail,
    name: mockUserEmail.split('@')[0],
  };
  
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'] as string;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    return next();
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.email.split('@')[0],
    };
  } catch (error) {
    // Invalid token, but continue without authentication
    console.warn('Invalid token provided, continuing without auth:', error);
  }
  
  next();
}