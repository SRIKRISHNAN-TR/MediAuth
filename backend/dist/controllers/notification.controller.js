"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.markRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const apiResponse_1 = require("../utils/apiResponse");
// GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification_1.default.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification_1.default.countDocuments({ userId: req.user.userId, read: false });
        (0, apiResponse_1.sendSuccess)(res, { notifications, unreadCount });
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to fetch notifications', 500);
    }
};
exports.getNotifications = getNotifications;
// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
    try {
        await Notification_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { read: true });
        (0, apiResponse_1.sendSuccess)(res, null, 'Notification marked as read');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to mark notification', 500);
    }
};
exports.markRead = markRead;
// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
    try {
        await Notification_1.default.updateMany({ userId: req.user.userId, read: false }, { read: true });
        (0, apiResponse_1.sendSuccess)(res, null, 'All notifications marked as read');
    }
    catch (error) {
        (0, apiResponse_1.sendError)(res, 'Failed to mark all notifications', 500);
    }
};
exports.markAllRead = markAllRead;
//# sourceMappingURL=notification.controller.js.map