import { SEOStructuredData } from '@/components/SEOStructuredData';

export const metadata = {
  title: 'Events — MakrX',
  description: 'Events and workshops by MakrX',
};

export default function EventsPage() {
  return (
    <main>
      <SEOStructuredData
        type="website"
        data={{
          name: 'MakrX Events',
          url: 'https://makrx.org/events',
        }}
      />
      Events
    </main>
  );
}
