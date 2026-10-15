import { Request, Response, NextFunction } from 'express';
import { verifyToken, signToken, TokenPayload } from '../utils/auth';
import { prisma } from '../prisma';
import { isAdminEmail } from '../controllers/auth.controller';

// Extend Express Request interface to include our authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 1. Check for token in HTTP-only cookie or Bearer header
    const token =
      req.cookies?.phantom_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.'
      });
      return;
    }

    // 2. Verify token
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please sign in again.'
    });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // First ensure they are authenticated
  requireAuth(req, res, async () => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.'
      });
      return;
    }

    // 1. If JWT already contains ADMIN role, allow immediately
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // 2. Check if the user's email is in ADMIN_EMAILS whitelist
    if (isAdminEmail(req.user.email)) {
      req.user.role = 'ADMIN';
      try {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { role: 'ADMIN' }
        });

        // Re-issue fresh cookie with ADMIN role so subsequent requests have ADMIN directly in JWT
        const freshToken = signToken({
          userId: req.user.userId,
          role: 'ADMIN',
          email: req.user.email
        });
        res.cookie('phantom_token', freshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
      } catch (err) {
        console.error('Failed to sync ADMIN role in requireAdmin:', err);
      }
      return next();
    }

    // 3. Fallback: Query live database in case user was granted ADMIN role after JWT was issued
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true, email: true }
      });

      if (dbUser && (dbUser.role === 'ADMIN' || isAdminEmail(dbUser.email))) {
        req.user.role = 'ADMIN';
        if (dbUser.role !== 'ADMIN') {
          await prisma.user.update({
            where: { id: req.user.userId },
            data: { role: 'ADMIN' }
          });
        }
        // Re-issue fresh cookie with ADMIN role
        const freshToken = signToken({
          userId: req.user.userId,
          role: 'ADMIN',
          email: req.user.email
        });
        res.cookie('phantom_token', freshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return next();
      }
    } catch (err) {
      console.error('Database role check error in requireAdmin:', err);
    }

    res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.'
    });
  });
};