"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { translations } from "@/lib/translations";

interface LoaderProps {
    show?: boolean; // Optional: if not provided, works as auto-loader
    blockScroll?: boolean;
}

export default function Loader({ show, blockScroll = true }: LoaderProps = {}) {
    const { mounted: langMounted, language } = useLanguage();
    const { mounted: themeMounted } = useTheme();
    const [showLoader, setShowLoader] = useState(show === undefined ? true : show);
    const [showText, setShowText] = useState(false);

    const t = translations[langMounted ? language : "en"];

    // Update showLoader when show prop changes (controlled mode)
    useEffect(() => {
        if (show !== undefined) {
            setShowLoader(show);
        }
    }, [show]);

    // Force scroll to top immediately when loader mounts
    useEffect(() => {
        if (!showLoader || !blockScroll) return;

        // Immediate scroll to top to prevent any scroll restoration
        window.scrollTo(0, 0);

        // Store original overflow value
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore original overflow value
            document.body.style.overflow = originalOverflow;
        };
    }, [showLoader, blockScroll]);

    // Show text only when localStorage is loaded (auto mode) or immediately (controlled mode)
    useEffect(() => {
        // In controlled mode (show !== undefined), show text immediately
        if (show !== undefined) {
            setShowText(true);
        } else if (langMounted && themeMounted) {
            // In auto mode, wait for contexts to be ready
            setShowText(true);
        }
    }, [langMounted, themeMounted, show]);

    // Hide loader logic (only when show is undefined, auto mode)
    useEffect(() => {
        if (show !== undefined) return; // Only run auto-hide if show is not provided

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
    }, [langMounted, themeMounted, show]);

    const [mounted, setMounted] = useState(false);
    const isControlled = show !== undefined;

    // Only use portal in controlled mode (for ApiKey), normal render in auto mode (for layout)
    useEffect(() => {
        if (isControlled) {
            setMounted(true);
            return () => setMounted(false);
        }
    }, [isControlled]);

    if (!showLoader) return null;

    const loaderContent = (
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
                overflow: 'hidden',
                zIndex: 9999
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

    // Use portal only in controlled mode (ApiKey), normal render in auto mode (Layout)
    if (isControlled && mounted) {
        return createPortal(loaderContent, document.body);
    }

    // Normal render for auto mode (Layout)
    return loaderContent;
}
