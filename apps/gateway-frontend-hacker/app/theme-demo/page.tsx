import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Theme Demo — MakrX',
  description: 'Preview MakrX themes and components',
};

export default function ThemeDemoPage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Theme Demo",
        url: "https://makrx.org/theme-demo"
      }} />
      Theme Demo
    </main>
  );
}
