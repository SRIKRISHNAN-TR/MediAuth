import Notification, { NotificationType } from '../models/Notification';
import mongoose from 'mongoose';

export const createNotification = async (
  userId: string | mongoose.Types.ObjectId,
  title: string,
  message: string,
  type: NotificationType,
  requestId?: string | mongoose.Types.ObjectId
): Promise<void> => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      requestId,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
