import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { hashPassword, comparePassword, signToken } from '../utils/auth';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  confirmPasswordChangeSchema
} from '../validators/auth.validator';
import { sendMagicLinkEmail, sendPasswordResetEmail } from '../services/email.service';

// Cookie options for secure session handling
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const cleanTarget = email.toLowerCase().trim();
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().replace(/^["']|["']$/g, '').toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(cleanTarget);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Validation error'
      });
      return;
    }

    const { email, password, confirmPassword, firstName, lastName, fullName } = parsed.data;

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
      return;
    }

    // Hash password & create user (assign ADMIN if email in whitelist, otherwise CUSTOMER)
    const passwordHash = await hashPassword(password);
    const emailPrefix = email.split('@')[0];
    const derivedFullName =
      [firstName, lastName].filter(Boolean).join(' ') ||
      fullName?.trim() ||
      (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));
    const assignedRole = isAdminEmail(email) ? 'ADMIN' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: derivedFullName,
        firstName: firstName || derivedFullName.split(' ')[0] || null,
        lastName: lastName || derivedFullName.split(' ').slice(1).join(' ') || null,
        role: assignedRole
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        apartment: true,
        city: true,
        postcode: true,
        country: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT and set HTTP-only cookie
    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    res.cookie('phantom_token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (error: any) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Validation error'
      });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password. If you registered via Google or Magic Link, please use that sign-in method.'
      });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    // Auto-elevate to ADMIN if email is in ADMIN_EMAILS whitelist
    if (isAdminEmail(user.email) && user.role !== 'ADMIN') {
      user.role = 'ADMIN';
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
    }

    // Generate token & set cookie
    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    res.cookie('phantom_token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        apartment: user.apartment,
        city: user.city,
        postcode: user.postcode,
        country: user.country,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('phantom_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ success: true, message: 'Signed out successfully.' });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        apartment: true,
        city: true,
        postcode: true,
        country: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Auto-elevate if in whitelist
    if (isAdminEmail(user.email) && user.role !== 'ADMIN') {
      user.role = 'ADMIN';
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
    }

    // Refresh token cookie if user is admin in DB but incoming JWT had old role
    if (user.role === 'ADMIN' && req.user.role !== 'ADMIN') {
      const freshToken = signToken({
        userId: user.id,
        role: 'ADMIN',
        email: user.email
      });
      res.cookie('phantom_token', freshToken, COOKIE_OPTIONS);
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const { firstName, lastName, phone, address, apartment, city, postcode, country } = parsed.data;

    const dataToUpdate: any = {};
    if (firstName !== undefined) dataToUpdate.firstName = firstName.trim();
    if (lastName !== undefined) dataToUpdate.lastName = lastName.trim();
    if (phone !== undefined) dataToUpdate.phone = phone.trim();
    if (address !== undefined) dataToUpdate.address = address.trim();
    if (apartment !== undefined) dataToUpdate.apartment = apartment.trim();
    if (city !== undefined) dataToUpdate.city = city.trim();
    if (postcode !== undefined) dataToUpdate.postcode = postcode.trim();
    if (country !== undefined) dataToUpdate.country = country.trim();

    // Derived fullName if firstName or lastName updated
    if (firstName !== undefined || lastName !== undefined) {
      const existing = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const f = firstName !== undefined ? firstName.trim() : existing?.firstName || '';
      const l = lastName !== undefined ? lastName.trim() : existing?.lastName || '';
      const derived = [f, l].filter(Boolean).join(' ');
      if (derived) {
        dataToUpdate.fullName = derived;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        apartment: true,
        city: true,
        postcode: true,
        country: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const requestPasswordChange = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Generate 6-digit confirmation code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordChangeCode: code,
        passwordChangeExpires: expires
      }
    });

    console.log(`[Phantom Security] Password Change Confirmation Code for ${user.email}: ${code}`);

    res.json({
      success: true,
      message: `A 6-digit security code has been sent to ${user.email}. Please verify below to update your password.`,
      devCode: code
    });
  } catch (error) {
    console.error('Request password change error:', error);
    res.status(500).json({ success: false, message: 'Failed to dispatch confirmation code' });
  }
};

