import { NextRequest } from 'next/server';
import { handleUpload, PROFILE_PHOTO } from '@/lib/siteFiles';

export async function POST(req: NextRequest) {
  return handleUpload(req, PROFILE_PHOTO);
}
