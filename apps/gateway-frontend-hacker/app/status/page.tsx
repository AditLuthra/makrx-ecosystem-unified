import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Status — MakrX',
  description: 'Service availability and uptime',
};

export default function StatusPage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Status",
        url: "https://makrx.org/status"
      }} />
      Status
    </main>
  );
}
