"use client";

import { useCallback, lazy, Suspense } from "react";
import Link from "next/link";
// import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
// import { translations } from "../lib/translations";

// Lazy load icons for better performance
const Sun = lazy(() => import("lucide-react").then(module => ({ default: module.Sun })));
const Moon = lazy(() => import("lucide-react").then(module => ({ default: module.Moon })));
// const BookOpen = lazy(() => import("lucide-react").then(module => ({ default: module.BookOpen })));

interface HeaderProps {
    showBackButton?: boolean;
    backButtonText?: string;
    backButtonHref?: string;
}

export default function Header({
}: HeaderProps) {
    const { toggleLanguage, mounted: langMounted, isEnglish } = useLanguage();
    const { theme, toggleTheme, mounted } = useTheme();

    // const t = translations[mounted ? (isEnglish ? "en" : "es") : "en"];

    const handleLanguageToggle = useCallback(() => {
        toggleLanguage();
    }, [toggleLanguage]);

    const handleThemeToggle = useCallback(() => {
        toggleTheme();
    }, [toggleTheme]);

    // Fallback values for SSR
    const displayLanguage = langMounted ? (isEnglish ? "EN" : "ES") : "EN";
    const currentTheme = mounted ? theme : "dark";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 animate-slide-down">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="header-logo cursor-pointer">Flare</Link>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                        onClick={handleLanguageToggle}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm flex items-center justify-center animate-slide-left"
                        aria-label="Toggle language"
                    >
                        <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {displayLanguage}
                        </span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={handleThemeToggle}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm flex items-center justify-center animate-slide-right"
                        aria-label="Toggle theme"
                    >
                        <Suspense fallback={<div className="w-4 h-4 sm:w-5 sm:h-5" />}>
                            {currentTheme === "dark" ? (
                                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
                            ) : (
                                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
                            )}
                        </Suspense>
                    </button>
                </div>
            </div>
        </header>
    );
}
