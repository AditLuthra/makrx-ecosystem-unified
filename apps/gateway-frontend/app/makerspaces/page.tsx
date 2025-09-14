import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import SEOStructuredData from '../../components/SEOStructuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Makerspaces - Find Creative Workspaces Across India | MakrX',
    description:
        'Discover makerspaces near you with 3D printing, laser cutting, electronics, and more. Book workspace, access tools, and connect with the maker community.',
    keywords: [
        'makerspaces india',
        '3d printing workspace',
        'laser cutting space',
        'electronics lab',
        'coworking space makers',
        'fabrication lab',
    ],
    openGraph: {
        title: 'Makerspaces - Find Creative Workspaces Across India',
        description:
            'Discover makerspaces near you with 3D printing, laser cutting, electronics, and more.',
        url: 'https://makrx.org/makerspaces',
        type: 'website',
    },
    twitter: {
        title: 'Makerspaces - Find Creative Workspaces Across India',
        description:
            'Discover makerspaces near you with 3D printing, laser cutting, electronics, and more.',
    },
};

const Makerspaces = dynamicImport(
    () =>
        import('../../components/page-components/PlaceholderPage').then((mod) => ({
            default: mod.Makerspaces,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
        ),
    },
);

export default function MakerspacesPage() {
    return (
        <>
            <SEOStructuredData
                type="website"
                data={{
                    title: 'Makerspaces Directory',
                    description: 'Find makerspaces across India',
                }}
            />
            <Makerspaces />
        </>
    );
}
