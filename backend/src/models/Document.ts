import mongoose, { Document, Schema } from 'mongoose';

export type DocumentStatus = 'pending' | 'verified' | 'requires_review' | 'invalid';

export type DocumentType =
  | 'medical_report'
  | 'prescription'
  | 'diagnostic_report'
  | 'insurance_card'
  | 'doctor_recommendation'
  | 'treatment_estimate'
  | 'other';

export interface IDocument extends Document {
  requestId: mongoose.Types.ObjectId;
  documentType: DocumentType;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploadedBy: mongoose.Types.ObjectId; // ref User
  verificationStatus: DocumentStatus;
  verificationNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'PreAuthRequest', required: true },
    documentType: {
      type: String,
      enum: [
        'medical_report', 'prescription', 'diagnostic_report',
        'insurance_card', 'doctor_recommendation', 'treatment_estimate', 'other',
      ],
      default: 'other',
    },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'requires_review', 'invalid'],
      default: 'pending',
    },
    verificationNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);
