import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Ecosystem — MakrX',
  description: 'Explore the MakrX ecosystem',
};

export default function EcosystemPage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Ecosystem",
        url: "https://makrx.org/ecosystem"
      }} />
      Ecosystem
    </main>
  );
}
