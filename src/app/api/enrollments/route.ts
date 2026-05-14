import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';
import { z } from 'zod';

const enrollmentSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID'),
  name: z.string().trim().min(1, 'Name is required').max(100),
  phone: z.string().regex(/^01\d{9}$/, 'Invalid Bangladesh phone number'),
  paymentNumber: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const domain = await getTenantDomain();
    const enrollments = await Enrollment.find({ domain }).populate('courseId').sort({ createdAt: -1 });
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const domain = await getTenantDomain();
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    const validation = enrollmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { courseId, name, phone, paymentNumber } = validation.data;

    await connectToDatabase();
    const newEnrollment = await Enrollment.create({
      courseId,
      name,
      phone,
      paymentNumber,
      domain,
    });

    return NextResponse.json(newEnrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
