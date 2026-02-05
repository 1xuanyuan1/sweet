import mongoose, { Schema, Document } from 'mongoose';

export interface IStyle extends Document {
    name: string;
    image: string;
    materialWeight: number;
    laborCost: number;
    createdAt: Date;
    updatedAt: Date;
}

const StyleSchema: Schema = new Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    materialWeight: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IStyle>('Style', StyleSchema);