export const confirmPasswordChange = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const parsed = confirmPasswordChangeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      return;
    }

    const { code, newPassword, confirmPassword } = parsed.data;

    if (confirmPassword && newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.passwordChangeCode || !user.passwordChangeExpires) {
      res.status(400).json({
        success: false,
        message: 'No pending password change requested. Please request a confirmation code first.'
      });
      return;
    }

    if (new Date() > user.passwordChangeExpires) {
      res.status(400).json({
        success: false,
        message: 'The confirmation code has expired. Please request a new code.'
      });
      return;
    }

    if (user.passwordChangeCode.trim() !== code.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid confirmation code. Please check your email.'
      });
      return;
    }

    // Encrypt new password using bcrypt
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangeCode: null,
        passwordChangeExpires: null
      }
    });

    res.json({
      success: true,
      message: 'Your password has been securely updated.'
    });
  } catch (error) {
    console.error('Confirm password change error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Validation error'
      });
      return;
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to prevent user enumeration attacks
    if (!user) {
      res.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.'
      });
      return;
    }

    // Generate random secure token & 1-hour expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires
      }
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/auth/reset-password?token=${resetToken}`;
    console.log(`[Password Reset Token for ${user.email}]: ${resetToken}`);

    // Deliver branded password reset email via Resend
    await sendPasswordResetEmail(user.email, resetLink);

    res.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Validation error'
      });
      return;
    }

    const { token, newPassword } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }
      }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now sign in.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Resend Magic Link Authentication
 */
export const sendMagicLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'A valid email is required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Upsert user or set magic token
    await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        magicToken: token,
        magicTokenExpires: expires
      },
      create: {
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0],
        role: 'CUSTOMER',
        magicToken: token,
        magicTokenExpires: expires
      }
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const magicLink = `${clientUrl}/auth/verify-magic-link?token=${token}`;

    console.log(`[Phantom Auth] Magic Link generated for ${cleanEmail}: ${magicLink}`);

    // Deliver branded magic sign-in link via Resend email service
    const emailResult = await sendMagicLinkEmail(cleanEmail, magicLink);
    const emailSent = emailResult.success;

    res.json({
      success: true,
      message: 'Magic sign-in link has been prepared.',
      emailSent
    });
  } catch (error: any) {
    console.error('Magic Link Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process magic link' });
  }
};

/**
 * Verify Magic Link Token and Issue Session
 */
export const verifyMagicLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, message: 'Token is required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        magicToken: token,
        magicTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired magic link. Please request a new one.'
      });
      return;
    }

    // Invalidate token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicToken: null,
        magicTokenExpires: null
      }
    });

    // Auto-elevate to ADMIN if whitelisted
    if (isAdminEmail(user.email) && user.role !== 'ADMIN') {
      user.role = 'ADMIN';
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
    }

    // Sign JWT & set cookie
    const jwtToken = signToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    res.cookie('phantom_token', jwtToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Authenticated successfully.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Verify Magic Link Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Google Authentication (One-Tap / OAuth Credential)
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, email, fullName, googleId } = req.body;

    let userEmail = email;
    let userName = fullName || 'Phantom Collector';
    let userGoogleId = googleId;

    // If credential JWT was sent by Google One-Tap, decode payload
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.email) {
            userEmail = payload.email;
            userName = payload.name || payload.email.split('@')[0];
            userGoogleId = payload.sub || userGoogleId;
          }
        }
      } catch (e) {
        console.warn('Failed to parse Google credential token payload, falling back to direct fields');
      }
    }

    if (!userEmail) {
      res.status(400).json({ success: false, message: 'Valid Google email is required' });
      return;
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const assignedRole = isAdminEmail(cleanEmail) ? 'ADMIN' : 'CUSTOMER';

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(userGoogleId ? [{ googleId: userGoogleId }] : [])
        ]
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          fullName: userName,
          googleId: userGoogleId || `google_${Date.now()}`,
          role: assignedRole
        }
      });
    } else {
      const updates: any = {};
      if (userGoogleId && !user.googleId) {
        updates.googleId = userGoogleId;
      }
      if (isAdminEmail(cleanEmail) && user.role !== 'ADMIN') {
        updates.role = 'ADMIN';
        user.role = 'ADMIN';
      }
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates
        });
      }
    }

    // Generate JWT and set HTTP-only cookie
    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    res.cookie('phantom_token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Signed in with Google.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};