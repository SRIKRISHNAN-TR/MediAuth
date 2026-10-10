"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalysis = exports.analyzeRequest = exports.executeAIAnalysis = void 0;
const PreAuthRequest_1 = __importDefault(require("../models/PreAuthRequest"));
const Document_1 = __importDefault(require("../models/Document"));
const AIAnalysis_1 = __importDefault(require("../models/AIAnalysis"));
const apiResponse_1 = require("../utils/apiResponse");
const mockAIService_1 = require("../services/mockAIService");
const geminiService_1 = require("../services/geminiService");
const notificationService_1 = require("../services/notificationService");
const Doctor_1 = __importDefault(require("../models/Doctor"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Insurer_1 = __importDefault(require("../models/Insurer"));
const useMock = process.env.USE_MOCK_AI === 'true';
// Core AI Analysis executor reusable by controller and submit hook
const executeAIAnalysis = async (requestId) => {
    const request = await PreAuthRequest_1.default.findById(requestId);
    if (!request)
        return null;
    // Update status to ai_processing
    request.status = 'ai_processing';
    request.timeline.push({ status: 'ai_processing', timestamp: new Date(), note: 'AI analysis started' });
    await request.save();
    // Get documents for this request
    const documents = await Document_1.default.find({ requestId: request._id });
    // Run AI analysis (mock or real)
    let analysisResult;
    try {
        analysisResult = useMock
            ? await (0, mockAIService_1.mockAnalyze)(request, documents)
            : await (0, geminiService_1.geminiAnalyze)(request, documents);
    }
    catch (aiError) {
        console.error('AI analysis failed, falling back to mock:', aiError);
        analysisResult = await (0, mockAIService_1.mockAnalyze)(request, documents);
    }
    // Delete old analysis if exists
    await AIAnalysis_1.default.deleteOne({ requestId: request._id });
    // Save analysis
    const analysis = await AIAnalysis_1.default.create({
        requestId: request._id,
        ...analysisResult,
        processedAt: new Date(),
    });
    // Update request with analysis reference
    request.aiAnalysisId = analysis._id;
    // Determine next status
    if (analysisResult.missingDocuments.length > 0) {
        request.status = 'missing_documents';
        request.timeline.push({ status: 'missing_documents', timestamp: new Date(), note: `AI flagged ${analysisResult.missingDocuments.length} missing document(s)` });
    }
    else {
        request.status = 'under_review';
        request.timeline.push({ status: 'under_review', timestamp: new Date(), note: 'AI analysis complete. Moved to insurer review.' });
    }
    await request.save();
    // Notify doctor
    const doctor = await Doctor_1.default.findById(request.doctorId);
    if (doctor) {
        await (0, notificationService_1.createNotification)(doctor.userId.toString(), 'AI validation completed', `AI analysis complete for ${request.requestId}. Confidence: ${analysisResult.confidenceScore}%.${analysisResult.missingDocuments.length > 0 ? ` ${analysisResult.missingDocuments.length} document(s) missing.` : ''}`, 'ai_validation', request._id.toString());
    }
    // Notify patient
    const patient = await Patient_1.default.findById(request.patientId);
    if (patient) {
        await (0, notificationService_1.createNotification)(patient.userId.toString(), 'Your pre-authorization is under review', `Your claim ${request.requestId} has been processed and is now under insurer review.`, 'claim_update', request._id.toString());
    }
    // Notify all insurers of new request
    const insurers = await Insurer_1.default.find({});
    for (const insurer of insurers) {
        await (0, notificationService_1.createNotification)(insurer.userId.toString(), 'New pre-authorization request', `Request ${request.requestId} for ${request.treatmentDetails.procedureName} requires review. AI Confidence: ${analysisResult.confidenceScore}%.`, 'claim_update', request._id.toString());
    }
    return { analysis, requestStatus: request.status };
};
exports.executeAIAnalysis = executeAIAnalysis;
// POST /api/ai/analyze/:requestId
const analyzeRequest = async (req, res) => {
    try {
        const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;
        const result = await (0, exports.executeAIAnalysis)(requestId);
        if (!result) {
            (0, apiResponse_1.sendError)(res, 'Request not found', 404);
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, result, 'AI analysis completed');
    }
    catch (error) {
        console.error('AI analyze error:', error);
        (0, apiResponse_1.sendError)(res, 'AI analysis failed', 500);
    }
};
exports.analyzeRequest = analyzeRequest;
// GET /api/ai/analysis/:requestId
const getAnalysis = async (req, res) => {
    try {
        const request = await PreAuthRequest_1.default.findById(req.params.requestId);
        if (!request) {
            (0, apiResponse_1.sendError)(res, 'Request not found', 404);
            return;
        }
        const analysis = await AIAnalysis_1.default.findOne({ requestId: request._id });
        if (!analysis) {
            (0, apiResponse_1.sendError)(res, 'AI analysis not found', 404);
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, analysis);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to fetch analysis', 500);
    }
};
exports.getAnalysis = getAnalysis;
//# sourceMappingURL=ai.controller.js.map