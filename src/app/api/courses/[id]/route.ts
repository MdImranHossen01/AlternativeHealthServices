import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Course from '@/models/Course';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';
import mongoose from 'mongoose';
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
    const course = await Course.findOne({ _id: id, domain });
    if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(course);
  } catch (error: any) {
    console.error(`Error fetching course:`, error);
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
    const updated = await Course.findOneAndUpdate(
      { _id: id, domain },
      { ...body },
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    // Revalidate cache
    try {
      revalidateTag(CACHE_TAGS.courses);
      revalidatePath('/courses');
      if (updated.slug) {
        revalidatePath(`/courses/${updated.slug}`);
      }
      revalidatePath('/');
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error updating course:`, error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

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

    // Revalidate cache
    try {
      revalidateTag(CACHE_TAGS.courses);
      revalidatePath('/courses');
      if (deleted.slug) {
        revalidatePath(`/courses/${deleted.slug}`);
      }
      revalidatePath('/');
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    console.error(`Error deleting course:`, error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
