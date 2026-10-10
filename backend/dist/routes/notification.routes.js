"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', notification_controller_1.getNotifications);
router.patch('/read-all', notification_controller_1.markAllRead);
router.patch('/:id/read', notification_controller_1.markRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map