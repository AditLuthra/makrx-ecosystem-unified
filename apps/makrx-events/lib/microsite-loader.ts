import { db } from '@/lib/db';
import { microsites } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function getMicrositeBySlug(slug: string) {
  const [record] = await db
    .select()
    .from(microsites)
    .where(eq(microsites.slug, slug))
    .limit(1);

  return record ?? null;
}
