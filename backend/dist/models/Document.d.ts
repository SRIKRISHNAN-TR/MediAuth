import mongoose, { Document } from 'mongoose';
export type DocumentStatus = 'pending' | 'verified' | 'requires_review' | 'invalid';
export type DocumentType = 'medical_report' | 'prescription' | 'diagnostic_report' | 'insurance_card' | 'doctor_recommendation' | 'treatment_estimate' | 'other';
export interface IDocument extends Document {
    requestId: mongoose.Types.ObjectId;
    documentType: DocumentType;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    filePath: string;
    uploadedBy: mongoose.Types.ObjectId;
    verificationStatus: DocumentStatus;
    verificationNote?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDocument, {}, {}, {}, Document<unknown, {}, IDocument, {}, mongoose.DefaultSchemaOptions> & IDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDocument>;
export default _default;
//# sourceMappingURL=Document.d.ts.map