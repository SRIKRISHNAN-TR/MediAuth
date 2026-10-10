import mongoose from 'mongoose';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Insurer from '../models/Insurer';
import PreAuthRequest, { PreAuthStatus } from '../models/PreAuthRequest';
import AIAnalysis from '../models/AIAnalysis';
import Notification from '../models/Notification';
import Document from '../models/Document';

interface SeedCase {
  patientIndex: number;
  procedureName: string;
  cptCode: string;
  diagnosisCode: string;
  icdCode: string;
  description: string;
  hospitalName: string;
  estimatedDate: Date;
  provider: string;
  plan: string;
  policyNumber: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: PreAuthStatus;
  reviewerRemarks?: string;
  timelineNotes: { status: PreAuthStatus; daysAgo: number; note: string }[];
  ai?: {
    summary: string;
    missingDocuments: string[];
    missingInformation: string[];
    policyMatch: string;
    policyMatchScore: number;
    confidenceScore: number;
    flags: string[];
    recommendation: 'approve' | 'review' | 'reject';
    pipeline: { step: string; status: 'completed' | 'warning' | 'failed' | 'pending'; note: string }[];
  };
  documents?: {
    type: 'medical_report' | 'prescription' | 'diagnostic_report' | 'insurance_card' | 'doctor_recommendation' | 'treatment_estimate';
    name: string;
    size: number;
  }[];
}

