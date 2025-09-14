import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Careers — MakrX',
  description: 'Opportunities to join MakrX',
};

export default function CareersPage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Careers",
        url: "https://makrx.org/careers"
      }} />
      Careers
    </main>
  );
}
