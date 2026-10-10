import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Insurer from '../models/Insurer';
import PreAuthRequest from '../models/PreAuthRequest';
import AIAnalysis from '../models/AIAnalysis';
import Notification from '../models/Notification';
import Document from '../models/Document';
import { populateRequestsForDoctor } from './seedHelper';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/mediauth';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clean requests, AI analyses, notifications, and documents
  await Promise.all([
    PreAuthRequest.deleteMany({}),
    AIAnalysis.deleteMany({}),
    Notification.deleteMany({}),
    Document.deleteMany({}),
  ]);
  console.log('🗑️  Cleaned previous preauth requests, analyses, notifications, and docs');

  // ─── Ensure Core Users & Profiles ─────────────────────────────────────────

  // 0. Admin account
  let adminUser = await User.findOne({ email: 'admin@mediauth.com' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'MediAuth Admin',
      email: 'admin@mediauth.com',
      passwordHash: 'Admin@123',
      role: 'admin',
      isActive: true,
      isApproved: true,
    });
    console.log('🔑 Created admin account: admin@mediauth.com / Admin@123');
  } else {
    // Always ensure admin is approved and active
    await User.findByIdAndUpdate(adminUser._id, { isApproved: true, isActive: true });
    console.log('🔑 Admin account already exists, ensured active');
  }

  // 1. Doctor Sarah Mitchell
  let docUser = await User.findOne({ email: 'doctor@mediauth.com' });
  if (!docUser) {
    docUser = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'doctor@mediauth.com',
      passwordHash: 'password123',
      role: 'doctor',
      isActive: true,
      isApproved: true,
    });
  } else {
    // Ensure existing doctor is approved (protect Ivan's access)
    await User.findByIdAndUpdate(docUser._id, { isApproved: true });
  }
  let doctorSarah = await Doctor.findOne({ userId: docUser._id });
  if (!doctorSarah) {
    doctorSarah = await Doctor.create({
      userId: docUser._id,
      specialization: 'Cardiology & Cardiothoracic Surgery',
      hospitalName: 'City General Hospital',
      npiNumber: 'NPI-1234567890',
      department: 'Cardiac Surgery',
      phone: '+1 555-0101',
    });
  }

  // 2. Patient James Patterson
  let patUser = await User.findOne({ email: 'patient@mediauth.com' });
  if (!patUser) {
    patUser = await User.create({
      name: 'James Patterson',
      email: 'patient@mediauth.com',
      passwordHash: 'password123',
      role: 'patient',
      isActive: true,
      isApproved: true,
    });
  } else {
    await User.findByIdAndUpdate(patUser._id, { isApproved: true });
  }
  let patientJames = await Patient.findOne({ userId: patUser._id });
  if (!patientJames) {
    patientJames = await Patient.create({
      userId: patUser._id,
      dateOfBirth: new Date('1985-04-12'),
      gender: 'male',
      phone: '+1 555-0200',
      insurancePlan: 'Gold PPO',
      insuranceProvider: 'BlueCross BlueShield',
      insurancePolicyNumber: 'BCB-987654',
    });
  }

  // 3. Insurer Emily Chen (Sri)
  let insUser = await User.findOne({ email: 'insurer@mediauth.com' });
  if (!insUser) {
    insUser = await User.create({
      name: 'Emily Chen',
      email: 'insurer@mediauth.com',
      passwordHash: 'password123',
      role: 'insurer',
      isActive: true,
      isApproved: true,
    });
  } else {
    // Ensure Sri's insurer access is preserved and approved
    await User.findByIdAndUpdate(insUser._id, { isApproved: true });
  }
  let insurerEmily = await Insurer.findOne({ userId: insUser._id });
  if (!insurerEmily) {
    insurerEmily = await Insurer.create({
      userId: insUser._id,
      organizationName: 'BlueCross BlueShield',
      department: 'Medical Adjudication & Pre-Authorization',
      licenseNumber: 'INS-2024-001',
      phone: '+1 555-0300',
    });
  }

  // Bulk-approve any other existing doctor/insurer accounts that might be in db
  await User.updateMany(
    { role: { $in: ['doctor', 'insurer'] }, isApproved: { $ne: true } },
    { $set: { isApproved: true } }
  );
  // All patients auto-approved
  await User.updateMany({ role: 'patient' }, { $set: { isApproved: true } });

  // 4. Create additional realistic patients for diverse claims
  const extraPatientsData = [
    { name: 'Maria Garcia', email: 'maria.garcia@example.com', dob: '1979-08-22', gender: 'female', phone: '+1 555-0201', plan: 'Platinum Plus', provider: 'Aetna Health', policy: 'AET-443921' },
    { name: 'Robert Taylor', email: 'robert.taylor@example.com', dob: '1962-11-04', gender: 'male', phone: '+1 555-0202', plan: 'Silver HMO', provider: 'UnitedHealthcare', policy: 'UHC-109283' },
    { name: 'Linda Johnson', email: 'linda.johnson@example.com', dob: '1988-03-15', gender: 'female', phone: '+1 555-0203', plan: 'Premier Health', provider: 'Cigna Healthcare', policy: 'CIG-882190' },
    { name: 'Michael Brown', email: 'michael.brown@example.com', dob: '1974-06-30', gender: 'male', phone: '+1 555-0204', plan: 'Advantage Choice', provider: 'Humana', policy: 'HUM-602912' },
  ];

  const allPatients: any[] = [
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
    let u = await User.findOne({ email: ep.email });
    if (!u) {
      u = await User.create({
        name: ep.name,
        email: ep.email,
        passwordHash: 'password123',
        role: 'patient',
        isActive: true,
      });
    }
    let p = await Patient.findOne({ userId: u._id });
    if (!p) {
      p = await Patient.create({
        userId: u._id,
        dateOfBirth: new Date(ep.dob),
        gender: ep.gender as any,
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
  const allDoctors = await Doctor.find({});
  console.log(`🩺 Found ${allDoctors.length} doctor profile(s) in database`);

  for (const doc of allDoctors) {
    const docUserRecord = await User.findById(doc.userId);
    console.log(`🌱 Seeding 10 full clinical pre-auth requests for Doctor ${docUserRecord?.name || doc._id}...`);
    await populateRequestsForDoctor(doc._id as mongoose.Types.ObjectId, doc.userId as mongoose.Types.ObjectId, allPatients);
  }

  // ─── Notifications for Patient James and Insurer Emily ───────────────────
  const sampleApprovedReq = await PreAuthRequest.findOne({ status: 'approved' });
  const sampleMissingReq = await PreAuthRequest.findOne({ status: 'missing_documents' });
  const sampleReviewReq = await PreAuthRequest.findOne({ status: 'under_review' });

  if (sampleApprovedReq) {
    await Notification.create({
      userId: patUser._id.toString(),
      title: 'Claim Approved! 🎉',
      message: `Your pre-authorization request ${sampleApprovedReq.requestId} (${sampleApprovedReq.treatmentDetails.procedureName}) has been approved!`,
      type: 'approval_rejection',
      requestId: sampleApprovedReq._id.toString(),
      read: false,
    });
  }

  if (insUser && sampleReviewReq) {
    await Notification.create([
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

  const finalTotal = await PreAuthRequest.countDocuments();
  console.log(`\n🎉 Seed Complete! Total PreAuth Requests created: ${finalTotal}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Role Accounts Status:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const doc of allDoctors) {
    const u = await User.findById(doc.userId);
    const count = await PreAuthRequest.countDocuments({ doctorId: doc._id });
    console.log(`  👨‍⚕️  Doctor:  ${u?.name} (${u?.email}) -> ${count} requests`);
  }
  console.log(`  🧑   Patient: James Patterson (${patUser.email}) + 4 registered patients`);
  console.log(`  🏢  Insurer: Emily Chen (${insUser.email})`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
