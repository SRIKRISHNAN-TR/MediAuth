"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const User_1 = __importDefault(require("../models/User"));
const Doctor_1 = __importDefault(require("../models/Doctor"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Insurer_1 = __importDefault(require("../models/Insurer"));
const PreAuthRequest_1 = __importDefault(require("../models/PreAuthRequest"));
const AIAnalysis_1 = __importDefault(require("../models/AIAnalysis"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Document_1 = __importDefault(require("../models/Document"));
const seedHelper_1 = require("./seedHelper");
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/mediauth';
const seed = async () => {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    // Clean requests, AI analyses, notifications, and documents
    await Promise.all([
        PreAuthRequest_1.default.deleteMany({}),
        AIAnalysis_1.default.deleteMany({}),
        Notification_1.default.deleteMany({}),
        Document_1.default.deleteMany({}),
    ]);
    console.log('🗑️  Cleaned previous preauth requests, analyses, notifications, and docs');
    // ─── Ensure Core Users & Profiles ─────────────────────────────────────────
    // 1. Doctor Sarah Mitchell
    let docUser = await User_1.default.findOne({ email: 'doctor@mediauth.com' });
    if (!docUser) {
        docUser = await User_1.default.create({
            name: 'Dr. Sarah Mitchell',
            email: 'doctor@mediauth.com',
            passwordHash: 'password123',
            role: 'doctor',
            isActive: true,
        });
    }
    let doctorSarah = await Doctor_1.default.findOne({ userId: docUser._id });
    if (!doctorSarah) {
        doctorSarah = await Doctor_1.default.create({
            userId: docUser._id,
            specialization: 'Cardiology & Cardiothoracic Surgery',
            hospitalName: 'City General Hospital',
            npiNumber: 'NPI-1234567890',
            department: 'Cardiac Surgery',
            phone: '+1 555-0101',
        });
    }
    // 2. Patient James Patterson
    let patUser = await User_1.default.findOne({ email: 'patient@mediauth.com' });
    if (!patUser) {
        patUser = await User_1.default.create({
            name: 'James Patterson',
            email: 'patient@mediauth.com',
            passwordHash: 'password123',
            role: 'patient',
            isActive: true,
        });
    }
    let patientJames = await Patient_1.default.findOne({ userId: patUser._id });
    if (!patientJames) {
        patientJames = await Patient_1.default.create({
            userId: patUser._id,
            dateOfBirth: new Date('1985-04-12'),
            gender: 'male',
            phone: '+1 555-0200',
            insurancePlan: 'Gold PPO',
            insuranceProvider: 'BlueCross BlueShield',
            insurancePolicyNumber: 'BCB-987654',
        });
    }
    // 3. Insurer Emily Chen
    let insUser = await User_1.default.findOne({ email: 'insurer@mediauth.com' });
    if (!insUser) {
        insUser = await User_1.default.create({
            name: 'Emily Chen',
            email: 'insurer@mediauth.com',
            passwordHash: 'password123',
            role: 'insurer',
            isActive: true,
        });
    }
    let insurerEmily = await Insurer_1.default.findOne({ userId: insUser._id });
    if (!insurerEmily) {
        insurerEmily = await Insurer_1.default.create({
            userId: insUser._id,
            organizationName: 'BlueCross BlueShield',
            department: 'Medical Adjudication & Pre-Authorization',
            licenseNumber: 'INS-2024-001',
            phone: '+1 555-0300',
        });
    }
    // 4. Create additional realistic patients for diverse claims
    const extraPatientsData = [
        { name: 'Maria Garcia', email: 'maria.garcia@example.com', dob: '1979-08-22', gender: 'female', phone: '+1 555-0201', plan: 'Platinum Plus', provider: 'Aetna Health', policy: 'AET-443921' },
        { name: 'Robert Taylor', email: 'robert.taylor@example.com', dob: '1962-11-04', gender: 'male', phone: '+1 555-0202', plan: 'Silver HMO', provider: 'UnitedHealthcare', policy: 'UHC-109283' },
        { name: 'Linda Johnson', email: 'linda.johnson@example.com', dob: '1988-03-15', gender: 'female', phone: '+1 555-0203', plan: 'Premier Health', provider: 'Cigna Healthcare', policy: 'CIG-882190' },
        { name: 'Michael Brown', email: 'michael.brown@example.com', dob: '1974-06-30', gender: 'male', phone: '+1 555-0204', plan: 'Advantage Choice', provider: 'Humana', policy: 'HUM-602912' },
    ];
    const allPatients = [
        {
            _id: patientJames._id,
            name: patUser.name,
            patientId: patientJames.patientId || 'PT-00001',
            dateOfBirth: patientJames.dateOfBirth,
            gender: patientJames.gender,
            phone: patientJames.phone,
        },
    ];
    for (const ep of extraPatientsData) {
        let u = await User_1.default.findOne({ email: ep.email });
        if (!u) {
            u = await User_1.default.create({
                name: ep.name,
                email: ep.email,
                passwordHash: 'password123',
                role: 'patient',
                isActive: true,
            });
        }
        let p = await Patient_1.default.findOne({ userId: u._id });
        if (!p) {
            p = await Patient_1.default.create({
                userId: u._id,
                dateOfBirth: new Date(ep.dob),
                gender: ep.gender,
                phone: ep.phone,
                insurancePlan: ep.plan,
                insuranceProvider: ep.provider,
                insurancePolicyNumber: ep.policy,
            });
        }
        allPatients.push({
            _id: p._id,
            name: u.name,
            patientId: p.patientId || `PT-${String(allPatients.length + 1).padStart(5, '0')}`,
            dateOfBirth: p.dateOfBirth,
            gender: p.gender,
            phone: p.phone,
        });
    }
    console.log(`👥 Ensured ${allPatients.length} patients in database`);
    // ─── Find all doctors in the database ──────────────────────────────────────
    const allDoctors = await Doctor_1.default.find({});
    console.log(`🩺 Found ${allDoctors.length} doctor profile(s) in database`);
    for (const doc of allDoctors) {
        const docUserRecord = await User_1.default.findById(doc.userId);
        console.log(`🌱 Seeding 10 full clinical pre-auth requests for Doctor ${docUserRecord?.name || doc._id}...`);
        await (0, seedHelper_1.populateRequestsForDoctor)(doc._id, doc.userId, allPatients);
    }
    // ─── Notifications for Patient James and Insurer Emily ───────────────────
    const sampleApprovedReq = await PreAuthRequest_1.default.findOne({ status: 'approved' });
    const sampleMissingReq = await PreAuthRequest_1.default.findOne({ status: 'missing_documents' });
    const sampleReviewReq = await PreAuthRequest_1.default.findOne({ status: 'under_review' });
    if (sampleApprovedReq) {
        await Notification_1.default.create({
            userId: patUser._id.toString(),
            title: 'Claim Approved! 🎉',
            message: `Your pre-authorization request ${sampleApprovedReq.requestId} (${sampleApprovedReq.treatmentDetails.procedureName}) has been approved!`,
            type: 'approval_rejection',
            requestId: sampleApprovedReq._id.toString(),
            read: false,
        });
    }
    if (insUser && sampleReviewReq) {
        await Notification_1.default.create([
            {
                userId: insUser._id.toString(),
                title: 'New Clinical Pre-Auth Requiring Review',
                message: `Claim ${sampleReviewReq.requestId} (${sampleReviewReq.treatmentDetails.procedureName}) is ready for medical director adjudication. AI Confidence: 92%.`,
                type: 'claim_update',
                requestId: sampleReviewReq._id.toString(),
                read: false,
            },
            {
                userId: insUser._id.toString(),
                title: 'AI Flagged Missing Documentation',
                message: `Claim ${sampleMissingReq?.requestId || 'MA-2026-00004'} has been flagged with missing neurologist consultation letter.`,
                type: 'ai_validation',
                requestId: sampleMissingReq?._id.toString(),
                read: true,
            },
        ]);
    }
    const finalTotal = await PreAuthRequest_1.default.countDocuments();
    console.log(`\n🎉 Seed Complete! Total PreAuth Requests created: ${finalTotal}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Role Accounts Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const doc of allDoctors) {
        const u = await User_1.default.findById(doc.userId);
        const count = await PreAuthRequest_1.default.countDocuments({ doctorId: doc._id });
        console.log(`  👨‍⚕️  Doctor:  ${u?.name} (${u?.email}) -> ${count} requests`);
    }
    console.log(`  🧑   Patient: James Patterson (${patUser.email}) + 4 registered patients`);
    console.log(`  🏢  Insurer: Emily Chen (${insUser.email})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await mongoose_1.default.disconnect();
    process.exit(0);
};
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map