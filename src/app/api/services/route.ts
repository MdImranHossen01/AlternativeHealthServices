import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Service from '@/models/Service';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';
import { generateUniqueSlug } from '@/lib/slugify-server';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  description: z.string().min(1),
  image: z.string().url().max(500),
  price: z.number().nullable().optional(),
  isPublished: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const domain = await getTenantDomain();
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const query: any = { domain };
    if (publishedOnly) query.isPublished = true;

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      services,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes((session.user as any)?.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const domain = await getTenantDomain();
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    const validation = serviceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { name, slug, description, image, price, isPublished } = validation.data;

    await connectToDatabase();
    const uniqueSlug = await generateUniqueSlug(Service, slug, domain);

    const newService = await Service.create({
      name,
      slug: uniqueSlug,
      description,
      image,
      price: price ?? undefined,
      isPublished,
      domain,
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
