import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Support — MakrX',
  description: 'Help and support resources',
};

export default function SupportPage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Support",
        url: "https://makrx.org/support"
      }} />
      Support
    </main>
  );
}
