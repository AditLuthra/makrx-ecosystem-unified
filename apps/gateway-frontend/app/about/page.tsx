import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import SEOStructuredData from '../../components/SEOStructuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "About MakrX - India's Leading Maker Ecosystem",
    description:
        "Learn about MakrX's mission to democratize manufacturing in India. Discover our journey, values, and commitment to empowering creators across the country.",
    keywords: [
        'about makrx',
        'maker ecosystem india',
        'digital manufacturing',
        'company mission',
        'maker community',
    ],
    openGraph: {
        title: "About MakrX - India's Leading Maker Ecosystem",
        description: "Learn about MakrX's mission to democratize manufacturing in India.",
        url: 'https://makrx.org/about',
        type: 'website',
    },
    twitter: {
        title: "About MakrX - India's Leading Maker Ecosystem",
        description: "Learn about MakrX's mission to democratize manufacturing in India.",
    },
};

const About = dynamicImport(
    () =>
        import('../../components/page-components/PlaceholderPage').then((mod) => ({
            default: mod.About,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
        ),
    },
);

export default function AboutPage() {
    return (
        <>
            <SEOStructuredData type="organization" />
            <About />
        </>
    );
}
