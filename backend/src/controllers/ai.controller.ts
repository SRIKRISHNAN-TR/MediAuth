import { Request, Response } from 'express';
import PreAuthRequest from '../models/PreAuthRequest';
import Document from '../models/Document';
import AIAnalysis from '../models/AIAnalysis';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { mockAnalyze } from '../services/mockAIService';
import { geminiAnalyze } from '../services/geminiService';
import { createNotification } from '../services/notificationService';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Insurer from '../models/Insurer';

const useMock = process.env.USE_MOCK_AI === 'true';

// Core AI Analysis executor reusable by controller and submit hook
export const executeAIAnalysis = async (requestId: string) => {
  const request = await PreAuthRequest.findById(requestId);
  if (!request) return null;

  // Update status to ai_processing
  request.status = 'ai_processing';
  request.timeline.push({ status: 'ai_processing', timestamp: new Date(), note: 'AI analysis started' });
  await request.save();

  // Get documents for this request
  const documents = await Document.find({ requestId: request._id });

  // Run AI analysis (mock or real)
  let analysisResult;
  try {
    analysisResult = useMock
      ? await mockAnalyze(request, documents)
      : await geminiAnalyze(request, documents);
  } catch (aiError) {
    console.error('AI analysis failed, falling back to mock:', aiError);
    analysisResult = await mockAnalyze(request, documents);
  }

  // Delete old analysis if exists
  await AIAnalysis.deleteOne({ requestId: request._id });

  // Save analysis
  const analysis = await AIAnalysis.create({
    requestId: request._id,
    ...analysisResult,
    processedAt: new Date(),
  });

  // Update request with analysis reference
  request.aiAnalysisId = analysis._id as import('mongoose').Types.ObjectId;

  // Determine next status
  if (analysisResult.missingDocuments.length > 0) {
    request.status = 'missing_documents';
    request.timeline.push({ status: 'missing_documents', timestamp: new Date(), note: `AI flagged ${analysisResult.missingDocuments.length} missing document(s)` });
  } else {
    request.status = 'under_review';
    request.timeline.push({ status: 'under_review', timestamp: new Date(), note: 'AI analysis complete. Moved to insurer review.' });
  }
  await request.save();

  // Notify doctor
  const doctor = await Doctor.findById(request.doctorId);
  if (doctor) {
    await createNotification(
      doctor.userId!.toString(),
      'AI validation completed',
      `AI analysis complete for ${request.requestId}. Confidence: ${analysisResult.confidenceScore}%.${analysisResult.missingDocuments.length > 0 ? ` ${analysisResult.missingDocuments.length} document(s) missing.` : ''}`,
      'ai_validation',
      request._id!.toString()
    );
  }

  // Notify patient
  const patient = await Patient.findById(request.patientId);
  if (patient) {
    await createNotification(
      patient.userId!.toString(),
      'Your pre-authorization is under review',
      `Your claim ${request.requestId} has been processed and is now under insurer review.`,
      'claim_update',
      request._id!.toString()
    );
  }

  // Notify all insurers of new request
  const insurers = await Insurer.find({});
  for (const insurer of insurers) {
    await createNotification(
      insurer.userId!.toString(),
      'New pre-authorization request',
      `Request ${request.requestId} for ${request.treatmentDetails.procedureName} requires review. AI Confidence: ${analysisResult.confidenceScore}%.`,
      'claim_update',
      request._id!.toString()
    );
  }

  return { analysis, requestStatus: request.status };
};

// POST /api/ai/analyze/:requestId
export const analyzeRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;
    const result = await executeAIAnalysis(requestId);
    if (!result) { sendError(res, 'Request not found', 404); return; }
    sendSuccess(res, result, 'AI analysis completed');
  } catch (error) {
    console.error('AI analyze error:', error);
    sendError(res, 'AI analysis failed', 500);
  }
};

// GET /api/ai/analysis/:requestId
export const getAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await PreAuthRequest.findById(req.params.requestId);
    if (!request) { sendError(res, 'Request not found', 404); return; }

    const analysis = await AIAnalysis.findOne({ requestId: request._id });
    if (!analysis) { sendError(res, 'AI analysis not found', 404); return; }

    sendSuccess(res, analysis);
  } catch (error) {
    sendError(res, 'Failed to fetch analysis', 500);
  }
};
