"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiAnalyze = void 0;
const generative_ai_1 = require("@google/generative-ai");
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        throw new Error('GEMINI_API_KEY not configured');
    return new generative_ai_1.GoogleGenerativeAI(apiKey);
};
const geminiAnalyze = async (request, documents) => {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const docList = documents.map((d) => `- ${d.originalName} (${d.documentType}, ${(d.fileSize / 1024).toFixed(0)} KB)`).join('\n');
    const prompt = `
You are a medical insurance pre-authorization AI assistant. Your role is DECISION SUPPORT ONLY. You do NOT approve or reject insurance claims — that decision belongs solely to the human insurance reviewer.

Analyze the following pre-authorization request and return a structured JSON response.

## Request Details
- Request ID: ${request.requestId}
- Patient: ${request.patientInfo.name}, DOB: ${request.patientInfo.dateOfBirth}
- Procedure: ${request.treatmentDetails.procedureName}
- CPT Code: ${request.treatmentDetails.cptCode || 'Not provided'}
- Diagnosis: ${request.treatmentDetails.diagnosisCode || 'Not provided'}
- ICD Code: ${request.treatmentDetails.icdCode || 'Not provided'}
- Hospital: ${request.treatmentDetails.hospitalName}
- Requested Amount: $${request.requestedAmount}
- Insurance Provider: ${request.insuranceDetails.provider}
- Plan: ${request.insuranceDetails.plan || 'Not specified'}
- Policy Number: ${request.insuranceDetails.policyNumber || 'Not provided'}

## Uploaded Documents
${docList || 'No documents uploaded'}

## Your Task
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "summary": "Concise 2-3 sentence summary of the request and key findings",
  "missingDocuments": ["List of document names that are typically required but appear to be missing"],
  "missingInformation": ["List of information fields that are missing or incomplete"],
  "policyMatch": "Brief statement about policy coverage alignment",
  "policyMatchScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "flags": ["Any concerns, high-value amount alerts, or items needing attention"],
  "recommendation": "One of: Approve / Requires Insurer Review / Manual Review Required / Insufficient Documentation",
  "pipeline": [
    {"step": "Documents Uploaded", "status": "completed", "note": "..."},
    {"step": "Document Analysis", "status": "completed", "note": "..."},
    {"step": "Missing Information Check", "status": "completed|warning|failed", "note": "..."},
    {"step": "Policy Matching", "status": "completed|warning|failed", "note": "..."},
    {"step": "Confidence Scoring", "status": "completed", "note": "..."},
    {"step": "Recommendation Generated", "status": "completed|warning", "note": "..."}
  ]
}

Important: Do not invent medical facts. Base your analysis only on the information provided. Be honest about uncertainty.
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Parse and validate the JSON response
    let parsed;
    try {
        // Strip any accidental markdown fences
        const clean = text.replace(/```json\n?|\n?```/g, '').trim();
        parsed = JSON.parse(clean);
    }
    catch {
        throw new Error(`Gemini returned invalid JSON: ${text.substring(0, 200)}`);
    }
    // Validate required fields
    if (typeof parsed.confidenceScore !== 'number' || typeof parsed.policyMatchScore !== 'number') {
        throw new Error('Gemini response missing required numeric fields');
    }
    return parsed;
};
exports.geminiAnalyze = geminiAnalyze;
//# sourceMappingURL=geminiService.js.map