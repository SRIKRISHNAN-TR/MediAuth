import mongoose, { Document } from 'mongoose';
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
    policyMatchScore: number;
    confidenceScore: number;
    flags: string[];
    recommendation: string;
    pipeline: IPipelineStep[];
    rawResponse?: string;
    processedAt: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAIAnalysis, {}, {}, {}, Document<unknown, {}, IAIAnalysis, {}, mongoose.DefaultSchemaOptions> & IAIAnalysis & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAIAnalysis>;
export default _default;
//# sourceMappingURL=AIAnalysis.d.ts.map