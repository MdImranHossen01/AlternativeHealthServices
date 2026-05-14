import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAppointment extends Document {
  serviceId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  domain: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema<IAppointment> = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    name: { type: String, required: true },
    phone: { 
      type: String, 
      required: true,
      match: [/^01\d{9}$/, 'Please provide a valid Bangladesh phone number']
    },
    date: { 
      type: String, 
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
    },
    time: { 
      type: String, 
      required: true,
      match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format']
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], 
      default: 'Pending' 
    },
    domain: { 
      type: String, 
      required: true, 
      index: true,
      trim: true,
      lowercase: true
    },
  },
  { timestamps: true }
);

const Appointment: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
