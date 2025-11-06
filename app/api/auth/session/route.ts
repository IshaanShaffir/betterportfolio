import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  console.log('Session check - cookies:', req.cookies.get('admin-session'));
  const session = await getSession(req);
  console.log('Session check - session:', session);
  
  if (!session) {
    return NextResponse.json({ isLoggedIn: false, isAdmin: false });
  }

  return NextResponse.json({
    isLoggedIn: true,
    isAdmin: true,
    user: session,
  });
}
