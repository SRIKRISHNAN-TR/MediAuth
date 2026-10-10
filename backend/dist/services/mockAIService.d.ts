import { IPreAuthRequest } from '../models/PreAuthRequest';
import { IDocument } from '../models/Document';
import { IPipelineStep } from '../models/AIAnalysis';
export interface AIAnalysisResult {
    summary: string;
    missingDocuments: string[];
    missingInformation: string[];
    policyMatch: string;
    policyMatchScore: number;
    confidenceScore: number;
    flags: string[];
    recommendation: string;
    pipeline: IPipelineStep[];
}
export declare const mockAnalyze: (request: IPreAuthRequest, documents: IDocument[]) => Promise<AIAnalysisResult>;
//# sourceMappingURL=mockAIService.d.ts.map