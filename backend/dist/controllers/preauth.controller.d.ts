import { Request, Response } from 'express';
export declare const createRequest: (req: Request, res: Response) => Promise<void>;
export declare const getRequests: (req: Request, res: Response) => Promise<void>;
export declare const getRequestById: (req: Request, res: Response) => Promise<void>;
export declare const updateRequest: (req: Request, res: Response) => Promise<void>;
export declare const submitRequest: (req: Request, res: Response) => Promise<void>;
export declare const updateStatus: (req: Request, res: Response) => Promise<void>;
export declare const getStats: (req: Request, res: Response) => Promise<void>;
export declare const seedSamplesForCurrentUser: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=preauth.controller.d.ts.map