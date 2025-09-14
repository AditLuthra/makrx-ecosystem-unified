import type { Metadata } from 'next';
import Link from 'next/link';
import { SEOStructuredData } from '@/components/SEOStructuredData';

export const metadata: Metadata = {
  title: 'Service Providers — MakrX',
  description: 'Join the MakrX provider network and earn by fulfilling custom jobs.',
};

export default function ServiceProvidersPage() {
  return (
    <main className="min-h-screen bg-dark-bg-primary">
      <SEOStructuredData
        type="website"
        data={{
          name: 'MakrX Service Providers',
          url: 'https://makrx.org/service-providers',
        }}
      />
      <section className="py-20 border-b border-makr-blue/30 bg-gradient-to-br from-terminal-green/20 to-makr-blue/20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-4 font-mono">
            Service Providers
          </h1>
          <p className="text-dark-text-secondary max-w-2xl mx-auto font-mono">
            Join our provider network and start receiving manufacturing jobs from across India.
          </p>
          <a
            href="https://auth.makrx.org/register?provider=true"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyberpunk inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl mt-6 font-mono"
          >
            Become a Provider
          </a>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-dark-text-secondary font-mono">
            Want to explore more?{' '}
            <Link href="/ecosystem" className="text-makr-blue hover:text-makr-yellow">
              See our ecosystem →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
