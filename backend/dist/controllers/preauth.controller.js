"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSamplesForCurrentUser = exports.getStats = exports.updateStatus = exports.submitRequest = exports.updateRequest = exports.getRequestById = exports.getRequests = exports.createRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PreAuthRequest_1 = __importDefault(require("../models/PreAuthRequest"));
const Doctor_1 = __importDefault(require("../models/Doctor"));
const Patient_1 = __importDefault(require("../models/Patient"));
const apiResponse_1 = require("../utils/apiResponse");
const notificationService_1 = require("../services/notificationService");
const User_1 = __importDefault(require("../models/User"));
const ai_controller_1 = require("./ai.controller");
// POST /api/preauth — Create draft request
const createRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const doctor = await Doctor_1.default.findOne({ userId });
        if (!doctor) {
            (0, apiResponse_1.sendError)(res, 'Doctor profile not found', 404);
            return;
        }
        let patientId = req.body.patientId;
        if (!patientId && req.body.patientInfo?.patientIdRef) {
            const match = await Patient_1.default.findOne({ patientId: req.body.patientInfo.patientIdRef });
            if (match)
                patientId = match._id;
        }
        if (!patientId && req.body.patientInfo?.name) {
            const match = await Patient_1.default.findOne({
                $or: [
                    { insurancePolicyNumber: req.body.insuranceDetails?.policyNumber },
                    { phone: req.body.patientInfo.phone },
                ],
            });
            if (match)
                patientId = match._id;
        }
        if (!patientId) {
            const firstPat = await Patient_1.default.findOne({});
            if (firstPat)
                patientId = firstPat._id;
        }
        const request = await PreAuthRequest_1.default.create({
            ...req.body,
            doctorId: doctor._id,
            patientId,
            status: 'draft',
        });
        (0, apiResponse_1.sendSuccess)(res, request, 'Request created', 201);
    }
    catch (error) {
        console.error(error);
        (0, apiResponse_1.sendError)(res, 'Failed to create request', 500);
    }
};
exports.createRequest = createRequest;
// GET /api/preauth — List requests (filtered by role)
const getRequests = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { status, search, page = '1', limit = '10' } = req.query;
        let filter = {};
        if (role === 'doctor') {
            const doctor = await Doctor_1.default.findOne({ userId });
            if (!doctor) {
                (0, apiResponse_1.sendError)(res, 'Doctor not found', 404);
                return;
            }
            filter.doctorId = doctor._id;
        }
        else if (role === 'patient') {
            const patient = await Patient_1.default.findOne({ userId });
            if (!patient) {
                (0, apiResponse_1.sendError)(res, 'Patient not found', 404);
                return;
            }
            filter.patientId = patient._id;
        }
        else if (role === 'insurer') {
            // Insurers see all submitted+ requests
            filter.status = { $ne: 'draft' };
        }
        if (status && status !== 'all')
            filter.status = status;
        if (search) {
            filter.$or = [
                { requestId: { $regex: search, $options: 'i' } },
                { 'patientInfo.name': { $regex: search, $options: 'i' } },
                { 'treatmentDetails.procedureName': { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await PreAuthRequest_1.default.countDocuments(filter);
        const requests = await PreAuthRequest_1.default.find(filter)
            .populate('aiAnalysisId', 'confidenceScore policyMatchScore recommendation')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        (0, apiResponse_1.sendSuccess)(res, { requests, total, page: parseInt(page), limit: parseInt(limit) });
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to fetch requests', 500);
    }
};
exports.getRequests = getRequests;
// GET /api/preauth/:id — Single request
const getRequestById = async (req, res) => {
    try {
        const request = await PreAuthRequest_1.default.findById(req.params.id)
            .populate('aiAnalysisId')
            .populate('doctorId')
            .populate('patientId');
        if (!request) {
            (0, apiResponse_1.sendError)(res, 'Request not found', 404);
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, request);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to fetch request', 500);
    }
};
exports.getRequestById = getRequestById;
// PUT /api/preauth/:id — Doctor updates draft
const updateRequest = async (req, res) => {
    try {
        const request = await PreAuthRequest_1.default.findById(req.params.id);
        if (!request) {
            (0, apiResponse_1.sendError)(res, 'Request not found', 404);
            return;
        }
        if (request.status !== 'draft') {
            (0, apiResponse_1.sendError)(res, 'Only draft requests can be edited', 400);
            return;
        }
        const updated = await PreAuthRequest_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        (0, apiResponse_1.sendSuccess)(res, updated, 'Request updated');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to update request', 500);
    }
};
exports.updateRequest = updateRequest;
// POST /api/preauth/:id/submit — Doctor submits → triggers AI
const submitRequest = async (req, res) => {
    try {
        const request = await PreAuthRequest_1.default.findById(req.params.id);
        if (!request) {
            (0, apiResponse_1.sendError)(res, 'Request not found', 404);
            return;
        }
        if (request.status !== 'draft') {
            (0, apiResponse_1.sendError)(res, 'Request already submitted', 400);
            return;
        }
        request.status = 'submitted';
        request.timeline.push({ status: 'submitted', timestamp: new Date(), note: 'Request submitted by doctor' });
        await request.save();
        // Notify doctor
        const doctorUser = await User_1.default.findById(req.user.userId);
        if (doctorUser) {
            await (0, notificationService_1.createNotification)(doctorUser._id.toString(), 'Pre-authorization submitted', `Request ${request.requestId} has been submitted successfully.`, 'claim_update', request._id.toString());
        }
        // Find patient user and notify
        const patient = await Patient_1.default.findById(request.patientId);
        if (patient) {
            await (0, notificationService_1.createNotification)(patient.userId.toString(), 'Pre-authorization submitted', `Your pre-authorization request (${request.requestId}) has been submitted and is under review.`, 'claim_update', request._id.toString());
        }
        (0, apiResponse_1.sendSuccess)(res, request, 'Request submitted. AI analysis will begin shortly.');
        // Automatically trigger AI analysis in background
        (0, ai_controller_1.executeAIAnalysis)(request._id.toString()).catch((err) => {
            console.error('Auto AI analysis error:', err);
        });
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to submit request', 500);
    }
};
exports.submitRequest = submitRequest;
// PATCH /api/preauth/:id/status — Insurer changes status
const updateStatus = async (req, res) => {
    try {
        const { status, remarks, approvedAmount } = req.body;
        const request = await PreAuthRequest_1.default.findById(req.params.id);
        if (!request) {
            (0, apiResponse_1.sendError)(res, 'Request not found', 404);
            return;
        }
        const validTransitions = {
            draft: ['submitted'],
            submitted: ['ai_processing'],
            ai_processing: ['under_review', 'missing_documents'],
            missing_documents: ['submitted', 'under_review'],
            under_review: ['approved', 'rejected', 'additional_info_required'],
            additional_info_required: ['submitted', 'under_review'],
            approved: [],
            rejected: [],
        };
        if (!validTransitions[request.status]?.includes(status)) {
            (0, apiResponse_1.sendError)(res, `Cannot transition from ${request.status} to ${status}`, 400);
            return;
        }
        request.status = status;
        if (remarks)
            request.reviewerRemarks = remarks;
        if (approvedAmount)
            request.approvedAmount = approvedAmount;
        request.timeline.push({
            status,
            timestamp: new Date(),
            note: remarks || `Status updated to ${status}`,
            updatedBy: new mongoose_1.default.Types.ObjectId(req.user.userId),
        });
        await request.save();
        // Notify patient
        const patient = await Patient_1.default.findById(request.patientId);
        if (patient) {
            let title = 'Claim status updated';
            let message = `Your claim ${request.requestId} status: ${status}`;
            if (status === 'approved') {
                title = 'Claim Approved! 🎉';
                message = `Your claim ${request.requestId} has been approved.`;
            }
            if (status === 'rejected') {
                title = 'Claim Rejected';
                message = `Your claim ${request.requestId} has been rejected. ${remarks || ''}`;
            }
            if (status === 'additional_info_required') {
                title = 'Additional Information Required';
                message = `Additional documents required for ${request.requestId}. ${remarks || ''}`;
            }
            await (0, notificationService_1.createNotification)(patient.userId.toString(), title, message, 'approval_rejection', request._id.toString());
        }
        // Notify doctor
        const doctor = await Doctor_1.default.findById(request.doctorId);
        if (doctor) {
            await (0, notificationService_1.createNotification)(doctor.userId.toString(), 'Claim status updated', `Request ${request.requestId} → ${status}`, 'claim_update', request._id.toString());
        }
        (0, apiResponse_1.sendSuccess)(res, request, 'Status updated');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to update status', 500);
    }
};
exports.updateStatus = updateStatus;
// GET /api/preauth/stats — Dashboard stats
const getStats = async (req, res) => {
    try {
        const { role, userId } = req.user;
        let matchFilter = {};
        if (role === 'doctor') {
            const doctor = await Doctor_1.default.findOne({ userId });
            if (doctor)
                matchFilter.doctorId = doctor._id;
        }
        else if (role === 'patient') {
            const patient = await Patient_1.default.findOne({ userId });
            if (patient)
                matchFilter.patientId = patient._id;
        }
        else if (role === 'insurer') {
            matchFilter.status = { $ne: 'draft' };
        }
        const [total, pending, approved, rejected, missingDocs, underReview, aiProcessing, additionalInfo] = await Promise.all([
            PreAuthRequest_1.default.countDocuments(matchFilter),
            PreAuthRequest_1.default.countDocuments({ ...matchFilter, status: 'submitted' }),
            PreAuthRequest_1.default.countDocuments({ ...matchFilter, status: 'approved' }),
            PreAuthRequest_1.default.countDocuments({ ...matchFilter, status: 'rejected' }),
            PreAuthRequest_1.default.countDocuments({ ...matchFilter, status: 'missing_documents' }),
            PreAuthRequest_1.default.countDocuments({ ...matchFilter, status: 'under_review' }),
            PreAuthRequest_1.default.countDocuments({ ...matchFilter, status: 'ai_processing' }),
            PreAuthRequest_1.default.countDocuments({ ...matchFilter, status: 'additional_info_required' }),
        ]);
        (0, apiResponse_1.sendSuccess)(res, { total, pending, approved, rejected, missingDocs, underReview, aiProcessing, additionalInfo });
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to fetch stats', 500);
    }
};
exports.getStats = getStats;
// POST /api/preauth/seed-samples — Populate sample requests for current user
const seedSamplesForCurrentUser = async (req, res) => {
    try {
        const { role, userId } = req.user;
        if (role !== 'doctor' && role !== 'patient') {
            (0, apiResponse_1.sendError)(res, 'Sample seeding only available for doctors and patients', 400);
            return;
        }
        const patients = await Patient_1.default.find({});
        if (patients.length === 0) {
            (0, apiResponse_1.sendError)(res, 'No patients found in system', 400);
            return;
        }
        const { populateRequestsForDoctor } = await Promise.resolve().then(() => __importStar(require('../utils/seedHelper')));
        if (role === 'doctor') {
            const doctor = await Doctor_1.default.findOne({ userId });
            if (!doctor) {
                (0, apiResponse_1.sendError)(res, 'Doctor profile not found', 404);
                return;
            }
            const created = await populateRequestsForDoctor(doctor._id, new mongoose_1.default.Types.ObjectId(userId), patients);
            (0, apiResponse_1.sendSuccess)(res, { count: created.length }, 'Sample pre-authorization requests created');
            return;
        }
        // For patient: attach requests
        const patient = await Patient_1.default.findOne({ userId });
        if (!patient) {
            (0, apiResponse_1.sendError)(res, 'Patient not found', 404);
            return;
        }
        const doctor = await Doctor_1.default.findOne({});
        if (!doctor) {
            (0, apiResponse_1.sendError)(res, 'No doctor found to associate with requests', 400);
            return;
        }
        const created = await populateRequestsForDoctor(doctor._id, doctor.userId, [patient]);
        (0, apiResponse_1.sendSuccess)(res, { count: created.length }, 'Sample claims created for patient');
    }
    catch (error) {
        console.error('Error seeding samples:', error);
        (0, apiResponse_1.sendError)(res, 'Failed to seed sample requests', 500);
    }
};
exports.seedSamplesForCurrentUser = seedSamplesForCurrentUser;
//# sourceMappingURL=preauth.controller.js.map