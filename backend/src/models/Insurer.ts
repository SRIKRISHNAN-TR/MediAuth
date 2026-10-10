import mongoose, { Document, Schema } from 'mongoose';

export interface IInsurer extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  department?: string;
  licenseNumber?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InsurerSchema = new Schema<IInsurer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationName: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInsurer>('Insurer', InsurerSchema);
