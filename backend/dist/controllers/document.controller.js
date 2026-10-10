"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocumentStatus = exports.deleteDocument = exports.getDocuments = exports.uploadDocument = void 0;
const Document_1 = __importDefault(require("../models/Document"));
const apiResponse_1 = require("../utils/apiResponse");
const fs_1 = __importDefault(require("fs"));
// POST /api/documents
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            (0, apiResponse_1.sendError)(res, 'No file uploaded', 400);
            return;
        }
        const { requestId, documentType } = req.body;
        if (!requestId) {
            (0, apiResponse_1.sendError)(res, 'requestId is required', 400);
            return;
        }
        const doc = await Document_1.default.create({
            requestId,
            documentType: documentType || 'other',
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            filePath: req.file.path,
            uploadedBy: req.user.userId,
            verificationStatus: 'pending',
        });
        (0, apiResponse_1.sendSuccess)(res, doc, 'Document uploaded', 201);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Upload failed', 500);
    }
};
exports.uploadDocument = uploadDocument;
// GET /api/documents/:requestId
const getDocuments = async (req, res) => {
    try {
        const docs = await Document_1.default.find({ requestId: req.params.requestId }).sort({ createdAt: -1 });
        (0, apiResponse_1.sendSuccess)(res, docs);
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to fetch documents', 500);
    }
};
exports.getDocuments = getDocuments;
// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
    try {
        const doc = await Document_1.default.findById(req.params.id);
        if (!doc) {
            (0, apiResponse_1.sendError)(res, 'Document not found', 404);
            return;
        }
        // Delete file from disk
        if (fs_1.default.existsSync(doc.filePath)) {
            fs_1.default.unlinkSync(doc.filePath);
        }
        await doc.deleteOne();
        (0, apiResponse_1.sendSuccess)(res, null, 'Document deleted');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to delete document', 500);
    }
};
exports.deleteDocument = deleteDocument;
// PATCH /api/documents/:id/status — Insurer updates verification status
const updateDocumentStatus = async (req, res) => {
    try {
        const { verificationStatus, verificationNote } = req.body;
        const doc = await Document_1.default.findByIdAndUpdate(req.params.id, { verificationStatus, verificationNote }, { new: true });
        if (!doc) {
            (0, apiResponse_1.sendError)(res, 'Document not found', 404);
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, doc, 'Status updated');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to update document status', 500);
    }
};
exports.updateDocumentStatus = updateDocumentStatus;
//# sourceMappingURL=document.controller.js.map