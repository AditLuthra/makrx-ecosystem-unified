import type { Metadata } from 'next';
import Link from 'next/link';
import { SEOStructuredData } from '@/components/SEOStructuredData';

export const metadata: Metadata = {
  title: 'Press Center — MakrX',
  description: 'Media resources, company information, and press contacts for MakrX.',
};

export default function PressPage() {
  return (
    <main className="min-h-screen bg-dark-bg-primary">
      <SEOStructuredData
        type="website"
        data={{
          name: 'MakrX Press',
          url: 'https://makrx.org/press',
        }}
      />
      <section className="py-20 border-b border-makr-blue/30 bg-gradient-to-br from-makr-blue/20 to-makr-yellow/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-4 font-mono">
            Press Center
          </h1>
          <p className="text-dark-text-secondary max-w-2xl mx-auto font-mono">
            Media resources and press inquiries for journalists and creators covering the maker
            ecosystem.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="card-cyberpunk p-8">
            <h2 className="text-2xl font-bold text-gradient-cyberpunk mb-4 font-mono">
              Press Contact
            </h2>
            <p className="text-dark-text-secondary font-mono">
              Email:{' '}
              <a className="text-makr-blue" href="mailto:press@makrx.org">
                press@makrx.org
              </a>
            </p>
            <p className="text-dark-text-secondary font-mono">
              Phone:{' '}
              <a className="text-makr-blue" href="tel:+918047258000">
                +91 80472 58000
              </a>
            </p>
            <p className="text-sm text-dark-text-muted mt-4 font-mono">
              Media responses within 24 hours on business days.
            </p>
          </div>
          <p className="text-sm text-dark-text-muted mt-6 font-mono">
            Looking for product docs?{' '}
            <Link href="/docs" className="text-makr-blue hover:text-makr-yellow">
              Visit Documentation →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
