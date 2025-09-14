import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'MakrX - Digital Manufacturing Ecosystem',
        short_name: 'MakrX',
        description:
            "India's leading digital manufacturing platform connecting creators, makerspaces, and service providers",
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        categories: ['productivity', 'business', 'education'],
        lang: 'en',
        dir: 'ltr',
        orientation: 'portrait-primary',
        icons: [
            {
                src: '/favicon.ico',
                sizes: '16x16',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        shortcuts: [
            {
                name: 'Find Makerspaces',
                short_name: 'Makerspaces',
                description: 'Discover makerspaces near you',
                url: '/makerspaces',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
                name: 'Shop Store',
                short_name: 'Store',
                description: 'Browse electronics and tools',
                url: '/store',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
                name: '3D Printing',
                short_name: '3D Services',
                description: 'Custom manufacturing services',
                url: '/3d',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
        ],
        related_applications: [
            {
                platform: 'webapp',
                url: 'https://makrx.org',
            },
        ],
        prefer_related_applications: false,
        scope: '/',
        id: 'makrx-app',
    };
}
