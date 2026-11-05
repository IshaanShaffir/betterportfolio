import { redirectToCurrent, RESUME } from '@/lib/siteFiles';

export const dynamic = 'force-dynamic';

export async function GET() {
  return redirectToCurrent(RESUME);
}
