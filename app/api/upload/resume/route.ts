import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/resume.pdf
    const path = join(process.cwd(), 'public', 'resume.pdf');
    await writeFile(path, buffer);

    return NextResponse.json({ success: true, message: 'Resume updated successfully' });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
