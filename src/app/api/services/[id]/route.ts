import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Service from '@/models/Service';
import { auth } from '@/auth';
import mongoose from 'mongoose';
import { getTenantDomain } from '@/lib/tenant';
import { CACHE_TAGS } from '@/lib/data-fetching';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }
    await connectToDatabase();
    const domain = await getTenantDomain();
    const service = await Service.findOne({ _id: id, domain });
    if (!service) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(service);
  } catch (error: any) {
    console.error(`Error fetching service:`, error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();
    const domain = await getTenantDomain();
    const updated = await Service.findOneAndUpdate(
      { _id: id, domain },
      { ...body },
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    // Revalidate cache
    try {
      revalidateTag(CACHE_TAGS.services);
      revalidatePath('/services');
      if (updated.slug) {
        revalidatePath(`/services/${updated.slug}`);
      }
      revalidatePath('/');
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error updating service:`, error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const domain = await getTenantDomain();
    const deleted = await Service.findOneAndDelete({ _id: id, domain });

    if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    // Revalidate cache
    try {
      revalidateTag(CACHE_TAGS.services);
      revalidatePath('/services');
      if (deleted.slug) {
        revalidatePath(`/services/${deleted.slug}`);
      }
      revalidatePath('/');
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    console.error(`Error deleting service:`, error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
