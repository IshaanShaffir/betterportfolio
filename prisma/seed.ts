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

  // Seeding only adds what's missing. Existing rows are left alone, so running
  // it again can't overwrite edits made in the admin dashboard.

  // Seed Projects
  const projects = [
    {
      title: 'MarmarArts',
      description: 'Full-stack e-commerce site built and launched for a Kelowna artist, with Clerk authentication and Cloudinary image management. Features multi-item Stripe checkout, cart reservations with automatic expiry, a two-stage payment flow for commissions, and digital delivery through signed URLs with watermarking to protect original files.',
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Prisma', 'Stripe', 'Clerk', 'Cloudinary'],
      githubUrl: null,
      liveUrl: 'https://marmarart.com',
      featured: true,
      order: 0,
    },
    {
      title: 'ExamGen - Exam Analysis System',
      description: 'Full-stack exam analysis system with automatic OMR processing and analytics. Reduced grading time by 70% through data validation scripts and REST APIs with JWT authentication. Backend tested with pytest in a dedicated Docker container and front end with Jest, with CI/CD workflows for automated builds.',
      techStack: ['Flask', 'React', 'MySQL', 'Tailwind', 'Python', 'JWT', 'Docker', 'pytest', 'Jest'],
      githubUrl: 'https://github.com/IshaanShaffir/ExamGen-Capstone',
      liveUrl: null,
      featured: true,
      order: 1,
    },
    {
      title: 'SlideSnap AI',
      description: 'Chrome extension that automatically summarizes Canvas lecture slides using Google Gemini AI. Extracts key terms, generates practice questions, and provides PDF text extraction with PDF.js.',
      techStack: ['JavaScript', 'Gemini API', 'Chrome Extension', 'PDF.js', 'Tailwind CSS'],
      githubUrl: 'https://github.com/IshaanShaffir/SlideSnap--Canvas-Extension',
      liveUrl: null,
      featured: true,
      order: 2,
    },
    {
      title: 'WeatherCast',
      description: 'Spring Boot rebuild of the original Flask prototype, delivering daily and hourly forecasts from the OpenWeather API, with browser geolocation for personalized, location-aware dashboards. Managed with Agile sprints and a collaborative GitHub workflow.',
      techStack: ['Java', 'Spring Boot', 'Next.js', 'TypeScript', 'PostgreSQL', 'OpenWeather API'],
      githubUrl: 'https://github.com/IshaanShaffir/COSC-310-WeatherCast-WeatherWebApp',
      liveUrl: 'https://weather-cast-v2.vercel.app/',
      featured: true,
      order: 3,
    },
    {
      title: 'Dynamic Portfolio Website',
      description: 'Modern full-stack portfolio with admin dashboard for real-time content management. Features 2FA email authentication, dark mode, Docker deployment, and PostgreSQL database with Prisma ORM.',
      techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Vercel'],
      githubUrl: 'https://github.com/IshaanShaffir/betterportfolio',
      liveUrl: null,
      featured: true,
      order: 4,
    },
    {
      title: 'PEWPEWPANIC!',
      description: 'A 3D space shooter built in Unity with C#—a modern 3D reimagining of Space Invaders. Features 10 handcrafted levels, diverse enemy AI with unique movement patterns, power-ups, and an epic boss battle.',
      techStack: ['Unity', 'C#', 'Game Design', '3D'],
      githubUrl: 'https://github.com/IshaanShaffir/PewPewPanic',
      liveUrl: 'https://ishaanshaffir.itch.io/pewpewpanic',
      featured: false,
      order: 5,
    },
    {
      title: 'ToolPool',
      description: 'Android app for community tool sharing with authentication, listings, chat, and image uploads. Built with Firebase for real-time updates and optimized UI with XML layouts.',
      techStack: ['Java', 'Firebase', 'Firestore', 'Android'],
      githubUrl: 'https://github.com/IshaanShaffir/ToolPool',
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
    const existing = await prisma.project.findFirst({
      where: { title: project.title },
    });
    if (!existing) {
      await prisma.project.create({ data: project });
    }
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
        'Led orientation groups, campus tours and welcome events',
      ],
      order: 2,
    },
    {
      role: 'Retail Associate',
      company: 'Mountain Equipment Company (MEC)',
      location: 'Kelowna, BC',
      startDate: new Date('2025-06-01'),
      endDate: null,
      bullets: [
        'Delivered excellent customer service and maintained product accuracy in fast-paced retail settings',
        'Collaborated with team members to meet daily sales and operational goals',
        'Serve customers across footwear, cycling, camping and cash',
      ],
      order: 3,
    },
  ];

  for (const experience of experiences) {
    const existing = await prisma.experience.findFirst({
      where: { role: experience.role, company: experience.company },
    });
    if (!existing) {
      await prisma.experience.create({ data: experience });
    }
  }
  console.log('✅ Experiences seeded');

  // Seed Skill Categories and Skills
  const skillCategories = [
    {
      name: 'Languages',
      skills: ['TypeScript', 'Java', 'Python', 'JavaScript', 'C#', 'Kotlin', 'C++', 'SQL'],
    },
    {
      name: 'Frameworks & Tools',
      skills: ['Next.js', 'Spring Boot', 'Flask', 'React', 'Firebase', 'Docker', 'Git', 'Tailwind', 'JSP', 'Prisma', 'Android', 'Clerk', 'Stripe', 'Google Gemini API', 'OpenWeather API', 'pytest', 'Jest', 'Linux', 'VS Code', 'Claude Code', 'OpenCode', 'GitHub Copilot', 'Cloudinary'],
    },
    {
      name: 'Cloud & DevOps',
      skills: ['Vercel', 'Render', 'Neon', 'AWS', 'CI/CD', 'RESTful APIs', 'Agile', 'Docker Compose', 'GitHub Actions'],
    },
    {
      name: 'Databases',
      skills: ['PostgreSQL', 'MySQL', 'SQL Server', 'SQLite', 'Firestore'],
    },
    {
      name: 'Concepts',
      skills: ['MVC Architecture', 'Microservices', 'OOP', 'Data Structures', 'Algorithms', 'SDLC', 'JWT Auth', 'Unit Testing'],
    },
  ];

  for (let categoryIndex = 0; categoryIndex < skillCategories.length; categoryIndex++) {
    const { name, skills } = skillCategories[categoryIndex];
    const category =
      (await prisma.skillCategory.findFirst({ where: { name } })) ??
      (await prisma.skillCategory.create({ data: { name, order: categoryIndex + 1 } }));

    for (let skillIndex = 0; skillIndex < skills.length; skillIndex++) {
      const skillName = skills[skillIndex];
      const existing = await prisma.skill.findFirst({
        where: { name: skillName, categoryId: category.id },
      });
      if (!existing) {
        await prisma.skill.create({
          data: { name: skillName, categoryId: category.id, order: skillIndex },
        });
      }
    }
  }
  console.log('✅ Skills seeded');

  // Seed Site Content
  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      heroTitle: 'Full-Stack Developer · CS Student',
      heroHeading: "Hi, I'm Ishaan.",
      heroSubheading: 'I build practical, thoughtful experiences.',
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
