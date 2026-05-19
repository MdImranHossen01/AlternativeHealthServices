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
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const domain = await getTenantDomain();
    
    const isAdmin = ['admin', 'super_admin'].includes((session.user as any)?.role);
    let query: any = { domain };

    if (!isAdmin) {
      // Find the user to get their phone number
      const user = await (await import('@/models/User')).default.findById(session.user.id);
      if (!user || !user.phone) {
        return NextResponse.json([]); // No phone, no enrollments
      }
      query.phone = user.phone;
    }

    const enrollments = await Enrollment.find(query).populate('courseId').sort({ createdAt: -1 });
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

    const { courseId, name, phone, paymentNumber, email, address } = validation.data;

    await connectToDatabase();
    const newEnrollment = await Enrollment.create({
      courseId,
      name,
      phone,
      paymentNumber,
      email,
      address,
      domain,
    });

    return NextResponse.json(newEnrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
