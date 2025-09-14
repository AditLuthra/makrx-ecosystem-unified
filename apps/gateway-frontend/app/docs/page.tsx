import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import SEOStructuredData from '../../components/SEOStructuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Documentation - MakrX Developer & User Guides',
    description:
        'Comprehensive documentation, API guides, tutorials, and resources for developers and users of the MakrX ecosystem.',
    keywords: [
        'makrx documentation',
        'api documentation',
        'developer guides',
        'tutorials',
        'maker resources',
    ],
    openGraph: {
        title: 'Documentation - MakrX Developer & User Guides',
        description:
            'Comprehensive documentation, API guides, tutorials, and resources for the MakrX ecosystem.',
        url: 'https://makrx.org/docs',
        type: 'website',
    },
    twitter: {
        title: 'MakrX Documentation',
        description:
            'Comprehensive documentation, API guides, tutorials, and resources for the MakrX ecosystem.',
    },
};

const Docs = dynamicImport(() => import('../../components/page-components/PlaceholderPageSimple'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
    ),
});

export default function DocsPage() {
    return (
        <>
            <SEOStructuredData
                type="website"
                data={{ title: 'Documentation', description: 'MakrX documentation and guides' }}
            />
            <Docs
                title="Documentation"
                description="Comprehensive guides and API documentation for the MakrX ecosystem."
            />
        </>
    );
}
