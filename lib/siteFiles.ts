import { del, list, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { MAX_UPLOAD_BYTES } from '@/lib/uploadLimits';

interface SiteFile {
  // Blob folder holding the current upload.
  prefix: string;
  // File in public/ served until the first upload.
  fallback: string;
  // Upload form field name.
  field: string;
  // Used in messages and as the stored file's base name.
  name: string;
  // Allowed MIME types mapped to the extension to store.
  types: Record<string, string>;
  typeError: string;
}

export const RESUME: SiteFile = {
  prefix: 'site/resume/',
  fallback: '/resume-fallback.pdf',
  field: 'resume',
  name: 'resume',
  types: { 'application/pdf': 'pdf' },
  typeError: 'Only PDF files allowed',
};

export const PROFILE_PHOTO: SiteFile = {
  prefix: 'site/photo/',
  fallback: '/ishaan-photo.jpg',
  field: 'image',
  name: 'profile',
  types: {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  },
  typeError: 'Only JPG, PNG, or WebP images allowed',
};

// Redirects to the newest upload. The redirect is never cached, so a new
// upload is live on the next request. The blob itself gets a unique URL per
// upload, so its own CDN caching can't serve a stale file.
export async function redirectToCurrent(file: SiteFile) {
  let location = file.fallback;

  try {
    const { blobs } = await list({ prefix: file.prefix });
    const newest = blobs.sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    )[0];
    if (newest) location = newest.url;
  } catch (error) {
    console.error(`Error looking up ${file.name}, using fallback:`, error);
  }

  return new NextResponse(null, {
    status: 302,
    headers: { Location: location, 'Cache-Control': 'no-store' },
  });
}

export async function handleUpload(req: NextRequest, file: SiteFile) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const upload = formData.get(file.field);

    if (!(upload instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const extension = file.types[upload.type];
    if (!extension) {
      return NextResponse.json({ error: file.typeError }, { status: 400 });
    }

    if (upload.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'File is too large. The limit is 4 MB.' },
        { status: 413 }
      );
    }

    const blob = await put(`${file.prefix}${file.name}.${extension}`, upload, {
      access: 'public',
      addRandomSuffix: true,
      contentType: upload.type,
    });

    await deleteOlderUploads(file, blob.url);

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error(`Error uploading ${file.name}:`, error);
    const reason = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Upload failed: ${reason}` },
      { status: 500 }
    );
  }
}

// The new file is already live, so a failed cleanup shouldn't fail the upload.
async function deleteOlderUploads(file: SiteFile, currentUrl: string) {
  try {
    const { blobs } = await list({ prefix: file.prefix });
    const older = blobs.map((b) => b.url).filter((url) => url !== currentUrl);
    if (older.length > 0) await del(older);
  } catch (error) {
    console.error(`Error removing old ${file.name} uploads:`, error);
  }
}
