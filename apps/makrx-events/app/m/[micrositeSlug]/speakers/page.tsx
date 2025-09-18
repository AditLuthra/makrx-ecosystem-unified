import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MicrositeComingSoon } from '@/components/microsites/ComingSoon';
import { getMicrositeBySlug } from '@/lib/microsite-loader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositeSpeakersPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeSpeakersPage({ params }: MicrositeSpeakersPageProps) {
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
              <p className="text-sm text-muted-foreground">Speakers</p>
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
            <CardTitle>Featured voices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The speaker lineup is still being finalized. Profiles will be added here once presenters confirm their
              sessions.
            </p>
            <p>
              Organizers can publish speaker bios and talk titles from the microsite admin dashboard.
            </p>
          </CardContent>
        </Card>

        <MicrositeComingSoon
          title="Speaker roster coming soon"
          description="Follow this space for announcements about the experts leading sessions."
        />
      </main>
    </div>
  );
}
