import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, error?: string) => Response;
//# sourceMappingURL=apiResponse.d.ts.map