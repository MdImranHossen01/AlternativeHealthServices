import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import { getTenantDomain } from '@/lib/tenant';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    await connectDB();
    const domain = await getTenantDomain();

    if (!domain) {
      return NextResponse.json({ message: 'Domain context missing' }, { status: 400 });
    }

    // Check if already subscribed for this domain
    const existing = await Subscriber.findOne({ email, domain });
    if (existing) {
      return NextResponse.json({ message: 'You are already subscribed!' }, { status: 200 });
    }

    await Subscriber.create({
      email,
      domain
    });

    return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 201 });

  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ message: 'Failed to subscribe' }, { status: 500 });
  }
}
