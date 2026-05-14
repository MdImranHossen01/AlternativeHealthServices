import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Appointment from '@/models/Appointment';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';
import Service from '@/models/Service';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const domain = await getTenantDomain();
    const appointments = await Appointment.find({ domain }).populate('serviceId').sort({ createdAt: -1 });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const domain = await getTenantDomain();
    const body = await req.json();
    const { serviceId, name, phone, date, time } = body;

    if (!serviceId || !name || !phone || !date || !time) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Validate service exists and belongs to domain
    const service = await Service.findOne({ _id: serviceId, domain, isPublished: true });
    if (!service) {
      return NextResponse.json({ message: 'Service not found or unavailable' }, { status: 404 });
    }

    // Validate phone (Bangladeshi format)
    const phoneRegex = /^01\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
    }

    // Sanitize name
    const sanitizedName = name.trim();

    const newAppointment = await Appointment.create({
      serviceId,
      name: sanitizedName,
      phone,
      date,
      time,
      domain,
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
