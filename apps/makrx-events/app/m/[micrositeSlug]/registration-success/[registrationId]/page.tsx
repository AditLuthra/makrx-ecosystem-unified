import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMicrositeBySlug } from '@/lib/microsite-loader';

interface RegistrationSuccessPageProps {
  params: {
    micrositeSlug: string;
    registrationId: string;
  };
}

export default async function RegistrationSuccessPage({ params }: RegistrationSuccessPageProps) {
  const { micrositeSlug, registrationId } = await params;
  const microsite = await getMicrositeBySlug(micrositeSlug);

  if (!microsite) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Registration confirmed</h1>
            <Button variant="outline" asChild>
              <Link href={`/m/${micrositeSlug}`}>Back to microsite</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Next steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Thanks for registering for <strong>{microsite.title}</strong>. Your registration ID is{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{registrationId}</code>.
            </p>
            <p>
              A confirmation email with event details will follow shortly. If you manage this microsite, connect the
              registration flow to your CRM or ticketing provider to enrich this page with attendee-specific
              information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Contact the microsite team if you have questions or need to update your registration. Be sure to include
              your registration ID for faster assistance.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
