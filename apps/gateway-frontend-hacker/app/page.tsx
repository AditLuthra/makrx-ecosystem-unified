import { SEOStructuredData } from '@/components/SEOStructuredData';

export default function Page() {
  return (
    <main className="min-h-screen bg-dark-bg-primary">
      <SEOStructuredData
        type="website"
        data={{
          name: 'MakrX',
          url: 'https://makrx.org',
        }}
      />
      <section className="py-24 bg-gradient-to-br from-makr-blue/20 via-purple-600/20 to-makr-yellow/10 border-b border-makr-blue/30">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gradient-cyberpunk mb-4 font-mono">
            MakrX Hacker Portal
          </h1>
          <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto font-mono">
            Developer gateway into the MakrX ecosystem. Explore docs, APIs, and platform tools.
          </p>
        </div>
      </section>
    </main>
  );
}
