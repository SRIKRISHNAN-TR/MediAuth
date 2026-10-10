import mongoose, { Document } from 'mongoose';
export interface IPatient extends Document {
    userId: mongoose.Types.ObjectId;
    patientId: string;
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
declare const _default: mongoose.Model<IPatient, {}, {}, {}, Document<unknown, {}, IPatient, {}, mongoose.DefaultSchemaOptions> & IPatient & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPatient>;
export default _default;
//# sourceMappingURL=Patient.d.ts.map