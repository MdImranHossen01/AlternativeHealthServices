import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';

const DEFAULT_DOMAIN = process.env.NEXT_PUBLIC_HUB_DOMAIN || 'alternativehsbd.com';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const domain = req.headers.get('x-tenant-domain') || DEFAULT_DOMAIN;
    const settings = await GlobalSettings.findOne({ domain });
    
    return NextResponse.json(settings?.testimonials || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin' && (session.user as any).role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const domain = req.headers.get('x-tenant-domain') || DEFAULT_DOMAIN;
    const body = await req.json();
    
    const settings = await GlobalSettings.findOneAndUpdate(
      { domain },
      { $push: { testimonials: body } },
      { new: true, upsert: true }
    );

    return NextResponse.json(settings.testimonials);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin' && (session.user as any).role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const domain = req.headers.get('x-tenant-domain') || DEFAULT_DOMAIN;
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const settings = await GlobalSettings.findOneAndUpdate(
      { domain, 'testimonials._id': id },
      { $set: { 'testimonials.$': { ...updateData, _id: id } } },
      { new: true }
    );

    return NextResponse.json(settings?.testimonials || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin' && (session.user as any).role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const domain = req.headers.get('x-tenant-domain') || DEFAULT_DOMAIN;
    const { id } = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const settings = await GlobalSettings.findOneAndUpdate(
      { domain },
      { $pull: { testimonials: { _id: id } } },
      { new: true }
    );

    return NextResponse.json(settings?.testimonials || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
