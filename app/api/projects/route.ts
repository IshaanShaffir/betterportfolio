import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

// GET all projects (public)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST create project (admin only)
export async function POST(req: NextRequest) {
  const authCheck = await requireAuth(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const data = await req.json();
    const project = await prisma.project.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        techStack: data.techStack || [],
        githubUrl: data.githubUrl,
        liveUrl: data.liveUrl,
        featured: data.featured || false,
        order: data.order || 0,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
