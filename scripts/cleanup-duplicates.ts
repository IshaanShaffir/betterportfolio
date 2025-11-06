import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up duplicate skills...');

  // Get all skills
  const allSkills = await prisma.skill.findMany({
    orderBy: { id: 'asc' },
  });

  // Group by name and categoryId to find duplicates
  const skillMap = new Map<string, any[]>();
  
  for (const skill of allSkills) {
    const key = `${skill.name}-${skill.categoryId}`;
    if (!skillMap.has(key)) {
      skillMap.set(key, []);
    }
    skillMap.get(key)!.push(skill);
  }

  // Delete duplicates, keeping the first occurrence
  let deletedCount = 0;
  for (const [key, skills] of skillMap.entries()) {
    if (skills.length > 1) {
      console.log(`Found ${skills.length} duplicates of "${skills[0].name}"`);
      // Keep the first one, delete the rest
      for (let i = 1; i < skills.length; i++) {
        await prisma.skill.delete({
          where: { id: skills[i].id },
        });
        deletedCount++;
      }
    }
  }

  console.log(`✅ Deleted ${deletedCount} duplicate skills`);

  // Do the same for experiences
  console.log('🧹 Cleaning up duplicate experiences...');
  
  const allExperiences = await prisma.experience.findMany({
    orderBy: { id: 'asc' },
  });

  const expMap = new Map<string, any[]>();
  
  for (const exp of allExperiences) {
    const key = `${exp.role}-${exp.company}`;
    if (!expMap.has(key)) {
      expMap.set(key, []);
    }
    expMap.get(key)!.push(exp);
  }

  let expDeletedCount = 0;
  for (const [key, experiences] of expMap.entries()) {
    if (experiences.length > 1) {
      console.log(`Found ${experiences.length} duplicates of "${experiences[0].role} at ${experiences[0].company}"`);
      for (let i = 1; i < experiences.length; i++) {
        await prisma.experience.delete({
          where: { id: experiences[i].id },
        });
        expDeletedCount++;
      }
    }
  }

  console.log(`✅ Deleted ${expDeletedCount} duplicate experiences`);

  // Do the same for projects
  console.log('🧹 Cleaning up duplicate projects...');
  
  const allProjects = await prisma.project.findMany({
    orderBy: { id: 'asc' },
  });

  const projMap = new Map<string, any[]>();
  
  for (const proj of allProjects) {
    const key = proj.title;
    if (!projMap.has(key)) {
      projMap.set(key, []);
    }
    projMap.get(key)!.push(proj);
  }

  let projDeletedCount = 0;
  for (const [key, projects] of projMap.entries()) {
    if (projects.length > 1) {
      console.log(`Found ${projects.length} duplicates of "${projects[0].title}"`);
      for (let i = 1; i < projects.length; i++) {
        await prisma.project.delete({
          where: { id: projects[i].id },
        });
        projDeletedCount++;
      }
    }
  }

  console.log(`✅ Deleted ${projDeletedCount} duplicate projects`);
  console.log('🎉 Cleanup completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
