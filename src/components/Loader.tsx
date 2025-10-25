"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { translations } from "@/lib/translations";

export default function Loader() {
    const { mounted: langMounted, language } = useLanguage();
    const { mounted: themeMounted } = useTheme();
    const [showLoader, setShowLoader] = useState(true);
    const [showText, setShowText] = useState(false);

    const t = translations[langMounted ? language : "en"];

    // Force scroll to top immediately when loader mounts
    useEffect(() => {
        // Immediate scroll to top to prevent any scroll restoration
        window.scrollTo(0, 0);

        // Store original overflow value
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore original overflow value
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Show text only when localStorage is loaded
    useEffect(() => {
        if (langMounted && themeMounted) {
            setShowText(true);
        }
    }, [langMounted, themeMounted]);

    // Hide loader logic
    useEffect(() => {
        const minTime = 1000; // Minimum display time
        const maxTime = 3000; // Maximum display time (safety timeout)

        // Maximum timeout - force hide
        const maxTimer = setTimeout(() => {
            setShowLoader(false);
            // Restore scroll when loader hides
            document.body.style.overflow = 'auto';
        }, maxTime);

        // When everything is ready, wait minimum time then hide
        if (langMounted && themeMounted) {
            const minTimer = setTimeout(() => {
                setShowLoader(false);
                // Restore scroll when loader hides
                document.body.style.overflow = 'auto';
            }, minTime);

            return () => {
                clearTimeout(minTimer);
                clearTimeout(maxTimer);
            };
        }

        return () => clearTimeout(maxTimer);
    }, [langMounted, themeMounted]);

    if (!showLoader) return null;

    return (
        <div
            className="fixed inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-[9999] flex items-center justify-center"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden'
            }}
        >
            <div className="flex flex-col items-center">
                {/* Spinner */}
                <div className="relative">
                    <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin-smooth"></div>
                </div>

                {/* Loading text - smooth fade in when localStorage is ready */}
                {showText && (
                    <div className="mt-6 animate-fade-in">
                        <p className="text-xs sm:text-sm font-medium text-flare-primary">
                            {t.loading}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
