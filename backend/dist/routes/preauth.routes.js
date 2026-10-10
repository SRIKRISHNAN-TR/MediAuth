"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const preauth_controller_1 = require("../controllers/preauth.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/stats', preauth_controller_1.getStats);
router.post('/seed-samples', preauth_controller_1.seedSamplesForCurrentUser);
router.get('/', preauth_controller_1.getRequests);
router.post('/', (0, auth_1.requireRole)('doctor'), preauth_controller_1.createRequest);
router.get('/:id', preauth_controller_1.getRequestById);
router.put('/:id', (0, auth_1.requireRole)('doctor'), preauth_controller_1.updateRequest);
router.post('/:id/submit', (0, auth_1.requireRole)('doctor'), preauth_controller_1.submitRequest);
router.patch('/:id/status', (0, auth_1.requireRole)('insurer'), preauth_controller_1.updateStatus);
exports.default = router;
//# sourceMappingURL=preauth.routes.js.map