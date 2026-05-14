import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Appointment from '@/models/Appointment';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = (await auth()) as { user?: { role?: string } } | null;
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'super_admin'].includes(session.user?.role || '')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid appointment ID' }, { status: 400 });
    }

    const { status } = await req.json();
    const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` }, 
        { status: 400 }
      );
    }
    await connectToDatabase();
    const domain = await getTenantDomain();
    const updated = await Appointment.findOneAndUpdate(
      { _id: id, domain },
      { status },
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message }, 
      { status: 500 }
    );
  }
}
