import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import { auth } from '@/auth';
import { getTenantDomain } from '@/lib/tenant';

// GET the user's wishlist (populated)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const domain = await getTenantDomain();
    if (!domain) {
      return NextResponse.json({ message: 'Tenant domain is missing' }, { status: 400 });
    }
    const normalizedEmail = session.user.email?.toLowerCase().trim();
    
    // Find user by ID first
    let user = await User.findById(session.user.id).populate('wishlist');
    
    if (!user && normalizedEmail) {
      console.log(`Wishlist GET: User not found by ID (${session.user.id}), falling back to email+domain`);
      user = await User.findOne({ email: normalizedEmail, domain }).populate('wishlist');
    }
    
    if (!user) {
      console.error(`Wishlist GET: User NOT FOUND for ID: ${session.user.id}, Email: ${normalizedEmail}, Domain: ${domain}`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST toggle a product in the wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const domain = await getTenantDomain();
    if (!domain) {
      return NextResponse.json({ message: 'Tenant domain is missing' }, { status: 400 });
    }
    const normalizedEmail = session.user.email?.toLowerCase().trim();
    
    // Find user by ID first
    let user = await User.findById(session.user.id);
    
    if (!user && normalizedEmail) {
      console.log(`Wishlist POST: User not found by ID (${session.user.id}), falling back to email+domain`);
      user = await User.findOne({ email: normalizedEmail, domain });
    }
    
    if (!user) {
      console.error(`Wishlist POST: User NOT FOUND for ID: ${session.user.id}, Email: ${normalizedEmail}, Domain: ${domain}`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const index = user.wishlist.indexOf(productId as any);
    if (index === -1) {
      user.wishlist.push(productId as any);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    return NextResponse.json(user.wishlist);
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

