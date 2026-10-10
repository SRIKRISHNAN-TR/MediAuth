import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Insurer from '../models/Insurer';
import { sendSuccess, sendError } from '../utils/apiResponse';

const generateToken = (userId: string, role: string, email: string, name: string): string => {
  return jwt.sign(
    { userId, role, email, name },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, ...profileData } = req.body;

    // Block admin registration via API
    if (role === 'admin') {
      sendError(res, 'Admin accounts cannot be self-registered', 403);
      return;
    }

    // Validate role
    if (!['doctor', 'patient', 'insurer'].includes(role)) {
      sendError(res, 'Invalid role', 400);
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 'Email already registered', 400);
      return;
    }

    // Patients are auto-approved; doctors/insurers need admin approval
    const isApproved = role === 'patient';

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      isApproved,
    });

    // Create role-specific profile
    if (role === 'doctor') {
      await Doctor.create({
        userId: user._id,
        specialization: profileData.specialization || 'General Medicine',
        hospitalName: profileData.hospitalName || 'Unknown Hospital',
        npiNumber: profileData.npiNumber || '',
        department: profileData.department,
        phone: profileData.phone,
      });
    } else if (role === 'patient') {
      await Patient.create({
        userId: user._id,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        phone: profileData.phone,
        insurancePlan: profileData.insurancePlan,
        insuranceProvider: profileData.insuranceProvider,
        insurancePolicyNumber: profileData.insurancePolicyNumber,
      });
    } else if (role === 'insurer') {
      await Insurer.create({
        userId: user._id,
        organizationName: profileData.organizationName || 'Insurance Organization',
        department: profileData.department,
        licenseNumber: profileData.licenseNumber,
        phone: profileData.phone,
      });
    }

    if (isApproved) {
      const token = generateToken(user._id!.toString(), user.role, user.email, user.name);
      sendSuccess(
        res,
        { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
        'Registration successful',
        201
      );
    } else {
      sendSuccess(
        res,
        { pending: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
        'Registration submitted. Your account is pending admin approval.',
        201
      );
    }
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Registration failed', 500);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Block login if doctor/insurer is pending approval
    if ((user.role === 'doctor' || user.role === 'insurer') && !user.isApproved) {
      sendError(res, 'Your account is pending admin approval. Please wait for verification.', 403);
      return;
    }

    const token = generateToken(user._id!.toString(), user.role, user.email, user.name);

    sendSuccess(res, {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Get role-specific profile
    let profile = null;
    if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'insurer') {
      profile = await Insurer.findOne({ userId: user._id });
    }

    sendSuccess(res, { user, profile });
  } catch (error) {
    sendError(res, 'Failed to get user', 500);
  }
};

// PUT /api/auth/me  (update profile)
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, ...profileData } = req.body;
    const userId = req.user!.userId;

    if (name) {
      await User.findByIdAndUpdate(userId, { name });
    }

    const role = req.user!.role;
    if (role === 'doctor') {
      await Doctor.findOneAndUpdate({ userId }, profileData, { new: true });
    } else if (role === 'patient') {
      await Patient.findOneAndUpdate({ userId }, profileData, { new: true });
    } else if (role === 'insurer') {
      await Insurer.findOneAndUpdate({ userId }, profileData, { new: true });
    }

    sendSuccess(res, null, 'Profile updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update profile', 500);
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      sendError(res, 'Current password and new password are required', 400);
      return;
    }
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }
    user.passwordHash = newPassword;
    await user.save();
    sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update password', 500);
  }
};
