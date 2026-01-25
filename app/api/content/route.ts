import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

// GET /api/content - Get site content
export async function GET() {
  try {
    let content = await prisma.siteContent.findFirst({
      where: { id: 1 },
    });

    // If no content exists, create default content
    if (!content) {
      content = await prisma.siteContent.create({
        data: {
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
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST /api/content - Update site content (requires authentication)
// Using POST instead of PUT for better compatibility with Next.js standalone mode
export async function POST(request: NextRequest) {
  const authCheck = await requireAuth(request);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const data = await request.json();
    
    const content = await prisma.siteContent.upsert({
      where: { id: 1 },
      update: {
        heroTitle: data.heroTitle,
        heroHeading: data.heroHeading,
        heroSubheading: data.heroSubheading,
        heroBio: data.heroBio,
        aboutParagraph1: data.aboutParagraph1,
        aboutParagraph2: data.aboutParagraph2,
        aboutParagraph3: data.aboutParagraph3,
        location: data.location,
        education: data.education,
        favouriteStack: data.favouriteStack,
        currentlyVibing: data.currentlyVibing,
      },
      create: {
        heroTitle: data.heroTitle,
        heroHeading: data.heroHeading,
        heroSubheading: data.heroSubheading,
        heroBio: data.heroBio,
        aboutParagraph1: data.aboutParagraph1,
        aboutParagraph2: data.aboutParagraph2,
        aboutParagraph3: data.aboutParagraph3,
        location: data.location,
        education: data.education,
        favouriteStack: data.favouriteStack,
        currentlyVibing: data.currentlyVibing,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}
