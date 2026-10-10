"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/analyze/:requestId', ai_controller_1.analyzeRequest);
router.get('/analysis/:requestId', ai_controller_1.getAnalysis);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map