export const SAMPLE_CASES: SeedCase[] = [
  {
    patientIndex: 0,
    procedureName: 'Total Knee Arthroplasty (Right Knee)',
    cptCode: '27447',
    diagnosisCode: 'M17.11',
    icdCode: 'ICD-10',
    description: 'Severe primary osteoarthritis of the right knee. Patient has failed 6 months of conservative management including NSAIDs, physical therapy, and steroid injections. Severe functional mobility limitation.',
    hospitalName: 'City General Hospital - Orthopedic Pavilion',
    estimatedDate: new Date('2026-11-15'),
    provider: 'BlueCross BlueShield',
    plan: 'Gold PPO',
    policyNumber: 'BCB-987654',
    requestedAmount: 42500,
    status: 'submitted',
    timelineNotes: [
      { status: 'submitted', daysAgo: 1, note: 'Pre-authorization submitted with clinical radiographs and surgical estimate.' },
    ],
    ai: {
      summary: 'Orthopedic evaluation confirms advanced tri-compartmental osteoarthritis. Failed conservative therapy protocol fully documented. Procedure matches policy medical necessity guidelines.',
      missingDocuments: [],
      missingInformation: [],
      policyMatch: 'Total Knee Replacement covered under Gold PPO with documented radiographic joint space collapse.',
      policyMatchScore: 88,
      confidenceScore: 85,
      flags: [],
      recommendation: 'review',
      pipeline: [
        { step: 'Document Verification', status: 'completed', note: 'X-Ray imaging & PT logs verified' },
        { step: 'Policy Coverage Check', status: 'completed', note: 'Pre-authorization criteria satisfied' },
        { step: 'Medical Necessity Review', status: 'completed', note: 'Conservative therapy failure established' },
        { step: 'Cost Analysis', status: 'completed', note: 'Requested amount within standard regional DRG band' },
        { step: 'Risk Assessment', status: 'completed', note: 'Standard low-risk surgical pathway' },
      ],
    },
    documents: [
      { type: 'diagnostic_report', name: 'Right_Knee_Weightbearing_XRay.pdf', size: 2450000 },
      { type: 'doctor_recommendation', name: 'Orthopedic_Surgical_Consult.pdf', size: 1200000 },
      { type: 'treatment_estimate', name: 'TKA_Hospital_Cost_Estimate.pdf', size: 450000 },
    ],
  },
  {
    patientIndex: 1,
    procedureName: 'Percutaneous Coronary Intervention with Drug-Eluting Stent',
    cptCode: '92928',
    diagnosisCode: 'I25.10',
    icdCode: 'ICD-10',
    description: 'Patient with progressive CCS Class III angina refractory to dual anti-anginal medications. Coronary angiography demonstrates critical 85% proximal LAD stenosis.',
    hospitalName: 'Cardiovascular Institute of St. Jude',
    estimatedDate: new Date('2026-10-25'),
    provider: 'Aetna Health',
    plan: 'Platinum Plus',
    policyNumber: 'AET-443921',
    requestedAmount: 38000,
    status: 'ai_processing',
    timelineNotes: [
      { status: 'submitted', daysAgo: 2, note: 'Pre-authorization submitted by interventional cardiologist.' },
      { status: 'ai_processing', daysAgo: 1, note: 'AI clinical entity extraction and policy verification in progress.' },
    ],
    ai: {
      summary: 'Angiographic evidence demonstrates flow-limiting coronary lesion. Clinical documentation in processing pipeline.',
      missingDocuments: [],
      missingInformation: [],
      policyMatch: 'Interventional stenting covered under Platinum Plus policy for critical ischemic lesions.',
      policyMatchScore: 85,
      confidenceScore: 78,
      flags: [],
      recommendation: 'review',
      pipeline: [
        { step: 'Document Verification', status: 'completed', note: 'Angiogram report parsed' },
        { step: 'Policy Coverage Check', status: 'completed', note: 'Procedure covered under interventional cardiology' },
        { step: 'Medical Necessity Review', status: 'pending', note: 'Evaluating hemodynamic significance' },
        { step: 'Cost Analysis', status: 'pending', note: 'Pricing benchmarks calculation' },
        { step: 'Risk Assessment', status: 'pending', note: 'Cardiovascular risk scoring' },
      ],
    },
    documents: [
      { type: 'diagnostic_report', name: 'Coronary_Angiogram_Cine_Report.pdf', size: 3100000 },
      { type: 'medical_report', name: 'Stress_Echo_Cardiology_Summary.pdf', size: 1800000 },
    ],
  },
  {
    patientIndex: 0,
    procedureName: 'Coronary Artery Bypass Graft (CABG x3)',
    cptCode: '33533',
    diagnosisCode: 'I25.10',
    icdCode: 'ICD-10',
    description: 'Severe multi-vessel coronary artery disease with left main equivalent involvement. Conservative management failed. Urgent revascularization indicated.',
    hospitalName: 'City General Hospital',
    estimatedDate: new Date('2026-10-18'),
    provider: 'BlueCross BlueShield',
    plan: 'Gold PPO',
    policyNumber: 'BCB-987654',
    requestedAmount: 75000,
    status: 'under_review',
    timelineNotes: [
      { status: 'submitted', daysAgo: 7, note: 'Pre-authorization submitted by cardiothoracic surgery.' },
      { status: 'ai_processing', daysAgo: 6, note: 'AI clinical analysis completed with 92% confidence.' },
      { status: 'under_review', daysAgo: 5, note: 'Transferred to Senior Medical Director review queue.' },
    ],
    ai: {
      summary: 'Patient has documented multi-vessel CAD. Procedure (triple CABG) is clinically appropriate and urgent. All diagnostic angiography and echocardiogram reports verified. Fully covered under policy terms.',
      missingDocuments: [],
      missingInformation: [],
      policyMatch: 'CABG is fully covered under Gold PPO for documented triple-vessel CAD.',
      policyMatchScore: 94,
      confidenceScore: 92,
      flags: [],
      recommendation: 'approve',
      pipeline: [
        { step: 'Document Verification', status: 'completed', note: 'All required cardiac reports present' },
        { step: 'Policy Coverage Check', status: 'completed', note: 'Triple CABG verified under Gold PPO schedule' },
        { step: 'Medical Necessity Review', status: 'completed', note: 'Urgent revascularization criteria met' },
        { step: 'Cost Analysis', status: 'completed', note: 'Estimated $75,000 matches allowable threshold' },
        { step: 'Risk Assessment', status: 'completed', note: 'High clinical acuity, low administrative denial risk' },
      ],
    },
    documents: [
      { type: 'medical_report', name: 'Cardiac_Cath_Report.pdf', size: 4200000 },
      { type: 'doctor_recommendation', name: 'Surgical_Recommendation_Dr_Mitchell.pdf', size: 850000 },
      { type: 'insurance_card', name: 'Insurance_Card_Front_Back.pdf', size: 620000 },
    ],
  },
  {
    patientIndex: 2,
    procedureName: 'Magnetic Resonance Imaging (MRI) Brain with & without Contrast',
    cptCode: '70553',
    diagnosisCode: 'G43.909',
    icdCode: 'ICD-10',
    description: 'Workup for intractable migraine with progressive focal neurological symptoms. Rule out intracranial lesion or vascular malformation.',
    hospitalName: 'Metro Health Diagnostic Center',
    estimatedDate: new Date('2026-10-30'),
    provider: 'UnitedHealthcare',
    plan: 'Silver HMO',
    policyNumber: 'UHC-109283',
    requestedAmount: 3500,
    status: 'missing_documents',
    timelineNotes: [
      { status: 'submitted', daysAgo: 4, note: 'Pre-authorization submitted.' },
      { status: 'ai_processing', daysAgo: 4, note: 'AI analysis evaluated documentation against HMO guidelines.' },
      { status: 'missing_documents', daysAgo: 3, note: 'AI flagged missing specialist referral and trial history.' },
    ],
    ai: {
      summary: 'MRI brain scan requested for headache workup. Policy requires prior trial of conservative medication therapy and specialist neurologist consultation letter prior to MRI authorization.',
      missingDocuments: ['Neurologist Consultation Letter', '6-Week Conservative Medication History'],
      missingInformation: ['Specific Red-Flag Neurological Deficit Documentation'],
      policyMatch: 'Conditionally covered. Requires documented conservative medication failure and specialist referral.',
      policyMatchScore: 62,
      confidenceScore: 56,
      flags: ['Missing specialist referral', 'Unverified pharmaceutical trial records'],
      recommendation: 'review',
      pipeline: [
        { step: 'Document Verification', status: 'warning', note: '2 required clinical documents missing' },
        { step: 'Policy Coverage Check', status: 'completed', note: 'MRI is on formulary but restricted' },
        { step: 'Medical Necessity Review', status: 'warning', note: 'Incomplete documentation for immediate authorization' },
        { step: 'Cost Analysis', status: 'completed', note: 'Amount is within standard MRI schedule' },
        { step: 'Risk Assessment', status: 'warning', note: 'Medium audit risk due to missing referral' },
      ],
    },
    documents: [
      { type: 'medical_report', name: 'Primary_Care_Encounter_Notes.pdf', size: 950000 },
    ],
  },
  {
    patientIndex: 3,
    procedureName: 'Laparoscopic Sleeve Gastrectomy',
    cptCode: '43775',
    diagnosisCode: 'E66.01',
    icdCode: 'ICD-10',
    description: 'Patient with BMI of 44.2 kg/m2 with severe comorbidities including type 2 diabetes mellitus and obstructive sleep apnea. Referral for surgical weight reduction.',
    hospitalName: 'St. Vincent Metabolic Center',
    estimatedDate: new Date('2026-11-20'),
    provider: 'Cigna Healthcare',
    plan: 'Premier Health',
    policyNumber: 'CIG-882190',
    requestedAmount: 28500,
    status: 'additional_info_required',
    reviewerRemarks: 'Please submit 6 consecutive months of physician-supervised dietary logs and psychological evaluation report before final adjudication.',
    timelineNotes: [
      { status: 'submitted', daysAgo: 8, note: 'Request submitted by bariatric surgical clinic.' },
      { status: 'ai_processing', daysAgo: 7, note: 'AI analysis flagged missing nutritional compliance history.' },
      { status: 'under_review', daysAgo: 6, note: 'Reviewed by Insurer medical adjudicator.' },
      { status: 'additional_info_required', daysAgo: 4, note: 'Request sent to doctor for supervised diet logs & psych clearance.' },
    ],
    ai: {
      summary: 'BMI criteria (>40) satisfied. However, policy rider requires proof of 6-month structured medical weight management attempt and psych assessment.',
      missingDocuments: ['Psychological Evaluation Report', '6-Month Supervised Diet History'],
      missingInformation: ['Nutritional compliance records'],
      policyMatch: 'Bariatric surgery covered under Premier Health provided multidisciplinary prerequisites are completed.',
      policyMatchScore: 71,
      confidenceScore: 68,
      flags: ['Prerequisite waiting period documentation absent'],
      recommendation: 'review',
      pipeline: [
        { step: 'Document Verification', status: 'warning', note: 'Missing psychological clearance' },
        { step: 'Policy Coverage Check', status: 'completed', note: 'Covered with prior authorization conditions' },
        { step: 'Medical Necessity Review', status: 'completed', note: 'BMI and comorbidity thresholds confirmed' },
        { step: 'Cost Analysis', status: 'completed', note: 'Requested amount matches regional bariatric package' },
        { step: 'Risk Assessment', status: 'warning', note: 'Requires strict policy compliance review' },
      ],
    },
    documents: [
      { type: 'medical_report', name: 'Bariatric_Initial_Clinical_Assessment.pdf', size: 1400000 },
      { type: 'diagnostic_report', name: 'Sleep_Study_Polysomnography_Results.pdf', size: 2100000 },
    ],
  },
  {
    patientIndex: 4,
    procedureName: 'Knee Arthroscopy with Partial Meniscectomy',
    cptCode: '29881',
    diagnosisCode: 'M23.22',
    icdCode: 'ICD-10',
    description: 'Acute traumatic bucket-handle tear of the medial meniscus, right knee. Mechanical locking and inability to achieve full extension.',
    hospitalName: 'City General Hospital',
    estimatedDate: new Date('2026-10-12'),
    provider: 'Humana',
    plan: 'Advantage Choice',
    policyNumber: 'HUM-602912',
    requestedAmount: 12000,
    approvedAmount: 10800,
    status: 'approved',
    reviewerRemarks: 'Approved with standard outpatient coverage. Contracted allowable fee is $10,800. Pre-authorization valid for 90 days.',
    timelineNotes: [
      { status: 'submitted', daysAgo: 14, note: 'Request submitted by orthopedic surgeon.' },
      { status: 'ai_processing', daysAgo: 13, note: 'AI validated MRI imaging confirming acute mechanical locking tear.' },
      { status: 'under_review', daysAgo: 12, note: 'Insurer expedited clinical review initiated.' },
      { status: 'approved', daysAgo: 10, note: 'Full approval granted. Authorization code: AUTH-7729-APPROVED.' },
    ],
    ai: {
      summary: 'MRI report clearly demonstrates acute mechanical locking tear of medial meniscus. Procedure is first-line standard of care for locked knee.',
      missingDocuments: [],
      missingInformation: [],
      policyMatch: 'Arthroscopic meniscectomy fully covered under ambulatory outpatient schedule.',
      policyMatchScore: 98,
      confidenceScore: 96,
      flags: [],
      recommendation: 'approve',
      pipeline: [
        { step: 'Document Verification', status: 'completed', note: 'High-res MRI and exam notes verified' },
        { step: 'Policy Coverage Check', status: 'completed', note: 'In-network surgical coverage confirmed' },
        { step: 'Medical Necessity Review', status: 'completed', note: 'Mechanical symptoms justify immediate intervention' },
        { step: 'Cost Analysis', status: 'completed', note: 'Allowable schedule verified at $10,800' },
        { step: 'Risk Assessment', status: 'completed', note: 'Minimal risk, routine outpatient procedure' },
      ],
    },
    documents: [
      { type: 'diagnostic_report', name: 'Right_Knee_MRI_Radiology_Report.pdf', size: 3800000 },
      { type: 'doctor_recommendation', name: 'Surgical_Necessity_Letter.pdf', size: 750000 },
    ],
  },
  {
    patientIndex: 0,
    procedureName: 'Experimental CAR-T Off-Label Protocol for Refractory Disease',
    cptCode: '0537T',
    diagnosisCode: 'C91.00',
    icdCode: 'ICD-10',
    description: 'Experimental cellular immunotherapy for advanced refractory leukemia following multiple line chemotherapy failures.',
    hospitalName: 'Academic Advanced Research Hospital',
    estimatedDate: new Date('2026-12-01'),
    provider: 'BlueCross BlueShield',
    plan: 'Gold PPO',
    policyNumber: 'BCB-987654',
    requestedAmount: 285000,
    status: 'rejected',
    reviewerRemarks: 'Denied: The requested off-label protocol is classified as investigational/experimental under Section 4.2 of policy exclusions. Not eligible under standard medical coverage.',
    timelineNotes: [
      { status: 'submitted', daysAgo: 16, note: 'Submitted for clinical trial coverage authorization.' },
      { status: 'ai_processing', daysAgo: 15, note: 'AI detected investigational CPT code and flagged policy exclusion.' },
      { status: 'under_review', daysAgo: 14, note: 'Reviewed by Pharmacy & Therapeutics committee.' },
      { status: 'rejected', daysAgo: 12, note: 'Denied based on policy exclusions for investigational therapies.' },
    ],
    ai: {
      summary: 'High-cost experimental therapy protocol. The requested procedure uses an unapproved off-label protocol that falls strictly under investigational exclusions.',
      missingDocuments: [],
      missingInformation: [],
      policyMatch: 'Exclusion applied: Section 4.2 explicitly excludes non-FDA-approved investigational protocols.',
      policyMatchScore: 28,
      confidenceScore: 35,
      flags: ['Investigational CPT code', 'Off-label indication', 'Exceeds standard maximum authorization cap'],
      recommendation: 'reject',
      pipeline: [
        { step: 'Document Verification', status: 'completed', note: 'Protocol details received' },
        { step: 'Policy Coverage Check', status: 'failed', note: 'Investigational exclusion triggered' },
        { step: 'Medical Necessity Review', status: 'warning', note: 'Insufficient peer-reviewed evidence for off-label use' },
        { step: 'Cost Analysis', status: 'failed', note: 'Exceeds standard allowable limits ($285,000)' },
        { step: 'Risk Assessment', status: 'failed', note: 'High denial risk confirmed' },
      ],
    },
    documents: [
      { type: 'medical_report', name: 'Clinical_Trial_Protocol_Summary.pdf', size: 5200000 },
      { type: 'doctor_recommendation', name: 'Oncology_Compassionate_Use_Request.pdf', size: 1100000 },
    ],
  },
  {
    patientIndex: 1,
    procedureName: 'Laparoscopic Cholecystectomy',
    cptCode: '47562',
    diagnosisCode: 'K80.20',
    icdCode: 'ICD-10',
    description: 'Symptomatic cholelithiasis with recurrent episodes of biliary colic. Abdominal ultrasound confirms multiple gallstones with normal gallbladder wall thickness.',
    hospitalName: 'City General Hospital',
    estimatedDate: new Date('2026-11-10'),
    provider: 'Aetna Health',
    plan: 'Platinum Plus',
    policyNumber: 'AET-443921',
    requestedAmount: 18500,
    status: 'draft',
    timelineNotes: [],
    documents: [
      { type: 'diagnostic_report', name: 'Abdominal_Ultrasound_Gallbladder.pdf', size: 1950000 },
    ],
  },
  {
    patientIndex: 2,
    procedureName: 'Extracapsular Cataract Extraction with IOL Insertion',
    cptCode: '66984',
    diagnosisCode: 'H25.11',
    icdCode: 'ICD-10',
    description: 'Bilateral age-related nuclear cataracts, worse in right eye. Snellen visual acuity reduced to 20/70 with significant glare disabling driving at night.',
    hospitalName: 'St. Luke Eye Specialty Center',
    estimatedDate: new Date('2026-10-15'),
    provider: 'UnitedHealthcare',
    plan: 'Silver HMO',
    policyNumber: 'UHC-109283',
    requestedAmount: 7200,
    approvedAmount: 6800,
    status: 'approved',
    reviewerRemarks: 'Approved for Right Eye phacoemulsification with monofocal IOL. Approved amount reflects contracted ophthalmology rate.',
    timelineNotes: [
      { status: 'submitted', daysAgo: 10, note: 'Pre-auth submitted with visual acuity records.' },
      { status: 'ai_processing', daysAgo: 9, note: 'AI validated Snellen visual acuity threshold.' },
      { status: 'under_review', daysAgo: 8, note: 'Insurer adjudicated.' },
      { status: 'approved', daysAgo: 7, note: 'Approved under standard surgical fee schedule.' },
    ],
    ai: {
      summary: 'Visual acuity testing (20/70) and glare disability tests demonstrate functional impairment qualifying for surgical cataract extraction under HMO criteria.',
      missingDocuments: [],
      missingInformation: [],
      policyMatch: 'Cataract extraction covered for visual acuity of 20/50 or worse with functional impairment.',
      policyMatchScore: 98,
      confidenceScore: 94,
      flags: [],
      recommendation: 'approve',
      pipeline: [
        { step: 'Document Verification', status: 'completed', note: 'Ophthalmology slit-lamp exam verified' },
        { step: 'Policy Coverage Check', status: 'completed', note: 'Standard vision surgical benefit confirmed' },
        { step: 'Medical Necessity Review', status: 'completed', note: 'Visual deficit threshold met' },
        { step: 'Cost Analysis', status: 'completed', note: 'Pricing aligned with regional fee schedule' },
        { step: 'Risk Assessment', status: 'completed', note: 'Low risk standard outpatient procedure' },
      ],
    },
    documents: [
      { type: 'medical_report', name: 'Ophthalmology_Slit_Lamp_Exam.pdf', size: 1200000 },
      { type: 'diagnostic_report', name: 'IOL_Master_Biometry_Calculation.pdf', size: 850000 },
    ],
  },
  {
    patientIndex: 3,
    procedureName: 'Single-Level Lumbar Microdiscectomy L5-S1',
    cptCode: '63030',
    diagnosisCode: 'M51.27',
    icdCode: 'ICD-10',
    description: 'Extruded disc herniation at L5-S1 with S1 nerve root compression. Patient experiencing intractable radiculopathy with progressive plantar flexion weakness.',
    hospitalName: 'Spine & Neurosurgical Specialists',
    estimatedDate: new Date('2026-10-22'),
    provider: 'Cigna Healthcare',
    plan: 'Premier Health',
    policyNumber: 'CIG-882190',
    requestedAmount: 32000,
    status: 'under_review',
    timelineNotes: [
      { status: 'submitted', daysAgo: 5, note: 'Submitted with lumbar MRI and neurological exam.' },
      { status: 'ai_processing', daysAgo: 4, note: 'AI completed surgical criteria check with 90% confidence.' },
      { status: 'under_review', daysAgo: 3, note: 'Under clinical review by medical director.' },
    ],
    ai: {
      summary: 'Lumbar MRI demonstrates prominent L5-S1 disc extrusion correlating directly with S1 dermatomal radicular deficit. Conservative trial failure established. Rapid surgical decompression indicated.',
      missingDocuments: [],
      missingInformation: [],
      policyMatch: 'Covered under Premier Health surgical schedule for demonstrated neurological deficit.',
      policyMatchScore: 92,
      confidenceScore: 90,
      flags: [],
      recommendation: 'approve',
      pipeline: [
        { step: 'Document Verification', status: 'completed', note: 'Lumbar MRI images & EMG verified' },
        { step: 'Policy Coverage Check', status: 'completed', note: 'Microdiscectomy covered with prior auth' },
        { step: 'Medical Necessity Review', status: 'completed', note: 'Motor deficit justifies decompression' },
        { step: 'Cost Analysis', status: 'completed', note: 'Requested amount within median surgical band' },
        { step: 'Risk Assessment', status: 'completed', note: 'Standard neurosurgical risk profile' },
      ],
    },
    documents: [
      { type: 'diagnostic_report', name: 'Lumbar_Spine_MRI_Radiology.pdf', size: 4500000 },
      { type: 'medical_report', name: 'Neurology_EMG_Nerve_Conduction.pdf', size: 1600000 },
    ],
  },
];

