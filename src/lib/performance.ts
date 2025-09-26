/* eslint-disable @typescript-eslint/no-explicit-any */
// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
        const start = performance.now();
        fn();
        const end = performance.now();
        // Performance logging disabled for production
    } else {
        fn();
    }
};

export const measureWebVitals = () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
        try {
            // Measure Core Web Vitals
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.entryType === 'largest-contentful-paint') {
                                // LCP measurement disabled for production
                            }
                            if (entry.entryType === 'first-input') {
                                const fidEntry = entry as any;
                                // FID measurement disabled for production
                            }
                            if (entry.entryType === 'layout-shift') {
                                const clsEntry = entry as any;
                                // CLS measurement disabled for production
                            }
                        }
                    });

            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        } catch {
            // Web Vitals measurement failed - silent handling
        }
    }
};

export const preloadCriticalResources = () => {
    if (typeof window !== 'undefined') {
        // Preload critical fonts
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = '/fonts/dm-sans.woff2';
        fontLink.as = 'font';
        fontLink.type = 'font/woff2';
        fontLink.crossOrigin = 'anonymous';
        document.head.appendChild(fontLink);
    }
};
