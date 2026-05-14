import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Course from '@/models/Course';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const domain = await getTenantDomain();
    const deleted = await Course.findOneAndDelete({ _id: id, domain });

    if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    console.error(`Error deleting course:`, error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
