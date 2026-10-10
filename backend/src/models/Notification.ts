import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'claim_update'
  | 'document_request'
  | 'ai_validation'
  | 'approval_rejection'
  | 'system';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  requestId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['claim_update', 'document_request', 'ai_validation', 'approval_rejection', 'system'],
      default: 'system',
    },
    read: { type: Boolean, default: false },
    requestId: { type: Schema.Types.ObjectId, ref: 'PreAuthRequest' },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
