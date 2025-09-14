import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Terms of Service — MakrX',
  description: 'Terms governing the use of MakrX',
};

export default function TermsOfServicePage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Terms of Service",
        url: "https://makrx.org/terms-of-service"
      }} />
      Terms of Service
    </main>
  );
}
