import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    openid: string;
    nickName: string;
    avatarUrl: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    openid: { type: String, required: true, unique: true },
    nickName: { type: String },
    avatarUrl: { type: String },
    isAdmin: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
