import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
);

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email not configured' },
        { status: 500 }
      );
    }

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 401 }
      );
    }

    // Find valid login code
    const loginCode = await prisma.adminLoginCode.findFirst({
      where: {
        adminUserId: admin.id,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!loginCode) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      );
    }

    // Mark code as used
    await prisma.adminLoginCode.update({
      where: { id: loginCode.id },
      data: { used: true },
    });

    // Create JWT session token
    const token = await new SignJWT({
      id: admin.id.toString(),
      email: admin.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    console.log('Cookie set for user:', admin.email);
    console.log('Token created, length:', token.length);

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
