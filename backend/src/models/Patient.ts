import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  patientId: string; // PT-XXXXX
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  insurancePlan?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    patientId: { type: String, unique: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    insurancePlan: { type: String, trim: true },
    insuranceProvider: { type: String, trim: true },
    insurancePolicyNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate patientId
PatientSchema.pre<IPatient>('save', async function () {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PT-${String(count + 1).padStart(5, '0')}`;
  }
});

export default mongoose.model<IPatient>('Patient', PatientSchema);
