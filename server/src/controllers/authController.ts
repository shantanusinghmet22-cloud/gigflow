import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUserPayload, UserRole } from '../types';

const signToken = (payload: IUserPayload): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ success: false, error: 'Email already registered.' });
      return;
    }

    // Only allow 'sales' role on self-registration — admin must be set manually
    const assignedRole = role === UserRole.ADMIN ? UserRole.SALES : (role ?? UserRole.SALES);

    const user = await User.create({ name, email, password, role: assignedRole });

    const payload: IUserPayload = { id: user._id.toString(), email: user.email, role: user.role };
    const token = signToken(payload);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Explicitly include password since it's select: false in schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const payload: IUserPayload = { id: user._id.toString(), email: user.email, role: user.role };
    const token = signToken(payload);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by auth middleware
    const userId = (req as any).user?.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
