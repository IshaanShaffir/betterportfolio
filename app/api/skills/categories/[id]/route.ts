import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

// PUT update category (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { id } = await params;
    const data = await req.json();
    
    const category = await prisma.skillCategory.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        order: data.order,
      },
      include: {
        skills: true,
      },
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating skill category:', error);
    return NextResponse.json(
      { error: 'Failed to update skill category' },
      { status: 500 }
    );
  }
}

// DELETE category (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { id } = await params;
    await prisma.skillCategory.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill category:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill category' },
      { status: 500 }
    );
  }
}
