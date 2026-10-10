"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PreAuthRequestSchema = new mongoose_1.Schema({
    requestId: { type: String, unique: true },
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Patient' },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    insurerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Insurer' },
    patientInfo: {
        name: { type: String, required: true },
        dateOfBirth: { type: Date },
        gender: { type: String },
        phone: { type: String },
        patientIdRef: { type: String },
    },
    treatmentDetails: {
        procedureName: { type: String, required: true },
        cptCode: { type: String },
        diagnosisCode: { type: String },
        icdCode: { type: String },
        description: { type: String },
        hospitalName: { type: String, required: true },
        estimatedDate: { type: Date },
    },
    insuranceDetails: {
        provider: { type: String, required: true },
        plan: { type: String },
        policyNumber: { type: String },
    },
    requestedAmount: { type: Number, required: true, min: 0 },
    approvedAmount: { type: Number, min: 0 },
    status: {
        type: String,
        enum: [
            'draft', 'submitted', 'ai_processing', 'missing_documents',
            'under_review', 'additional_info_required', 'approved', 'rejected',
        ],
        default: 'draft',
    },
    aiAnalysisId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AIAnalysis' },
    reviewerRemarks: { type: String },
    timeline: [
        {
            status: { type: String },
            timestamp: { type: Date, default: Date.now },
            note: { type: String },
            updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        },
    ],
}, { timestamps: true });
// Auto-generate requestId: MA-YYYY-XXXXX
PreAuthRequestSchema.pre('save', async function () {
    if (!this.requestId) {
        const year = new Date().getFullYear();
        const count = await mongoose_1.default.model('PreAuthRequest').countDocuments();
        this.requestId = `MA-${year}-${String(count + 1).padStart(5, '0')}`;
        this.timeline.push({ status: this.status, timestamp: new Date() });
    }
});
exports.default = mongoose_1.default.model('PreAuthRequest', PreAuthRequestSchema);
//# sourceMappingURL=PreAuthRequest.js.map