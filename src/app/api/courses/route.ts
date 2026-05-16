import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Course from '@/models/Course';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';
import { generateUniqueSlug } from '@/lib/slugify-server';
import { CACHE_TAGS } from '@/lib/data-fetching';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const domain = await getTenantDomain();
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const query: { domain: string; isPublished?: boolean } = { domain };
    if (publishedOnly) query.isPublished = true;

    const courses = await Course.find(query).sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = (await auth()) as { user?: { role?: string } } | null;

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'super_admin'].includes(session.user?.role || '')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const domain = await getTenantDomain();
    const body = await req.json();
    const { name, slug, description, image, price, instructor, duration, location, features, isPublished } = body;

    if (!name || !slug || !description || !image) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (price !== undefined && price < 0) {
      return NextResponse.json({ message: 'Price cannot be negative' }, { status: 400 });
    }

    await connectToDatabase();

    let newCourse;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const uniqueSlug = await generateUniqueSlug(Course, slug, domain);
        newCourse = await Course.create({
          name,
          slug: uniqueSlug,
          description,
          image,
          price,
          instructor,
          duration,
          location,
          features,
          isPublished: isPublished ?? true,
          domain,
        });
        break;
      } catch (error: any) {
        if (error.code === 11000 && attempts < maxAttempts - 1) {
          attempts++;
          continue;
        }
        console.error('Error in course creation loop:', error);
        throw error;
      }
    }

    // Revalidate cache
    try {
      revalidateTag(CACHE_TAGS.courses, 'max');
      revalidatePath('/courses');
      revalidatePath('/');
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
