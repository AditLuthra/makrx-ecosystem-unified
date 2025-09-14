import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: 'Blog — MakrX',
  description: 'News and updates from MakrX',
};

export default function BlogPage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX Blog",
        url: "https://makrx.org/blog"
      }} />
      Blog
    </main>
  );
}
