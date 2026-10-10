import mongoose, { Document } from 'mongoose';
export type NotificationType = 'claim_update' | 'document_request' | 'ai_validation' | 'approval_rejection' | 'system';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    requestId?: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotification>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map