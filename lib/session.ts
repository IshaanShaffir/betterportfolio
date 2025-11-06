import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
);

export async function getSession(req: NextRequest) {
  try {
    const token = req.cookies.get('admin-session')?.value;
    
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      email: payload.email as string,
    };
  } catch (error) {
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const session = await getSession(req);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return session;
}
