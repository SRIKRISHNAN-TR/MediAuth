import { Request, Response } from 'express';
export declare const executeAIAnalysis: (requestId: string) => Promise<{
    analysis: import("mongoose").Document<unknown, {}, import("../models/AIAnalysis").IAIAnalysis, {}, import("mongoose").DefaultSchemaOptions> & import("../models/AIAnalysis").IAIAnalysis & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    requestStatus: "missing_documents" | "under_review";
} | null>;
export declare const analyzeRequest: (req: Request, res: Response) => Promise<void>;
export declare const getAnalysis: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=ai.controller.d.ts.map