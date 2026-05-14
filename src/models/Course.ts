import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  price?: number;
  instructor: string;
  duration: string;
  location: string;
  features: string[];
  domain: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema<ICourse> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, min: [0, 'Price cannot be negative'] },
    instructor: { type: String, default: 'Dr. Practitioner' },
    duration: { type: String, default: 'Not specified' },
    location: { type: String, default: 'Nazim Villa, Board Bazar, Gazipur' },
    features: { type: [String], default: [] },
    domain: { 
      type: String, 
      index: true,
      trim: true,
      lowercase: true,
      default: 'alternativehsbd.com'
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourseSchema.index({ slug: 1, domain: 1 }, { unique: true });

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
