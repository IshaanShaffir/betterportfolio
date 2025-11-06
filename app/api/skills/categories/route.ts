import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

// GET all skill categories with skills (public)
export async function GET() {
  try {
    const categories = await prisma.skillCategory.findMany({
      include: {
        skills: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching skill categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill categories' },
      { status: 500 }
    );
  }
}

// POST create skill category (admin only)
export async function POST(req: NextRequest) {
  const authCheck = await requireAuth(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const data = await req.json();
    const category = await prisma.skillCategory.create({
      data: {
        name: data.name,
        order: data.order || 0,
      },
      include: {
        skills: true,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating skill category:', error);
    return NextResponse.json(
      { error: 'Failed to create skill category' },
      { status: 500 }
    );
  }
}
