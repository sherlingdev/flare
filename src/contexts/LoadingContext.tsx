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

        // URLs to exclude from loading (ads, analytics, etc.)
        const excludedPatterns = [
            /google-analytics\.com/,
            /googletagmanager\.com/,
            /googleapis\.com/,
            /gstatic\.com/,
            /effectivegatecpm\.com/,
            /adsterra/,
            /\.netlify\/functions\/currency-rates/, // Exclude Netlify function (fallback)
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

