import { Request, Response } from 'express';
import Document from '../models/Document';
import { sendSuccess, sendError } from '../utils/apiResponse';
import path from 'path';
import fs from 'fs';

// POST /api/documents
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) { sendError(res, 'No file uploaded', 400); return; }
    const { requestId, documentType } = req.body;
    if (!requestId) { sendError(res, 'requestId is required', 400); return; }

    const doc = await Document.create({
      requestId,
      documentType: documentType || 'other',
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      uploadedBy: req.user!.userId,
      verificationStatus: 'pending',
    });

    sendSuccess(res, doc, 'Document uploaded', 201);
  } catch (error) {
    sendError(res, 'Upload failed', 500);
  }
};

// GET /api/documents/:requestId
export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const docs = await Document.find({ requestId: req.params.requestId }).sort({ createdAt: -1 });
    sendSuccess(res, docs);
  } catch (error) {
    sendError(res, 'Failed to fetch documents', 500);
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) { sendError(res, 'Document not found', 404); return; }

    // Delete file from disk
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await doc.deleteOne();
    sendSuccess(res, null, 'Document deleted');
  } catch (error) {
    sendError(res, 'Failed to delete document', 500);
  }
};

// PATCH /api/documents/:id/status — Insurer updates verification status
export const updateDocumentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { verificationStatus, verificationNote } = req.body;
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { verificationStatus, verificationNote },
      { new: true }
    );
    if (!doc) { sendError(res, 'Document not found', 404); return; }
    sendSuccess(res, doc, 'Status updated');
  } catch (error) {
    sendError(res, 'Failed to update document status', 500);
  }
};
