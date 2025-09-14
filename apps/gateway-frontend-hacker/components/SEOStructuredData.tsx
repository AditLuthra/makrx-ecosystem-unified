"use client";
import Script from 'next/script';

type SEOType = 'organization' | 'website' | 'article' | 'product';

interface Props {
  type: SEOType;
  data?: Record<string, any>;
}

export function SEOStructuredData({ type, data = {} }: Props) {
  const base: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': type.charAt(0).toUpperCase() + type.slice(1),
  };

  const payload = { ...base, ...data };

  return (
    <Script
      id={`jsonld-${type}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

