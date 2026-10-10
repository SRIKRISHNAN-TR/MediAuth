import mongoose from 'mongoose';
import { PreAuthStatus } from '../models/PreAuthRequest';
interface SeedCase {
    patientIndex: number;
    procedureName: string;
    cptCode: string;
    diagnosisCode: string;
    icdCode: string;
    description: string;
    hospitalName: string;
    estimatedDate: Date;
    provider: string;
    plan: string;
    policyNumber: string;
    requestedAmount: number;
    approvedAmount?: number;
    status: PreAuthStatus;
    reviewerRemarks?: string;
    timelineNotes: {
        status: PreAuthStatus;
        daysAgo: number;
        note: string;
    }[];
    ai?: {
        summary: string;
        missingDocuments: string[];
        missingInformation: string[];
        policyMatch: string;
        policyMatchScore: number;
        confidenceScore: number;
        flags: string[];
        recommendation: 'approve' | 'review' | 'reject';
        pipeline: {
            step: string;
            status: 'completed' | 'warning' | 'failed' | 'pending';
            note: string;
        }[];
    };
    documents?: {
        type: 'medical_report' | 'prescription' | 'diagnostic_report' | 'insurance_card' | 'doctor_recommendation' | 'treatment_estimate';
        name: string;
        size: number;
    }[];
}
export declare const SAMPLE_CASES: SeedCase[];
export declare function populateRequestsForDoctor(doctorId: mongoose.Types.ObjectId, doctorUserId: mongoose.Types.ObjectId, patients: any[]): Promise<(mongoose.Document<unknown, {}, import("../models/PreAuthRequest").IPreAuthRequest, {}, mongoose.DefaultSchemaOptions> & import("../models/PreAuthRequest").IPreAuthRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
})[]>;
export {};
//# sourceMappingURL=seedHelper.d.ts.map