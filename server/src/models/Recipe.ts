import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
    name: string;
    description?: string;
    ingredients: string[];
    pricePerKg: number;
    createdAt: Date;
    updatedAt: Date;
}

const RecipeSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    ingredients: [{ type: String }],
    pricePerKg: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
