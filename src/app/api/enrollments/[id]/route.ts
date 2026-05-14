import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid or missing status' }, { status: 400 });
    }
    await connectToDatabase();
    const domain = await getTenantDomain();
    const updated = await Enrollment.findOneAndUpdate(
      { _id: id, domain },
      { status },
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error updating enrollment:`, error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
