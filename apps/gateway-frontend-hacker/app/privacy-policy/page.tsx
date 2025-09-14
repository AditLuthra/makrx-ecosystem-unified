import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Privacy Policy — MakrX',
  description: 'Privacy practices and data usage',
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Privacy Policy",
        url: "https://makrx.org/privacy-policy"
      }} />
      Privacy Policy
    </main>
  );
}
