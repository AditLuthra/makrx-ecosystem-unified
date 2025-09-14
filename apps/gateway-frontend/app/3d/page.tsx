import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import SEOStructuredData from '../../components/SEOStructuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '3D Printing & Custom Manufacturing Services | MakrX',
    description:
        'Professional 3D printing, laser cutting, CNC machining, and custom manufacturing services. Upload your designs and get instant quotes.',
    keywords: [
        '3d printing service',
        'laser cutting service',
        'cnc machining',
        'custom manufacturing',
        'rapid prototyping',
        'digital fabrication',
    ],
    openGraph: {
        title: '3D Printing & Custom Manufacturing Services',
        description:
            'Professional 3D printing, laser cutting, CNC machining, and custom manufacturing services.',
        url: 'https://makrx.org/3d',
        type: 'website',
    },
    twitter: {
        title: '3D Printing & Custom Manufacturing Services',
        description:
            'Professional 3D printing, laser cutting, CNC machining, and custom manufacturing services.',
    },
};

const ThreeDStore = dynamicImport(
    () =>
        import('../../components/page-components/PlaceholderPage').then((mod) => ({
            default: mod.ThreeDStore,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
        ),
    },
);

export default function ThreeDStorePage() {
    return (
        <>
            <SEOStructuredData
                type="product"
                data={{
                    title: '3D Printing Services',
                    description: 'Custom manufacturing and 3D printing services',
                }}
            />
            <ThreeDStore />
        </>
    );
}
