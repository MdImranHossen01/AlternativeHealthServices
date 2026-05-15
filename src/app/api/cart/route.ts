import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';

// GET the user's cart
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || typeof session.user.email !== 'string' || session.user.email.trim() === '') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { getTenantDomain } = await import('@/lib/tenant');
    const domain = await getTenantDomain();
    if (!domain) {
      return NextResponse.json({ message: 'Tenant domain is missing' }, { status: 400 });
    }
    
    const normalizedEmail = session.user.email?.toLowerCase().trim();
    
    // Find user by ID first (most reliable if session is active)
    let user = await User.findById(session.user.id);
    
    if (!user && normalizedEmail) {
      console.log(`Cart GET: User not found by ID (${session.user.id}), falling back to email+domain`);
      user = await User.findOne({ email: normalizedEmail, domain });
    }
    
    if (!user) {
      console.error(`Cart GET: User NOT FOUND for ID: ${session.user.id}, Email: ${normalizedEmail}, Domain: ${domain}`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.cart || []);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

