import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  courseId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  paymentNumber?: string; // Number used for bKash payment
  status: 'Pending' | 'Paid' | 'Cancelled';
  domain: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema<IEnrollment> = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    paymentNumber: { type: String },
    status: { 
      type: String, 
      enum: ['Pending', 'Paid', 'Cancelled'], 
      default: 'Pending' 
    },
    domain: { 
      type: String, 
      required: true, 
      index: true,
      trim: true,
      lowercase: true,
      default: 'alternativehsbd.com'
    },
  },
  { timestamps: true }
);

const Enrollment: Model<IEnrollment> = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export default Enrollment;
