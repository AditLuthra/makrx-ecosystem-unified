import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMicrositeBySlug } from '@/lib/microsite-loader';

interface MicrositeAboutPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeAboutPage({ params }: MicrositeAboutPageProps) {
  const { micrositeSlug } = await params;
  const microsite = await getMicrositeBySlug(micrositeSlug);

  if (!microsite) {
    notFound();
  }

  const description = microsite.description ?? 'Details about this microsite will be published soon.';
  const organizer = microsite.organizer ?? 'Microsite team';

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Microsite overview</p>
              <h1 className="text-3xl font-semibold text-foreground">{microsite.title}</h1>
            </div>
            <Button asChild variant="outline">
              <Link href={`/m/${micrositeSlug}`}>Back to microsite</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>About this experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {description.split('\n').map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-foreground/80">
                {paragraph.trim()}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organized by</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-foreground/80">{organizer}</p>
            {microsite.website && (
              <Button asChild className="mt-4" variant="ghost">
                <a href={microsite.website} target="_blank" rel="noreferrer">
                  Visit organizer site
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need more information?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Check back soon for a full schedule, speaker list and partner lineup.</p>
            <p>
              If you manage this microsite, add sections via the admin pages to replace this placeholder content.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
