// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
        const start = performance.now();
        fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
    } else {
        fn();
    }
};

export const measureWebVitals = () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
        // Measure Core Web Vitals
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime);
                }
                if (entry.entryType === 'first-input') {
                    const fidEntry = entry as PerformanceEventTiming; // Cast to specific type
                    console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
                }
                if (entry.entryType === 'layout-shift') {
                    const clsEntry = entry as LayoutShift; // Cast to specific type
                    console.log('CLS:', clsEntry.value);
                }
            }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
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
