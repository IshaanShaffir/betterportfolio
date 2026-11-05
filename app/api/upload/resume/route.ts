import { NextRequest } from 'next/server';
import { handleUpload, RESUME } from '@/lib/siteFiles';

export async function POST(req: NextRequest) {
  return handleUpload(req, RESUME);
}
