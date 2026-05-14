import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  price?: number;
  domain: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema<IService> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, min: [0, 'Price cannot be negative'] },
    domain: { 
      type: String, 
      required: true, 
      index: true,
      trim: true,
      lowercase: true,
      default: 'alternativehsbd.com'
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ServiceSchema.index({ slug: 1, domain: 1 }, { unique: true });

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
