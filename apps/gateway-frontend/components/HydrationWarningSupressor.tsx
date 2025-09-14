'use client';

import { useEffect } from 'react';

/**
 * Component to suppress hydration warnings caused by browser extensions
 * Common extensions like Grammarly add attributes to the DOM that cause
 * hydration mismatches between server and client rendering
 */
export default function HydrationWarningSupressor() {
    useEffect(() => {
        // Common browser extension attributes that cause hydration warnings
        const extensionAttributes = [
            'data-new-gr-c-s-check-loaded',
            'data-gr-ext-installed',
            'data-lt-installed',
            'cz-shortcut-listen',
            'data-darkreader-mode',
            'data-darkreader-scheme',
        ];

        // Remove these attributes from body to prevent hydration warnings
        const body = document.body;
        if (body) {
            extensionAttributes.forEach((attr) => {
                if (body.hasAttribute(attr)) {
                    body.removeAttribute(attr);
                }
            });
        }

        // Set up a mutation observer to catch dynamically added extension attributes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.target === body) {
                    const attributeName = mutation.attributeName;
                    if (attributeName && extensionAttributes.includes(attributeName)) {
                        body.removeAttribute(attributeName);
                    }
                }
            });
        });

        // Start observing
        observer.observe(body, {
            attributes: true,
            attributeFilter: extensionAttributes,
        });

        // Cleanup
        return () => {
            observer.disconnect();
        };
    }, []);

    return null; // This component doesn't render anything
}
