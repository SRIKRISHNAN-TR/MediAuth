"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const createNotification = async (userId, title, message, type, requestId) => {
    try {
        await Notification_1.default.create({
            userId,
            title,
            message,
            type,
            requestId,
        });
    }
    catch (error) {
        console.error('Failed to create notification:', error);
    }
};
exports.createNotification = createNotification;
//# sourceMappingURL=notificationService.js.map