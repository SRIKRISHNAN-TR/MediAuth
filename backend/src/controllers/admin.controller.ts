import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Insurer from '../models/Insurer';
import Patient from '../models/Patient';
import { sendSuccess, sendError } from '../utils/apiResponse';

const generateToken = (userId: string, role: string, email: string, name: string): string => {
  return jwt.sign(
    { userId, role, email, name },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// GET /api/admin/pending — list pending doctor/insurer accounts
export const getPendingUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const pending = await User.find({
      role: { $in: ['doctor', 'insurer'] },
      isApproved: false,
      isActive: true,
    }).select('-passwordHash').sort({ createdAt: -1 });

    sendSuccess(res, pending);
  } catch (error) {
    console.error('getPendingUsers error:', error);
    sendError(res, 'Failed to fetch pending users', 500);
  }
};

// GET /api/admin/users — list all users (with optional role filter)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    sendSuccess(res, users);
  } catch (error) {
    console.error('getAllUsers error:', error);
    sendError(res, 'Failed to fetch users', 500);
  }
};

// POST /api/admin/approve/:userId — approve a pending doctor/insurer
export const approveUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    if (!['doctor', 'insurer'].includes(user.role)) {
      sendError(res, 'Only doctor/insurer accounts require approval', 400);
      return;
    }

    user.isApproved = true;
    await user.save();

    sendSuccess(res, { id: user._id, name: user.name, email: user.email, role: user.role }, 'User approved successfully');
  } catch (error) {
    console.error('approveUser error:', error);
    sendError(res, 'Failed to approve user', 500);
  }
};

// POST /api/admin/reject/:userId — reject/delete pending account
export const rejectUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Delete the user and associated profile
    if (user.role === 'doctor') await Doctor.deleteOne({ userId: user._id });
    else if (user.role === 'insurer') await Insurer.deleteOne({ userId: user._id });

    await User.deleteOne({ _id: userId });
    sendSuccess(res, null, 'User rejected and removed');
  } catch (error) {
    console.error('rejectUser error:', error);
    sendError(res, 'Failed to reject user', 500);
  }
};

// POST /api/admin/deactivate/:userId — deactivate a user
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    // Protect existing staff
    const PROTECTED_EMAILS = (process.env.PROTECTED_EMAILS || '').split(',').map(e => e.trim());
    if (PROTECTED_EMAILS.includes(user.email)) {
      sendError(res, 'This account is protected and cannot be deactivated', 403);
      return;
    }
    user.isActive = false;
    await user.save();
    sendSuccess(res, null, 'User deactivated');
  } catch (error) {
    sendError(res, 'Failed to deactivate user', 500);
  }
};

// POST /api/admin/add-doctor — admin directly creates a doctor account (pre-approved)
export const addDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, specialization, hospitalName, npiNumber, department, phone } = req.body;
    if (!name || !email || !password) {
      sendError(res, 'Name, email, and password are required', 400);
      return;
    }
    const exists = await User.findOne({ email });
    if (exists) {
      sendError(res, 'Email already registered', 400);
      return;
    }

    const user = await User.create({
      name, email, passwordHash: password, role: 'doctor', isApproved: true,
    });
    await Doctor.create({
      userId: user._id,
      specialization: specialization || 'General Medicine',
      hospitalName: hospitalName || 'Unknown Hospital',
      npiNumber: npiNumber || '',
      department,
      phone,
    });

    sendSuccess(
      res,
      { id: user._id, name: user.name, email: user.email, role: 'doctor' },
      'Doctor account created successfully',
      201
    );
  } catch (error) {
    console.error('addDoctor error:', error);
    sendError(res, 'Failed to create doctor account', 500);
  }
};

// POST /api/admin/add-insurer — admin directly creates an insurer account (pre-approved)
export const addInsurer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, organizationName, department, licenseNumber, phone } = req.body;
    if (!name || !email || !password) {
      sendError(res, 'Name, email, and password are required', 400);
      return;
    }
    const exists = await User.findOne({ email });
    if (exists) {
      sendError(res, 'Email already registered', 400);
      return;
    }

    const user = await User.create({
      name, email, passwordHash: password, role: 'insurer', isApproved: true,
    });
    await Insurer.create({
      userId: user._id,
      organizationName: organizationName || 'Insurance Organization',
      department,
      licenseNumber,
      phone,
    });

    sendSuccess(
      res,
      { id: user._id, name: user.name, email: user.email, role: 'insurer' },
      'Insurer account created successfully',
      201
    );
  } catch (error) {
    console.error('addInsurer error:', error);
    sendError(res, 'Failed to create insurer account', 500);
  }
};

// GET /api/admin/stats — overview stats for admin dashboard
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [total, doctors, insurers, patients, pending] = await Promise.all([
      User.countDocuments({ isActive: true, role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: 'insurer', isActive: true }),
      User.countDocuments({ role: 'patient', isActive: true }),
      User.countDocuments({ role: { $in: ['doctor', 'insurer'] }, isApproved: false, isActive: true }),
    ]);

    sendSuccess(res, { total, doctors, insurers, patients, pending });
  } catch (error) {
    sendError(res, 'Failed to get stats', 500);
  }
};
