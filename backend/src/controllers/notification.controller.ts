import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { sendSuccess, sendError } from '../utils/apiResponse';

// GET /api/notifications
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user!.userId, read: false });
    sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    sendError(res, 'Failed to fetch notifications', 500);
  }
};

// PATCH /api/notifications/:id/read
export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { read: true }
    );
    sendSuccess(res, null, 'Notification marked as read');
  } catch (error) {
    sendError(res, 'Failed to mark notification', 500);
  }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user!.userId, read: false }, { read: true });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    sendError(res, 'Failed to mark all notifications', 500);
  }
};
