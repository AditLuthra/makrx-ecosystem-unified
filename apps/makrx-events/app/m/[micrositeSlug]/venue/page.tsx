import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MicrositeComingSoon } from '@/components/microsites/ComingSoon';
import { getMicrositeBySlug } from '@/lib/microsite-loader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositeVenuePageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeVenuePage({ params }: MicrositeVenuePageProps) {
  const { micrositeSlug } = await params;
  const microsite = await getMicrositeBySlug(micrositeSlug);

  if (!microsite) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Venue</p>
              <h1 className="text-3xl font-semibold text-foreground">{microsite.title}</h1>
            </div>
            <Button asChild variant="outline">
              <Link href={`/m/${micrositeSlug}`}>Back to microsite</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Location details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Venue information for this microsite will be published soon. If you&apos;re organizing the event, add the
              address, travel tips, and facility information through the admin interface.
            </p>
          </CardContent>
        </Card>

        <MicrositeComingSoon
          title="Venue information coming soon"
          description="Check back for maps, travel guidance, and accessibility notes."
        />
      </main>
    </div>
  );
}
