import mongoose, { Document } from 'mongoose';
export type PreAuthStatus = 'draft' | 'submitted' | 'ai_processing' | 'missing_documents' | 'under_review' | 'additional_info_required' | 'approved' | 'rejected';
export interface ITimelineEntry {
    status: PreAuthStatus;
    timestamp: Date;
    note?: string;
    updatedBy?: mongoose.Types.ObjectId;
}
export interface IPreAuthRequest extends Document {
    requestId: string;
    patientId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    insurerId?: mongoose.Types.ObjectId;
    patientInfo: {
        name: string;
        dateOfBirth: Date;
        gender: string;
        phone?: string;
        patientIdRef: string;
    };
    treatmentDetails: {
        procedureName: string;
        cptCode?: string;
        diagnosisCode?: string;
        icdCode?: string;
        description?: string;
        hospitalName: string;
        estimatedDate?: Date;
    };
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
declare const _default: mongoose.Model<IPreAuthRequest, {}, {}, {}, Document<unknown, {}, IPreAuthRequest, {}, mongoose.DefaultSchemaOptions> & IPreAuthRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPreAuthRequest>;
export default _default;
//# sourceMappingURL=PreAuthRequest.d.ts.map