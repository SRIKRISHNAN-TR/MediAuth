import { NotificationType } from '../models/Notification';
import mongoose from 'mongoose';
export declare const createNotification: (userId: string | mongoose.Types.ObjectId, title: string, message: string, type: NotificationType, requestId?: string | mongoose.Types.ObjectId) => Promise<void>;
//# sourceMappingURL=notificationService.d.ts.map