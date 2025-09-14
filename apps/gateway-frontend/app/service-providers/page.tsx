import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import SEOStructuredData from '../../components/SEOStructuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Service Providers - Professional Manufacturing Partners | MakrX',
    description:
        'Connect with verified manufacturing service providers across India. Find experts for 3D printing, CNC machining, PCB assembly, and custom fabrication.',
    keywords: [
        'service providers',
        'manufacturing partners',
        '3d printing services',
        'cnc machining',
        'pcb assembly',
        'custom fabrication',
    ],
    openGraph: {
        title: 'Service Providers - Professional Manufacturing Partners',
        description: 'Connect with verified manufacturing service providers across India.',
        url: 'https://makrx.org/service-providers',
        type: 'website',
    },
    twitter: {
        title: 'MakrX Service Providers',
        description: 'Connect with verified manufacturing service providers across India.',
    },
};

const ServiceProviders = dynamicImport(
    () =>
        import('../../components/page-components/PlaceholderPage').then((mod) => ({
            default: mod.ServiceProviders,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
        ),
    },
);

export default function ServiceProvidersPage() {
    return (
        <>
            <SEOStructuredData
                type="website"
                data={{
                    title: 'Service Providers',
                    description: 'Professional manufacturing service providers',
                }}
            />
            <ServiceProviders />
        </>
    );
}
