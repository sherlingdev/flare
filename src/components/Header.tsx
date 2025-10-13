"use client";

import { useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "./ThemeProvider";

// Lazy load icons for better performance
const Sun = lazy(() => import("lucide-react").then(module => ({ default: module.Sun })));
const Moon = lazy(() => import("lucide-react").then(module => ({ default: module.Moon })));
const Globe = lazy(() => import("lucide-react").then(module => ({ default: module.Globe })));

interface HeaderProps {
    showBackButton?: boolean;
    backButtonText?: string;
    backButtonHref?: string;
}

export default function Header({
    showBackButton = false,
    backButtonText = "Back to Converter",
    backButtonHref = "/"
}: HeaderProps) {
    const { language, toggleLanguage, mounted: langMounted, isEnglish } = useLanguage();
    const { theme, toggleTheme, mounted } = useTheme();

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
        <header className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="header-logo cursor-pointer">Flare</Link>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                        onClick={handleLanguageToggle}
                        className="px-3 sm:px-4 py-2 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 cursor-pointer backdrop-blur-sm"
                        aria-label="Toggle language"
                    >
                        <Suspense fallback={<div className="w-3 h-3 sm:w-4 sm:h-4" />}>
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />
                        </Suspense>
                        <span className="header-button-text">
                            {displayLanguage}
                        </span>
                    </button>
                    <button
                        onClick={handleThemeToggle}
                        className="p-2 sm:p-3 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm flex items-center justify-center"
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
