import mongoose, { Document } from 'mongoose';
export interface IInsurer extends Document {
    userId: mongoose.Types.ObjectId;
    organizationName: string;
    department?: string;
    licenseNumber?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IInsurer, {}, {}, {}, Document<unknown, {}, IInsurer, {}, mongoose.DefaultSchemaOptions> & IInsurer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInsurer>;
export default _default;
//# sourceMappingURL=Insurer.d.ts.map