export async function populateRequestsForDoctor(doctorId: mongoose.Types.ObjectId, doctorUserId: mongoose.Types.ObjectId, patients: any[]) {
  const createdReqs = [];
  const year = new Date().getFullYear();

  for (let i = 0; i < SAMPLE_CASES.length; i++) {
    const c = SAMPLE_CASES[i];
    const pat = patients[c.patientIndex % patients.length];

    const count = await PreAuthRequest.countDocuments();
    const requestId = `MA-${year}-${String(count + 1).padStart(5, '0')}`;

    const now = new Date();
    const timeline = c.timelineNotes.map((tn) => {
      const d = new Date(now.getTime() - tn.daysAgo * 24 * 60 * 60 * 1000);
      return {
        status: tn.status,
        timestamp: d,
        note: tn.note,
        updatedBy: doctorUserId,
      };
    });

    const preauth = await PreAuthRequest.create({
      requestId,
      doctorId,
      patientId: pat._id,
      patientInfo: {
        name: pat.name,
        dateOfBirth: pat.dateOfBirth,
        gender: pat.gender,
        phone: pat.phone,
        patientIdRef: pat.patientId,
      },
      treatmentDetails: {
        procedureName: c.procedureName,
        cptCode: c.cptCode,
        diagnosisCode: c.diagnosisCode,
        icdCode: c.icdCode,
        description: c.description,
        hospitalName: c.hospitalName,
        estimatedDate: c.estimatedDate,
      },
      insuranceDetails: {
        provider: c.provider,
        plan: c.plan,
        policyNumber: c.policyNumber,
      },
      requestedAmount: c.requestedAmount,
      approvedAmount: c.approvedAmount,
      status: c.status,
      reviewerRemarks: c.reviewerRemarks,
      timeline,
      createdAt: timeline[0]?.timestamp || new Date(),
    });

    // Create AI Analysis if present
    if (c.ai) {
      const ai = await AIAnalysis.create({
        requestId: preauth._id,
        summary: c.ai.summary,
        missingDocuments: c.ai.missingDocuments,
        missingInformation: c.ai.missingInformation,
        policyMatch: c.ai.policyMatch,
        policyMatchScore: c.ai.policyMatchScore,
        confidenceScore: c.ai.confidenceScore,
        flags: c.ai.flags,
        recommendation: c.ai.recommendation,
        pipeline: c.ai.pipeline,
        processedAt: timeline.find((t) => t.status === 'ai_processing')?.timestamp || new Date(),
      });
      await PreAuthRequest.findByIdAndUpdate(preauth._id, { aiAnalysisId: ai._id });
      preauth.aiAnalysisId = ai._id;
    }

    // Create documents if present
    if (c.documents && c.documents.length > 0) {
      for (const doc of c.documents) {
        await Document.create({
          requestId: preauth._id,
          documentType: doc.type,
          fileName: doc.name,
          originalName: doc.name,
          fileSize: doc.size,
          mimeType: 'application/pdf',
          filePath: `uploads/samples/${doc.name}`,
          uploadedBy: doctorUserId,
          verificationStatus: c.status === 'missing_documents' ? 'requires_review' : 'verified',
          verificationNote: 'System verified sample clinical documentation',
        });
      }
    }

    createdReqs.push(preauth);
  }

  // Create Notifications for Doctor
  await Notification.create([
    {
      userId: doctorUserId.toString(),
      title: 'Claim Approved! 🎉',
      message: `Your pre-authorization request for Knee Arthroscopy with Partial Meniscectomy has been approved.`,
      type: 'approval_rejection',
      requestId: createdReqs.find((r) => r.status === 'approved')?._id.toString(),
      read: false,
    },
    {
      userId: doctorUserId.toString(),
      title: 'Action Required: Missing Documents',
      message: `AI analysis flagged missing neurologist referral for MRI Brain Scan.`,
      type: 'ai_validation',
      requestId: createdReqs.find((r) => r.status === 'missing_documents')?._id.toString(),
      read: false,
    },
    {
      userId: doctorUserId.toString(),
      title: 'Additional Information Requested',
      message: `Insurer reviewer requested 6-month supervised diet logs for Laparoscopic Sleeve Gastrectomy.`,
      type: 'claim_update',
      requestId: createdReqs.find((r) => r.status === 'additional_info_required')?._id.toString(),
      read: true,
    },
    {
      userId: doctorUserId.toString(),
      title: 'AI Validation Complete',
      message: `AI Analysis complete for Coronary Artery Bypass Graft (CABG). Confidence: 92%.`,
      type: 'ai_validation',
      requestId: createdReqs.find((r) => r.status === 'under_review')?._id.toString(),
      read: true,
    },
  ]);

  return createdReqs;
}
