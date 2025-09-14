'use client';

import HomePage from '../components/page-components/HomePage';
import SEOStructuredData from '../components/SEOStructuredData';

export default function Home() {
    return (
        <>
            <SEOStructuredData type="website" />
            <SEOStructuredData type="organization" />
            <HomePage />
        </>
    );
}
