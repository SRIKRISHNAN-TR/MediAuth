import mongoose, { Document, Schema } from 'mongoose';

export type PreAuthStatus =
  | 'draft'
  | 'submitted'
  | 'ai_processing'
  | 'missing_documents'
  | 'under_review'
  | 'additional_info_required'
  | 'approved'
  | 'rejected';

export interface ITimelineEntry {
  status: PreAuthStatus;
  timestamp: Date;
  note?: string;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IPreAuthRequest extends Document {
  requestId: string; // MA-YYYY-XXXXX
  patientId: mongoose.Types.ObjectId; // ref Patient
  doctorId: mongoose.Types.ObjectId;  // ref Doctor
  insurerId?: mongoose.Types.ObjectId; // ref Insurer (assigned on submit)
  // Patient info snapshot at time of request
  patientInfo: {
    name: string;
    dateOfBirth: Date;
    gender: string;
    phone?: string;
    patientIdRef: string; // PT-XXXXX
  };
  // Treatment details
  treatmentDetails: {
    procedureName: string;
    cptCode?: string;
    diagnosisCode?: string;
    icdCode?: string;
    description?: string;
    hospitalName: string;
    estimatedDate?: Date;
  };
  // Insurance details
  insuranceDetails: {
    provider: string;
    plan?: string;
    policyNumber?: string;
  };
  requestedAmount: number;
  approvedAmount?: number;
  status: PreAuthStatus;
  aiAnalysisId?: mongoose.Types.ObjectId;
  reviewerRemarks?: string;
  timeline: ITimelineEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const PreAuthRequestSchema = new Schema<IPreAuthRequest>(
  {
    requestId: { type: String, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    insurerId: { type: Schema.Types.ObjectId, ref: 'Insurer' },
    patientInfo: {
      name: { type: String, required: true },
      dateOfBirth: { type: Date },
      gender: { type: String },
      phone: { type: String },
      patientIdRef: { type: String },
    },
    treatmentDetails: {
      procedureName: { type: String, required: true },
      cptCode: { type: String },
      diagnosisCode: { type: String },
      icdCode: { type: String },
      description: { type: String },
      hospitalName: { type: String, required: true },
      estimatedDate: { type: Date },
    },
    insuranceDetails: {
      provider: { type: String, required: true },
      plan: { type: String },
      policyNumber: { type: String },
    },
    requestedAmount: { type: Number, required: true, min: 0 },
    approvedAmount: { type: Number, min: 0 },
    status: {
      type: String,
      enum: [
        'draft', 'submitted', 'ai_processing', 'missing_documents',
        'under_review', 'additional_info_required', 'approved', 'rejected',
      ],
      default: 'draft',
    },
    aiAnalysisId: { type: Schema.Types.ObjectId, ref: 'AIAnalysis' },
    reviewerRemarks: { type: String },
    timeline: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate requestId: MA-YYYY-XXXXX
PreAuthRequestSchema.pre<IPreAuthRequest>('save', async function () {
  if (!this.requestId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('PreAuthRequest').countDocuments();
    this.requestId = `MA-${year}-${String(count + 1).padStart(5, '0')}`;
    this.timeline.push({ status: this.status, timestamp: new Date() });
  }
});

export default mongoose.model<IPreAuthRequest>('PreAuthRequest', PreAuthRequestSchema);
