import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Dashboard — MakrX',
  description: 'Your MakrX dashboard',
};

export default function DashboardPage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Dashboard",
        url: "https://makrx.org/dashboard"
      }} />
      Dashboard
    </main>
  );
}
