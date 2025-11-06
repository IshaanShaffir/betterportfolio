import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

// POST cleanup duplicates (admin only)
export async function POST(req: NextRequest) {
  const authCheck = await requireAuth(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    let totalDeleted = 0;

    // Clean up duplicate skills
    const allSkills = await prisma.skill.findMany({
      orderBy: { id: 'asc' },
    });

    const skillMap: Record<string, any[]> = {};
    
    for (const skill of allSkills) {
      const key = `${skill.name}-${skill.categoryId}`;
      if (!skillMap[key]) {
        skillMap[key] = [];
      }
      skillMap[key].push(skill);
    }

    for (const skills of Object.values(skillMap)) {
      if (skills.length > 1) {
        // Keep the first one, delete the rest
        for (let i = 1; i < skills.length; i++) {
          await prisma.skill.delete({
            where: { id: skills[i].id },
          });
          totalDeleted++;
        }
      }
    }

    // Clean up duplicate experiences
    const allExperiences = await prisma.experience.findMany({
      orderBy: { id: 'asc' },
    });

    const expMap: Record<string, any[]> = {};
    
    for (const exp of allExperiences) {
      const key = `${exp.role}-${exp.company}`;
      if (!expMap[key]) {
        expMap[key] = [];
      }
      expMap[key].push(exp);
    }

    for (const experiences of Object.values(expMap)) {
      if (experiences.length > 1) {
        for (let i = 1; i < experiences.length; i++) {
          await prisma.experience.delete({
            where: { id: experiences[i].id },
          });
          totalDeleted++;
        }
      }
    }

    // Clean up duplicate projects
    const allProjects = await prisma.project.findMany({
      orderBy: { id: 'asc' },
    });

    const projMap: Record<string, any[]> = {};
    
    for (const proj of allProjects) {
      const key = proj.title;
      if (!projMap[key]) {
        projMap[key] = [];
      }
      projMap[key].push(proj);
    }

    for (const projects of Object.values(projMap)) {
      if (projects.length > 1) {
        for (let i = 1; i < projects.length; i++) {
          await prisma.project.delete({
            where: { id: projects[i].id },
          });
          totalDeleted++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: totalDeleted,
      message: `Successfully deleted ${totalDeleted} duplicate entries`
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup duplicates' },
      { status: 500 }
    );
  }
}
