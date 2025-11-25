"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface LoadingContextType {
    isLoading: boolean;
    incrementLoading: () => void;
    decrementLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [loadingCount, setLoadingCount] = useState(0);

    const incrementLoading = useCallback(() => {
        setLoadingCount((prev) => prev + 1);
    }, []);

    const decrementLoading = useCallback(() => {
        setLoadingCount((prev) => Math.max(0, prev - 1));
    }, []);

    const isLoading = loadingCount > 0;

    // Intercept fetch globally
    useEffect(() => {
        // Store original fetch
        const originalFetch = window.fetch;

        // URLs to exclude from loading (ads, analytics, Next.js navigation, etc.)
        const excludedPatterns = [
            /google-analytics\.com/,
            /googletagmanager\.com/,
            /googleapis\.com/,
            /gstatic\.com/,
            /effectivegatecpm\.com/,
            /adsterra/,
            /\.netlify\/functions\/currency-rates/, // Exclude Netlify function (fallback)
            // Exclude Next.js internal navigation and prefetching
            /^\/_next\//, // Next.js internal routes (_next/static, _next/data, etc.)
        ];

        // Override fetch
        window.fetch = async function (...args: Parameters<typeof originalFetch>) {
            // Extract URL from different possible types
            let url = '';
            const firstArg = args[0];
            if (typeof firstArg === 'string') {
                url = firstArg;
            } else if (firstArg instanceof URL) {
                url = firstArg.href;
            } else if (firstArg instanceof Request) {
                url = firstArg.url;
            } else if (firstArg && typeof firstArg === 'object') {
                // Handle RequestInfo type (could be Request-like object)
                const requestLike = firstArg as { url?: string; href?: string };
                url = requestLike.url || requestLike.href || '';
            }

            // Check if this request should be excluded
            const shouldExclude = excludedPatterns.some(pattern => pattern.test(url));

            // Exclude Next.js page navigation (not API routes)
            // Next.js makes fetch requests for page navigation that shouldn't trigger the loader
                const isRelativeUrl = url.startsWith('/') && !url.startsWith('//');
                const isApiRoute = url.startsWith('/api/');
            const isRscRequest = url.includes('?_rsc='); // Next.js React Server Components
            const isNextInternal = url.startsWith('/_next/');

            // Exclude page navigation routes (documentation, information, chart, key, etc.)
                // but keep API routes active for loader
            if (!shouldExclude && isRelativeUrl && !isApiRoute && !isNextInternal) {
                    const urlPath = url.split('?')[0].split('#')[0]; // Remove query params and hash
                    const pageRoutes = ['/documentation', '/information', '/chart', '/key', '/privacy', '/terms', '/about', '/'];
                    const isKnownPageRoute = pageRoutes.some(route => urlPath === route || (route !== '/' && urlPath.startsWith(route)));

                // Exclude RSC requests, known page routes, or simple paths (single segment)
                if (isRscRequest || isKnownPageRoute || urlPath.match(/^\/[^/]+$/)) {
                        // This is a Next.js page navigation, exclude from loader
                        return originalFetch.apply(this, args);
                }
            }

            // Only show loader for non-excluded requests
            if (!shouldExclude) {
                incrementLoading();
            }

            try {
                const response = await originalFetch.apply(this, args);
                return response;
            } finally {
                if (!shouldExclude) {
                    decrementLoading();
                }
            }
        };

        // Cleanup: restore original fetch on unmount
        return () => {
            window.fetch = originalFetch;
        };
    }, [incrementLoading, decrementLoading]);

    return (
        <LoadingContext.Provider value={{ isLoading, incrementLoading, decrementLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

