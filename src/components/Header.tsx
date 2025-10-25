"use client";

import { useCallback, lazy, Suspense, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

// Lazy load icons for better performance
const Sun = lazy(() => import("lucide-react").then(module => ({ default: module.Sun })));
const Moon = lazy(() => import("lucide-react").then(module => ({ default: module.Moon })));

interface HeaderProps {
    showBackButton?: boolean;
    backButtonText?: string;
    backButtonHref?: string;
}

export default function Header({
}: HeaderProps) {
    const { changeLanguage, mounted: langMounted, language } = useLanguage();
    const { theme, toggleTheme, mounted } = useTheme();

    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const languageDropdownRef = useRef<HTMLDivElement>(null);

    // Languages configuration
    const languages = [
        { code: "en" as const, name: "English", flag: "🇺🇸" },
        { code: "es" as const, name: "Español", flag: "🇪🇸" },
        { code: "fr" as const, name: "Français", flag: "🇫🇷" },
        { code: "pt" as const, name: "Português", flag: "🇵🇹" },
    ];

    const handleLanguageChange = useCallback((lang: "en" | "es" | "fr" | "pt") => {
        changeLanguage(lang);
        setIsLanguageDropdownOpen(false);
    }, [changeLanguage]);

    const handleThemeToggle = useCallback(() => {
        toggleTheme();
    }, [toggleTheme]);

    // Handle clicks outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(target)) {
                setIsLanguageDropdownOpen(false);
            }
        };

        if (isLanguageDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLanguageDropdownOpen]);

    // Fallback values for SSR
    const currentTheme = mounted ? theme : "dark";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 animate-slide-down">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="header-logo cursor-pointer">Flare</Link>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Language Dropdown */}
                    <div className="relative" ref={languageDropdownRef}>
                        <button
                            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm animate-slide-left"
                            aria-label="Select language"
                        >
                            <span className="text-xs sm:text-sm font-semibold text-flare-primary">
                                {langMounted ? language.toUpperCase() : "EN"}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {isLanguageDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-slide-down">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 ${language === lang.code
                                            ? 'bg-slate-100 dark:bg-slate-700 text-flare-primary font-semibold'
                                            : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <span className="text-lg flex items-center">{lang.flag}</span>
                                        <span className="text-sm flex items-center">{lang.name}</span>
                                        {language === lang.code && (
                                            <span className="ml-auto text-flare-primary flex items-center">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={handleThemeToggle}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm flex items-center justify-center animate-slide-right"
                        aria-label="Toggle theme"
                    >
                        <Suspense fallback={<div className="w-4 h-4 sm:w-5 sm:h-5" />}>
                            {currentTheme === "dark" ? (
                                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-flare-primary" />
                            ) : (
                                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-flare-primary" />
                            )}
                        </Suspense>
                    </button>
                </div>
            </div>
        </header>
    );
}
