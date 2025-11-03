"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import Link from "next/link";

export default function NotFound() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : 'en'] as typeof translations['en'];
    const router = useRouter();
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        // Check if there's history to go back to
        // In browsers, if history.length > 1, we can go back
        if (typeof window !== 'undefined') {
            // Check if we can go back (not on the first page)
            setCanGoBack(window.history.length > 1);
        }
    }, []);

    const handleGoBack = () => {
        router.back();
    };

    return (
        <main className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 homepage-vertical-center">
            <div className="w-full max-w-6xl mb-6">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-flare-primary mb-4">
                        {t.notFoundTitle}
                    </h1>
                    <p className="text-base sm:text-xl text-flare-primary max-w-2xl mx-auto">
                        {t.notFoundSubtitle}
                    </p>
                </div>
            </div>
            <div className="w-full max-w-6xl flex flex-col items-center justify-center gap-6">
                <div className="w-full max-w-none">
                    <div className="flex items-center justify-center gap-4">
                        {canGoBack && (
                            <button
                                onClick={handleGoBack}
                                className="inline-flex items-center px-6 py-3 bg-transparent text-indigo-600 dark:text-indigo-600 border border-indigo-600 dark:border-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            >
                                {t.goBack}
                            </button>
                        )}
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-gray-200 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {t.goHome}
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

