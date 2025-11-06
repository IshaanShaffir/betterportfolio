import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateLoginCode, sendLoginCode } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email not configured' },
        { status: 500 }
      );
    }

    // Get or create admin user
    let admin = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      admin = await prisma.adminUser.create({
        data: { email: adminEmail },
      });
    }

    // Generate 6-digit code
    const code = generateLoginCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code to database
    await prisma.adminLoginCode.create({
      data: {
        adminUserId: admin.id,
        code,
        expiresAt,
      },
    });

    // Send email
    const result = await sendLoginCode(adminEmail, code);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Login code sent to your email',
      success: true,
    });
  } catch (error) {
    console.error('Error in request-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
