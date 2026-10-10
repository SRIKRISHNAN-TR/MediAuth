// ─── Auth ──────────────────────────────────────────────────────────────────
export type Role = 'doctor' | 'patient' | 'insurer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// ─── Doctor Profile ────────────────────────────────────────────────────────
export interface DoctorProfile {
  _id: string;
  userId: string;
  specialization: string;
  hospitalName: string;
  npiNumber: string;
  department?: string;
  phone?: string;
}

// ─── Patient Profile ───────────────────────────────────────────────────────
export interface PatientProfile {
  _id: string;
  userId: string;
  patientId: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  insurancePlan?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

// ─── Insurer Profile ───────────────────────────────────────────────────────
export interface InsurerProfile {
  _id: string;
  userId: string;
  organizationName: string;
  department?: string;
  licenseNumber?: string;
  phone?: string;
}

// ─── PreAuth ───────────────────────────────────────────────────────────────
export type PreAuthStatus =
  | 'draft'
  | 'submitted'
  | 'ai_processing'
  | 'missing_documents'
  | 'under_review'
  | 'additional_info_required'
  | 'approved'
  | 'rejected';

export interface TimelineEntry {
  status: PreAuthStatus;
  timestamp: string;
  note?: string;
}

export interface PreAuthRequest {
  _id: string;
  requestId: string;
  patientInfo: {
    name: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    patientIdRef?: string;
  };
  treatmentDetails: {
    procedureName: string;
    cptCode?: string;
    diagnosisCode?: string;
    icdCode?: string;
    description?: string;
    hospitalName: string;
    estimatedDate?: string;
  };
  insuranceDetails: {
    provider: string;
    plan?: string;
    policyNumber?: string;
  };
  requestedAmount: number;
  approvedAmount?: number;
  status: PreAuthStatus;
  aiAnalysisId?: AIAnalysis;
  reviewerRemarks?: string;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── Document ──────────────────────────────────────────────────────────────
export type DocumentStatus = 'pending' | 'verified' | 'requires_review' | 'invalid';
export type DocumentType =
  | 'medical_report' | 'prescription' | 'diagnostic_report'
  | 'insurance_card' | 'doctor_recommendation' | 'treatment_estimate' | 'other';

export interface MedDocument {
  _id: string;
  requestId: string;
  documentType: DocumentType;
  fileName: string;
  filePath?: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: DocumentStatus;
  verificationNote?: string;
  createdAt: string;
}


// ─── AI Analysis ───────────────────────────────────────────────────────────
export interface PipelineStep {
  step: string;
  status: 'completed' | 'warning' | 'failed' | 'pending';
  note?: string;
}

export interface AIAnalysis {
  _id: string;
  requestId: string;
  summary: string;
  missingDocuments: string[];
  missingInformation: string[];
  policyMatch: string;
  policyMatchScore: number;
  confidenceScore: number;
  flags: string[];
  recommendation: string;
  pipeline: PipelineStep[];
  processedAt: string;
}

// ─── Notification ──────────────────────────────────────────────────────────
export type NotificationType =
  | 'claim_update' | 'document_request' | 'ai_validation'
  | 'approval_rejection' | 'system';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  requestId?: string;
  createdAt: string;
}

// ─── Stats ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  missingDocs: number;
  underReview: number;
  aiProcessing: number;
  additionalInfo: number;
}

// ─── API Response ──────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
