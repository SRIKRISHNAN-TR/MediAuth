import { Request, Response } from 'express';
import mongoose from 'mongoose';
import PreAuthRequest, { PreAuthStatus } from '../models/PreAuthRequest';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Insurer from '../models/Insurer';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createNotification } from '../services/notificationService';
import User from '../models/User';
import { executeAIAnalysis } from './ai.controller';

// POST /api/preauth — Create draft request
export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) { sendError(res, 'Doctor profile not found', 404); return; }

    let patientId = req.body.patientId;
    if (!patientId && req.body.patientInfo?.patientIdRef) {
      const match = await Patient.findOne({ patientId: req.body.patientInfo.patientIdRef });
      if (match) patientId = match._id;
    }
    if (!patientId && req.body.patientInfo?.name) {
      const match = await Patient.findOne({
        $or: [
          { insurancePolicyNumber: req.body.insuranceDetails?.policyNumber },
          { phone: req.body.patientInfo.phone },
        ],
      });
      if (match) patientId = match._id;
    }
    if (!patientId) {
      const firstPat = await Patient.findOne({});
      if (firstPat) patientId = firstPat._id;
    }

    const request = await PreAuthRequest.create({
      ...req.body,
      doctorId: doctor._id,
      patientId,
      status: 'draft',
    });
    sendSuccess(res, request, 'Request created', 201);
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to create request', 500);
  }
};

// GET /api/preauth — List requests (filtered by role)
export const getRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    const { status, search, page = '1', limit = '10' } = req.query;

    let filter: Record<string, unknown> = {};

    if (role === 'doctor') {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) { sendError(res, 'Doctor not found', 404); return; }
      filter.doctorId = doctor._id;
    } else if (role === 'patient') {
      const patient = await Patient.findOne({ userId });
      if (!patient) { sendError(res, 'Patient not found', 404); return; }
      filter.patientId = patient._id;
    } else if (role === 'insurer') {
      // Insurers see all submitted+ requests
      filter.status = { $ne: 'draft' };
    }

    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { 'patientInfo.name': { $regex: search, $options: 'i' } },
        { 'treatmentDetails.procedureName': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const total = await PreAuthRequest.countDocuments(filter);
    const requests = await PreAuthRequest.find(filter)
      .populate('aiAnalysisId', 'confidenceScore policyMatchScore recommendation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    sendSuccess(res, { requests, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error) {
    sendError(res, 'Failed to fetch requests', 500);
  }
};

// GET /api/preauth/:id — Single request
export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await PreAuthRequest.findById(req.params.id)
      .populate('aiAnalysisId')
      .populate('doctorId')
      .populate('patientId');

    if (!request) { sendError(res, 'Request not found', 404); return; }
    sendSuccess(res, request);
  } catch (error) {
    sendError(res, 'Failed to fetch request', 500);
  }
};

// PUT /api/preauth/:id — Doctor updates draft
export const updateRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await PreAuthRequest.findById(req.params.id);
    if (!request) { sendError(res, 'Request not found', 404); return; }
    if (request.status !== 'draft') { sendError(res, 'Only draft requests can be edited', 400); return; }

    const updated = await PreAuthRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    sendSuccess(res, updated, 'Request updated');
  } catch (error) {
    sendError(res, 'Failed to update request', 500);
  }
};

// POST /api/preauth/:id/submit — Doctor submits → triggers AI
export const submitRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await PreAuthRequest.findById(req.params.id);
    if (!request) { sendError(res, 'Request not found', 404); return; }
    if (request.status !== 'draft') { sendError(res, 'Request already submitted', 400); return; }

    request.status = 'submitted';
    request.timeline.push({ status: 'submitted', timestamp: new Date(), note: 'Request submitted by doctor' });
    await request.save();

    // Notify doctor
    const doctorUser = await User.findById(req.user!.userId);
    if (doctorUser) {
      await createNotification(
        doctorUser._id!.toString(),
        'Pre-authorization submitted',
        `Request ${request.requestId} has been submitted successfully.`,
        'claim_update',
        request._id!.toString()
      );
    }

    // Find patient user and notify
    const patient = await Patient.findById(request.patientId);
    if (patient) {
      await createNotification(
        patient.userId!.toString(),
        'Pre-authorization submitted',
        `Your pre-authorization request (${request.requestId}) has been submitted and is under review.`,
        'claim_update',
        request._id!.toString()
      );
    }

    sendSuccess(res, request, 'Request submitted. AI analysis will begin shortly.');

    // Automatically trigger AI analysis in background
    executeAIAnalysis(request._id!.toString()).catch((err) => {
      console.error('Auto AI analysis error:', err);
    });
  } catch (error) {
    sendError(res, 'Failed to submit request', 500);
  }
};

