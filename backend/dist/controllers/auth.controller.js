"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateMe = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Doctor_1 = __importDefault(require("../models/Doctor"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Insurer_1 = __importDefault(require("../models/Insurer"));
const apiResponse_1 = require("../utils/apiResponse");
const generateToken = (userId, role, email, name) => {
    return jsonwebtoken_1.default.sign({ userId, role, email, name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role, ...profileData } = req.body;
        // Check if email already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            (0, apiResponse_1.sendError)(res, 'Email already registered', 400);
            return;
        }
        // Validate role
        if (!['doctor', 'patient', 'insurer'].includes(role)) {
            (0, apiResponse_1.sendError)(res, 'Invalid role', 400);
            return;
        }
        // Create user (password will be hashed by pre-save hook)
        const user = await User_1.default.create({
            name,
            email,
            passwordHash: password,
            role,
        });
        // Create role-specific profile
        if (role === 'doctor') {
            await Doctor_1.default.create({
                userId: user._id,
                specialization: profileData.specialization || 'General Medicine',
                hospitalName: profileData.hospitalName || 'Unknown Hospital',
                npiNumber: profileData.npiNumber || '',
                department: profileData.department,
                phone: profileData.phone,
            });
        }
        else if (role === 'patient') {
            await Patient_1.default.create({
                userId: user._id,
                dateOfBirth: profileData.dateOfBirth,
                gender: profileData.gender,
                phone: profileData.phone,
                insurancePlan: profileData.insurancePlan,
                insuranceProvider: profileData.insuranceProvider,
                insurancePolicyNumber: profileData.insurancePolicyNumber,
            });
        }
        else if (role === 'insurer') {
            await Insurer_1.default.create({
                userId: user._id,
                organizationName: profileData.organizationName || 'Insurance Organization',
                department: profileData.department,
                licenseNumber: profileData.licenseNumber,
                phone: profileData.phone,
            });
        }
        const token = generateToken(user._id.toString(), user.role, user.email, user.name);
        (0, apiResponse_1.sendSuccess)(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 'Registration successful', 201);
    }
    catch (error) {
        console.error('Register error:', error);
        (0, apiResponse_1.sendError)(res, 'Registration failed', 500);
    }
};
exports.register = register;
// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            (0, apiResponse_1.sendError)(res, 'Email and password are required', 400);
            return;
        }
        const user = await User_1.default.findOne({ email, isActive: true });
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'Invalid email or password', 401);
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            (0, apiResponse_1.sendError)(res, 'Invalid email or password', 401);
            return;
        }
        const token = generateToken(user._id.toString(), user.role, user.email, user.name);
        (0, apiResponse_1.sendSuccess)(res, {
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        (0, apiResponse_1.sendError)(res, 'Login failed', 500);
    }
};
exports.login = login;
// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'User not found', 404);
            return;
        }
        // Get role-specific profile
        let profile = null;
        if (user.role === 'doctor') {
            profile = await Doctor_1.default.findOne({ userId: user._id });
        }
        else if (user.role === 'patient') {
            profile = await Patient_1.default.findOne({ userId: user._id });
        }
        else if (user.role === 'insurer') {
            profile = await Insurer_1.default.findOne({ userId: user._id });
        }
        (0, apiResponse_1.sendSuccess)(res, { user, profile });
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to get user', 500);
    }
};
exports.getMe = getMe;
// PUT /api/auth/me  (update profile)
const updateMe = async (req, res) => {
    try {
        const { name, ...profileData } = req.body;
        const userId = req.user.userId;
        if (name) {
            await User_1.default.findByIdAndUpdate(userId, { name });
        }
        const role = req.user.role;
        if (role === 'doctor') {
            await Doctor_1.default.findOneAndUpdate({ userId }, profileData, { new: true });
        }
        else if (role === 'patient') {
            await Patient_1.default.findOneAndUpdate({ userId }, profileData, { new: true });
        }
        else if (role === 'insurer') {
            await Insurer_1.default.findOneAndUpdate({ userId }, profileData, { new: true });
        }
        (0, apiResponse_1.sendSuccess)(res, null, 'Profile updated successfully');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to update profile', 500);
    }
};
exports.updateMe = updateMe;
// PUT /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            (0, apiResponse_1.sendError)(res, 'Current password and new password are required', 400);
            return;
        }
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            (0, apiResponse_1.sendError)(res, 'User not found', 404);
            return;
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            (0, apiResponse_1.sendError)(res, 'Current password is incorrect', 400);
            return;
        }
        user.passwordHash = newPassword;
        await user.save();
        (0, apiResponse_1.sendSuccess)(res, null, 'Password updated successfully');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to update password', 500);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map