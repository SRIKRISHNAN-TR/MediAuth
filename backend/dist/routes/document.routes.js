"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth");
const document_controller_1 = require("../controllers/document.controller");
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path_1.default.extname(file.originalname)}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF and image files are allowed'));
    }
};
const upload = (0, multer_1.default)({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', upload.single('file'), document_controller_1.uploadDocument);
router.get('/:requestId', document_controller_1.getDocuments);
router.delete('/:id', document_controller_1.deleteDocument);
router.patch('/:id/status', document_controller_1.updateDocumentStatus);
exports.default = router;
//# sourceMappingURL=document.routes.js.map