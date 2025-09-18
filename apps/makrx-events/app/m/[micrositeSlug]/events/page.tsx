import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MicrositeComingSoon } from '@/components/microsites/ComingSoon';
import { getMicrositeBySlug } from '@/lib/microsite-loader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositeEventsPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeEventsPage({ params }: MicrositeEventsPageProps) {
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
              <p className="text-sm text-muted-foreground">Activities</p>
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
            <CardTitle>Sessions and happenings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The event lineup for this microsite has not been published yet. As soon as workshops, competitions, or
              talks are confirmed, you&apos;ll see them listed here.
            </p>
            <p>
              Organizers can add event sections with categories and descriptions via the microsite admin tools.
            </p>
          </CardContent>
        </Card>

        <MicrositeComingSoon
          title="Event lineup coming soon"
          description="Check back for the full agenda of sessions, demos, and networking moments."
        />
      </main>
    </div>
  );
}
