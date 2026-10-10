"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAnalyze = void 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mockAnalyze = async (request, documents) => {
    // Simulate AI processing delay
    await sleep(2000);
    const hasInsuranceDoc = documents.some((d) => d.documentType === 'insurance_card');
    const hasMedicalReport = documents.some((d) => d.documentType === 'medical_report');
    const hasPrescription = documents.some((d) => d.documentType === 'prescription');
    const missingDocuments = [];
    if (!hasInsuranceDoc)
        missingDocuments.push('Insurance Policy Certificate');
    if (!hasMedicalReport)
        missingDocuments.push('Medical Report');
    if (!hasPrescription)
        missingDocuments.push('Doctor Prescription');
    const docScore = Math.max(0, 100 - missingDocuments.length * 15);
    const confidenceScore = Math.min(99, docScore - Math.floor(Math.random() * 5));
    const policyMatchScore = Math.min(99, confidenceScore + Math.floor(Math.random() * 8) - 4);
    const flags = [];
    if (missingDocuments.length > 0)
        flags.push(`${missingDocuments.length} required document(s) missing`);
    if (request.requestedAmount > 50000)
        flags.push('High-value claim: requires senior reviewer approval');
    const pipeline = [
        { step: 'Documents Uploaded', status: 'completed', note: `${documents.length} file(s) received (${(documents.reduce((a, d) => a + d.fileSize, 0) / 1024 / 1024).toFixed(1)} MB total)` },
        { step: 'Document Analysis', status: 'completed', note: 'OCR + NLP extraction completed' },
        { step: 'Missing Information Check', status: missingDocuments.length > 0 ? 'warning' : 'completed', note: missingDocuments.length > 0 ? `${missingDocuments.length} document(s) flagged for attention` : 'All required documents present' },
        { step: 'Policy Matching', status: 'completed', note: `${request.insuranceDetails.provider} ${request.insuranceDetails.plan || 'PPO'} surgical coverage` },
        { step: 'Confidence Scoring', status: 'completed', note: 'Bayesian model applied to claim data' },
        { step: 'Recommendation Generated', status: missingDocuments.length > 0 ? 'warning' : 'completed', note: missingDocuments.length > 0 ? 'Requires insurer review due to missing doc' : 'Sufficient documentation for review' },
    ];
    let recommendation = 'Approve';
    if (missingDocuments.length > 0)
        recommendation = 'Requires Insurer Review';
    if (confidenceScore < 60)
        recommendation = 'Manual Review Required';
    return {
        summary: `Pre-authorization request for ${request.treatmentDetails.procedureName} at ${request.treatmentDetails.hospitalName}. Patient: ${request.patientInfo.name}. Requested amount: $${request.requestedAmount.toLocaleString()}. AI analysis completed with ${confidenceScore}% confidence. Policy match with ${request.insuranceDetails.provider}: ${policyMatchScore}%.${missingDocuments.length > 0 ? ` Note: ${missingDocuments.length} document(s) require attention.` : ''}`,
        missingDocuments,
        missingInformation: [],
        policyMatch: `${request.insuranceDetails.provider} ${request.insuranceDetails.plan || 'Standard Plan'} — coverage verified for ${request.treatmentDetails.procedureName}`,
        policyMatchScore,
        confidenceScore,
        flags,
        recommendation,
        pipeline,
    };
};
exports.mockAnalyze = mockAnalyze;
//# sourceMappingURL=mockAIService.js.map