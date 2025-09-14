import { SEOStructuredData } from '@/components/SEOStructuredData';

export const metadata = {
  title: 'Store — MakrX',
  description: 'MakrX store and products',
};

export default function StorePage() {
  return (
    <main>
      <SEOStructuredData
        type="website"
        data={{
          name: 'MakrX Store',
          url: 'https://makrx.org/store',
        }}
      />
      Store
    </main>
  );
}
