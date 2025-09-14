import { SEOStructuredData } from "@/components/SEOStructuredData";

export const metadata = {
  title: '3D Store — MakrX',
  description: '3D printing store and resources',
};

export default function ThreeDStorePage() {
  return (
    <main>
      <SEOStructuredData type="website" data={{
        name: "MakrX 3D Store",
        url: "https://makrx.org/three-d-store"
      }} />
      3D Store
    </main>
  );
}
