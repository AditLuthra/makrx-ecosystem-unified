import { SEOStructuredData } from '@/components/SEOStructuredData';

export const metadata = {
  title: 'Makerspaces — MakrX',
  description: 'Discover makerspaces in the MakrX network',
};

export default function MakerspacesPage() {
  return (
    <main>
      <SEOStructuredData
        type="website"
        data={{
          name: 'MakrX Makerspaces',
          url: 'https://makrx.org/makerspaces',
        }}
      />
      Makerspaces
    </main>
  );
}
