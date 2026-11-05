import { PROFILE_PHOTO, redirectToCurrent } from '@/lib/siteFiles';

export const dynamic = 'force-dynamic';

export async function GET() {
  return redirectToCurrent(PROFILE_PHOTO);
}
