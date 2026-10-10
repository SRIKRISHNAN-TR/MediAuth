import mongoose, { Document } from 'mongoose';
export interface IDoctor extends Document {
    userId: mongoose.Types.ObjectId;
    specialization: string;
    hospitalName: string;
    npiNumber: string;
    department?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDoctor, {}, {}, {}, Document<unknown, {}, IDoctor, {}, mongoose.DefaultSchemaOptions> & IDoctor & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDoctor>;
export default _default;
//# sourceMappingURL=Doctor.d.ts.map