// PATCH /api/preauth/:id/status — Insurer changes status
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, remarks, approvedAmount } = req.body;
    const request = await PreAuthRequest.findById(req.params.id);
    if (!request) { sendError(res, 'Request not found', 404); return; }

    const validTransitions: Record<PreAuthStatus, PreAuthStatus[]> = {
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
      sendError(res, `Cannot transition from ${request.status} to ${status}`, 400);
      return;
    }

    request.status = status;
    if (remarks) request.reviewerRemarks = remarks;
    if (approvedAmount) request.approvedAmount = approvedAmount;
    request.timeline.push({
      status,
      timestamp: new Date(),
      note: remarks || `Status updated to ${status}`,
      updatedBy: new mongoose.Types.ObjectId(req.user!.userId),
    });
    await request.save();

    // Notify patient
    const patient = await Patient.findById(request.patientId);
    if (patient) {
      let title = 'Claim status updated';
      let message = `Your claim ${request.requestId} status: ${status}`;
      if (status === 'approved') { title = 'Claim Approved! 🎉'; message = `Your claim ${request.requestId} has been approved.`; }
      if (status === 'rejected') { title = 'Claim Rejected'; message = `Your claim ${request.requestId} has been rejected. ${remarks || ''}`; }
      if (status === 'additional_info_required') { title = 'Additional Information Required'; message = `Additional documents required for ${request.requestId}. ${remarks || ''}`; }

      await createNotification(patient.userId!.toString(), title, message, 'approval_rejection', request._id!.toString());
    }

    // Notify doctor
    const doctor = await Doctor.findById(request.doctorId);
    if (doctor) {
      await createNotification(doctor.userId!.toString(), 'Claim status updated', `Request ${request.requestId} → ${status}`, 'claim_update', request._id!.toString());
    }

    sendSuccess(res, request, 'Status updated');
  } catch (error) {
    sendError(res, 'Failed to update status', 500);
  }
};

// GET /api/preauth/stats — Dashboard stats
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    let matchFilter: Record<string, unknown> = {};

    if (role === 'doctor') {
      const doctor = await Doctor.findOne({ userId });
      if (doctor) matchFilter.doctorId = doctor._id;
    } else if (role === 'patient') {
      const patient = await Patient.findOne({ userId });
      if (patient) matchFilter.patientId = patient._id;
    } else if (role === 'insurer') {
      matchFilter.status = { $ne: 'draft' };
    }

    const [total, pending, approved, rejected, missingDocs, underReview, aiProcessing, additionalInfo] = await Promise.all([
      PreAuthRequest.countDocuments(matchFilter),
      PreAuthRequest.countDocuments({ ...matchFilter, status: 'submitted' }),
      PreAuthRequest.countDocuments({ ...matchFilter, status: 'approved' }),
      PreAuthRequest.countDocuments({ ...matchFilter, status: 'rejected' }),
      PreAuthRequest.countDocuments({ ...matchFilter, status: 'missing_documents' }),
      PreAuthRequest.countDocuments({ ...matchFilter, status: 'under_review' }),
      PreAuthRequest.countDocuments({ ...matchFilter, status: 'ai_processing' }),
      PreAuthRequest.countDocuments({ ...matchFilter, status: 'additional_info_required' }),
    ]);

    sendSuccess(res, { total, pending, approved, rejected, missingDocs, underReview, aiProcessing, additionalInfo });
  } catch (error) {
    sendError(res, 'Failed to fetch stats', 500);
  }
};

// POST /api/preauth/seed-samples — Populate sample requests for current user
export const seedSamplesForCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    if (role !== 'doctor' && role !== 'patient') {
      sendError(res, 'Sample seeding only available for doctors and patients', 400);
      return;
    }

    const patients = await Patient.find({});
    if (patients.length === 0) {
      sendError(res, 'No patients found in system', 400);
      return;
    }

    const { populateRequestsForDoctor } = await import('../utils/seedHelper');

    if (role === 'doctor') {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) { sendError(res, 'Doctor profile not found', 404); return; }

      const created = await populateRequestsForDoctor(
        doctor._id as mongoose.Types.ObjectId,
        new mongoose.Types.ObjectId(userId),
        patients
      );
      sendSuccess(res, { count: created.length }, 'Sample pre-authorization requests created');
      return;
    }

    // For patient: attach requests
    const patient = await Patient.findOne({ userId });
    if (!patient) { sendError(res, 'Patient not found', 404); return; }
    const doctor = await Doctor.findOne({});
    if (!doctor) { sendError(res, 'No doctor found to associate with requests', 400); return; }

    const created = await populateRequestsForDoctor(
      doctor._id as mongoose.Types.ObjectId,
      doctor.userId as mongoose.Types.ObjectId,
      [patient]
    );
    sendSuccess(res, { count: created.length }, 'Sample claims created for patient');
  } catch (error) {
    console.error('Error seeding samples:', error);
    sendError(res, 'Failed to seed sample requests', 500);
  }
};

