import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import SEOStructuredData from '../../components/SEOStructuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact MakrX - Get Support & Connect With Our Team',
  description:
    'Get in touch with MakrX team for support, partnerships, or inquiries. Multiple ways to reach us including email, phone, and social media.',
  keywords: [
    'contact makrx',
    'customer support',
    'maker community support',
    'business inquiries',
    'partnership',
  ],
  openGraph: {
    title: 'Contact MakrX - Get Support & Connect With Our Team',
    description: 'Get in touch with MakrX team for support, partnerships, or inquiries.',
    url: 'https://makrx.org/contact',
    type: 'website',
  },
  twitter: {
    title: 'Contact MakrX',
    description: 'Get in touch with MakrX team for support, partnerships, or inquiries.',
  },
};

const Contact = dynamicImport(() => import('../../components/page-components/Contact'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
  ),
});

export default function ContactPage() {
  return (
    <>
      <SEOStructuredData type="organization" />
      <Contact />
    </>
  );
}
