import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    openid: string;
    status: string;
    recipe: any; // Storing snapshot or reference, but likely snapshot for history
    style: any;
    quantity: number;
    originalPrice: number;
    finalPrice?: number;
    expressCompany?: string;
    expressNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    openid: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'wait_confirm', 'confirmed', 'paid', 'producing', 'shipped', 'received', 'cancelled'],
        default: 'pending' 
    },
    recipe: { type: Schema.Types.Mixed, required: true },
    style: { type: Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    finalPrice: { type: Number },
    expressCompany: { type: String },
    expressNumber: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IOrder>('Order', OrderSchema);
