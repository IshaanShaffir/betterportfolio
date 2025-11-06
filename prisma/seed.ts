import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail },
  });
  console.log('✅ Admin user created:', admin.email);

  // Seed Projects
  const projects = [
    {
      title: 'ExamGen - Exam Analysis System',
      description: 'Full-stack exam analysis system with automatic OMR processing and analytics. Reduced grading time by 70% through data validation scripts and REST APIs with JWT authentication.',
      techStack: ['Flask', 'React', 'MySQL', 'Tailwind', 'Python'],
      githubUrl: 'https://github.com/IshaanShaffir/ExamGen-Capstone',
      liveUrl: null,
      featured: true,
      order: 1,
    },
    {
      title: 'SlideSnap AI',
      description: 'Chrome extension that automatically summarizes Canvas lecture slides using Google Gemini AI. Extracts key terms, generates practice questions, and provides PDF text extraction with PDF.js.',
      techStack: ['JavaScript', 'Gemini API', 'Chrome Extension', 'PDF.js'],
      githubUrl: 'https://github.com/IshaanShaffir/SlideSnap--Canvas-Extension',
      liveUrl: null,
      featured: true,
      order: 2,
    },
    {
      title: 'Dynamic Portfolio Website',
      description: 'Modern full-stack portfolio with admin dashboard for real-time content management. Features 2FA email authentication, dark mode, Docker deployment, and PostgreSQL database with Prisma ORM.',
      techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
      githubUrl: 'https://github.com/IshaanShaffir/betterportfolio',
      liveUrl: null,
      featured: true,
      order: 3,
    },
    {
      title: 'PEWPEWPANIC!',
      description: 'A 3D space shooter built in Unity with C#—a modern 3D reimagining of Space Invaders. Features 10 handcrafted levels, diverse enemy AI with unique movement patterns, power-ups, and an epic boss battle.',
      techStack: ['Unity', 'C#', 'Game Design', '3D'],
      githubUrl: 'https://github.com/IshaanShaffir/PewPewPanic',
      liveUrl: 'https://ishaanshaffir.itch.io/pewpewpanic',
      featured: false,
      order: 4,
    },
    {
      title: 'ToolPool',
      description: 'Android app for community tool sharing with authentication, listings, chat, and image uploads. Built with Firebase for real-time updates and optimized UI with XML layouts.',
      techStack: ['Java', 'Firebase', 'Firestore', 'Android'],
      githubUrl: 'https://github.com/IshaanShaffir/ToolPool',
      liveUrl: null,
      featured: false,
      order: 5,
    },
    {
      title: 'WeatherCast',
      description: 'Personalized weather dashboard using OpenWeather API and geolocation. Managed with Agile sprints and collaborative GitHub workflow for feature delivery.',
      techStack: ['Flask', 'SQLite', 'JavaScript', 'CSS'],
      githubUrl: 'https://github.com/IshaanShaffir/COSC-310-WeatherCast-WeatherWebApp',
      liveUrl: null,
      featured: false,
      order: 6,
    },
    {
      title: 'Online Shopping Website',
      description: 'E-commerce platform with admin dashboard, product management, and secure checkout. Deployed on cloud infrastructure with optimized queries for performance.',
      techStack: ['JSP', 'SQL Server', 'DigitalOcean'],
      githubUrl: 'https://github.com/IshaanShaffir/COSC-304-Project-OnlineShoppingWebsite',
      liveUrl: null,
      featured: false,
      order: 7,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: projects.indexOf(project) + 1 },
      update: project,
      create: project,
    });
  }
  console.log('✅ Projects seeded');

  // Seed Experiences
  const experiences = [
    {
      role: 'Marketing & Data Management Intern',
      company: 'ThoughtsWin Systems',
      location: 'Surrey, BC',
      startDate: new Date('2023-09-01'),
      endDate: new Date('2023-12-31'),
      bullets: [
        'Verified and standardized large client datasets to ensure accuracy and consistency for migration',
        'Performed one-to-one file naming validation and metadata checks to maintain data integrity',
        'Collaborated with the technical team to resolve data discrepancies and streamline validation processes',
      ],
      order: 1,
    },
    {
      role: 'Student Orientation Leader',
      company: 'UBC Okanagan',
      location: 'Kelowna, BC',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-09-30'),
      bullets: [
        'Supported onboarding of 300+ new students, facilitating events and guiding academic transitions',
        'Demonstrated leadership, communication, and teamwork in a high-responsibility campus role',
      ],
      order: 2,
    },
    {
      role: 'Retail Associate',
      company: 'Mountain Equipment Company (MEC)',
      location: 'Surrey, BC',
      startDate: new Date('2025-06-01'),
      endDate: null,
      bullets: [
        'Delivered excellent customer service and maintained product accuracy in fast-paced retail settings',
        'Collaborated with team members to meet daily sales and operational goals',
      ],
      order: 3,
    },
  ];

  for (const exp of experiences) {
    await prisma.experience.upsert({
      where: { id: experiences.indexOf(exp) + 1 },
      update: exp,
      create: exp,
    });
  }
  console.log('✅ Experiences seeded');

  // Seed Skill Categories and Skills
  const skillsData = {
    'Languages': ['Java', 'Python', 'JavaScript', 'C#', 'Kotlin', 'C++'],
    'Frameworks & Tools': ['Flask', 'React', 'Firebase', 'Docker', 'Git', 'Tailwind', 'JSP'],
    'Cloud & DevOps': ['AWS', 'CI/CD', 'RESTful APIs', 'Agile'],
    'Databases': ['MySQL', 'SQL Server', 'SQLite', 'Firestore'],
    'Concepts': ['OOP', 'Data Structures', 'Algorithms', 'SDLC', 'JWT Auth'],
  };

  let categoryOrder = 1;
  for (const [categoryName, skills] of Object.entries(skillsData)) {
    const category = await prisma.skillCategory.upsert({
      where: { id: categoryOrder },
      update: { name: categoryName, order: categoryOrder },
      create: { name: categoryName, order: categoryOrder },
    });

    let skillOrder = 1;
    for (const skillName of skills) {
      await prisma.skill.upsert({
        where: { id: (categoryOrder - 1) * 20 + skillOrder },
        update: { name: skillName, categoryId: category.id, order: skillOrder },
        create: { name: skillName, categoryId: category.id, order: skillOrder },
      });
      skillOrder++;
    }
    categoryOrder++;
  }
  console.log('✅ Skills seeded');

  // Seed Site Content
  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      heroTitle: 'Full-Stack Developer · CS Student',
      heroHeading: "Hi, I'm Ishaan.",
      heroSubheading: 'I build practical, thoughtful web experiences.',
      heroBio: "I'm a Computer Science student at UBC Okanagan passionate about full-stack development and building systems that solve real problems. From exam analysis tools to weather dashboards and e-commerce platforms, I enjoy bringing ideas to life through code.",
      aboutParagraph1: "Hey! I'm a Computer Science student at UBC Okanagan who genuinely enjoys the process of building things—whether it's a full-stack web app, a 3D game in Unity, or a Chrome extension that makes studying less painful. There's something satisfying about taking a vague idea and turning it into something that actually works.",
      aboutParagraph2: "When I'm not debugging code or wrestling with APIs, you'll probably find me exploring new tech, trying out the latest frameworks, or diving into a side project just because it sounds interesting. I'm the kind of person who starts building something \"just to see if it's possible\" and ends up with a full project at 2 AM.",
      aboutParagraph3: "I'm a big believer in learning by doing. Whether it's experimenting with AI APIs, picking up a new programming language, or figuring out how to deploy something I built to the cloud—I'm always tinkering. If you want to chat about tech, collaborate on something cool, or just talk about what you're building, I'm all ears!",
      location: 'Kelowna, BC',
      education: 'BSc Computer Science',
      favouriteStack: 'React · Flask · Firebase',
      currentlyVibing: 'AI APIs & Game Dev',
    },
  });
  console.log('✅ Site content seeded');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
