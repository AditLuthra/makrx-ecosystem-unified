import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import SEOStructuredData from '../../components/SEOStructuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'MakrX Store - Electronics, Tools & Manufacturing Components',
    description:
        'Shop electronics, 3D printing materials, Arduino, Raspberry Pi, tools, and manufacturing components. Fast delivery across India with expert support.',
    keywords: [
        'electronics store india',
        'arduino raspberry pi',
        '3d printing materials',
        'maker tools',
        'manufacturing components',
        'electronics components',
    ],
    openGraph: {
        title: 'MakrX Store - Electronics, Tools & Manufacturing Components',
        description:
            'Shop electronics, 3D printing materials, tools, and components with fast delivery across India.',
        url: 'https://makrx.org/store',
        type: 'website',
    },
    twitter: {
        title: 'MakrX Store - Electronics & Manufacturing Components',
        description:
            'Shop electronics, 3D printing materials, tools, and components with fast delivery across India.',
    },
};

const Store = dynamicImport(
    () =>
        import('../../components/page-components/PlaceholderPage').then((mod) => ({
            default: mod.Store,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
        ),
    },
);

export default function StorePage() {
    return (
        <>
            <SEOStructuredData
                type="product"
                data={{
                    title: 'MakrX Store',
                    description: 'Electronics and manufacturing components store',
                }}
            />
            <Store />
        </>
    );
}
