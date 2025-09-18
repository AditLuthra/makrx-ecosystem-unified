import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MicrositeComingSoon } from '@/components/microsites/ComingSoon';
import { getMicrositeBySlug } from '@/lib/microsite-loader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositeSchedulePageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeSchedulePage({ params }: MicrositeSchedulePageProps) {
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
              <p className="text-sm text-muted-foreground">Schedule</p>
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
            <CardTitle>Program overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Detailed agenda information has not been published for this microsite yet. Once sessions are scheduled,
              they will appear here with dates, times, and locations.
            </p>
            <p>
              Organizers can add schedule sections from the microsite admin dashboard to share workshops, competitions,
              and social events.
            </p>
          </CardContent>
        </Card>

        <MicrositeComingSoon
          title="Schedule coming soon"
          description="Stay tuned for the full timetable."
        >
          We&apos;ll publish the daily schedule as soon as it&apos;s ready. In the meantime, follow the microsite updates for
          announcements.
        </MicrositeComingSoon>
      </main>
    </div>
  );
}
