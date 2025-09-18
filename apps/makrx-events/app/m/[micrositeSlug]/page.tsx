import SectionRenderer from '@/components/microsites/SectionRenderer';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { micrositeSections, microsites } from '@shared/schema';
import { asc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositePageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositePage({ params }: MicrositePageProps) {
  const { micrositeSlug } = await params;

  const [microsite] = await db
    .select()
    .from(microsites)
    .where(eq(microsites.slug, micrositeSlug))
    .limit(1);

  if (!microsite) {
    notFound();
  }

  const sections = await db
    .select()
    .from(micrositeSections)
    .where(eq(micrositeSections.micrositeId, microsite.id))
    .orderBy(asc(micrositeSections.order), asc(micrositeSections.createdAt));

  const settings = (microsite.settings ?? {}) as Record<string, unknown>;
  const metaTitle =
    (microsite.seo as Record<string, unknown> | null | undefined)?.['title']?.toString() ??
    microsite.title ??
    micrositeSlug;
  const metaDescription =
    (microsite.seo as Record<string, unknown> | null | undefined)?.['description']?.toString() ??
    microsite.description ??
    '';
  const theme = settings.theme as
    | {
        tokens?: Record<string, string>;
        assets?: Record<string, string>;
      }
    | undefined;
  const registerPath = `/m/${micrositeSlug}/register`;
  const hasSections = sections.length > 0;

  return (
    <>
      <title>{metaTitle}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}

      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  ← Back to MakrX.events
                </Link>
                <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
                <span className="text-xl font-semibold text-foreground">{microsite.title}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button asChild variant="outline" size="sm">
                  <Link href={registerPath}>Register</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!hasSections ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground">Microsite under construction</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Published sections will appear here once they are configured for this microsite.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Need to add content? Navigate to the microsite admin pages to create hero, about, schedule, and
                sponsor sections.
              </p>
            </div>
          ) : (
            <SectionRenderer sections={sections} micrositeSlug={micrositeSlug} theme={theme} />
          )}
        </main>

        <footer className="bg-gray-950 text-gray-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white">{microsite.title}</h3>
                {microsite.description && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{microsite.description}</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-white">Explore</h4>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link href={`/m/${micrositeSlug}/events`} className="hover:text-white">
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link href={`/m/${micrositeSlug}/schedule`} className="hover:text-white">
                      Schedule
                    </Link>
                  </li>
                  <li>
                    <Link href={`/m/${micrositeSlug}/speakers`} className="hover:text-white">
                      Speakers
                    </Link>
                  </li>
                  <li>
                    <Link href={`/m/${micrositeSlug}/venue`} className="hover:text-white">
                      Venue
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white">Need help?</h4>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link href={`/m/${micrositeSlug}/faq`} className="hover:text-white">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href={`/m/${micrositeSlug}/contact`} className="hover:text-white">
                      Contact
                    </Link>
                  </li>
                  {microsite.website && (
                    <li>
                      <a href={microsite.website} className="hover:text-white" target="_blank" rel="noreferrer">
                        Official site
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {microsite.title}. Powered by MakrX.events
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
