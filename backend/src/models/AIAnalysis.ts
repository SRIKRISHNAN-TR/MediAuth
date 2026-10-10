import mongoose, { Document, Schema } from 'mongoose';

export interface IPipelineStep {
  step: string;
  status: 'completed' | 'warning' | 'failed' | 'pending';
  note?: string;
}

export interface IAIAnalysis extends Document {
  requestId: mongoose.Types.ObjectId;
  summary: string;
  missingDocuments: string[];
  missingInformation: string[];
  policyMatch: string;
  policyMatchScore: number; // 0-100
  confidenceScore: number;  // 0-100
  flags: string[];
  recommendation: string;
  pipeline: IPipelineStep[];
  rawResponse?: string; // store raw Gemini output for debugging
  processedAt: Date;
  createdAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'PreAuthRequest', required: true, unique: true },
    summary: { type: String, default: '' },
    missingDocuments: [{ type: String }],
    missingInformation: [{ type: String }],
    policyMatch: { type: String, default: '' },
    policyMatchScore: { type: Number, min: 0, max: 100, default: 0 },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    flags: [{ type: String }],
    recommendation: { type: String, default: '' },
    pipeline: [
      {
        step: { type: String },
        status: { type: String, enum: ['completed', 'warning', 'failed', 'pending'] },
        note: { type: String },
      },
    ],
    rawResponse: { type: String },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
