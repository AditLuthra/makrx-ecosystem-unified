// Performance monitoring utilities
export interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export function measureWebVitals(metric: any) {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    url: window.location.href,
    timestamp: Date.now(),
  });

  // Log metrics in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric.name, metric.value, metric.rating);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // You can send this to your analytics service
    // navigator.sendBeacon('/api/analytics', body);
  }
}

export function trackPageLoad() {
  if (typeof window === 'undefined') return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  const metrics = {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.startTime,
    domComplete: navigation.domComplete - navigation.startTime,
    loadComplete: navigation.loadEventEnd - navigation.startTime,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Page Load Metrics:', metrics);
  }

  return metrics;
}

export function trackResourceLoading() {
  if (typeof window === 'undefined') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const slowResources = resources
    .filter((resource) => resource.duration > 500) // Resources taking more than 500ms
    .map((resource) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: getResourceType(resource.name),
    }));

  if (process.env.NODE_ENV === 'development' && slowResources.length > 0) {
    console.warn('Slow loading resources:', slowResources);
  }

  return slowResources;
}

function getResourceType(url: string): string {
  if (url.includes('.js')) return 'script';
  if (url.includes('.css')) return 'stylesheet';
  if (url.includes('.png') || url.includes('.jpg') || url.includes('.webp')) return 'image';
  if (url.includes('.woff') || url.includes('.ttf')) return 'font';
  return 'other';
}

// Lazy loading utility for images
export function createLazyImageObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy');
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    },
  );
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
  ];

  criticalResources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
}
