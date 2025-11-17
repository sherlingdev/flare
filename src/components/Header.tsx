"use client";

import { useCallback, lazy, Suspense, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePathname } from "next/navigation";
import { translations } from "@/lib/translations";

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
    const pathname = usePathname();
    const t = translations[langMounted ? language : 'en'] as typeof translations['en'];

    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const languageDropdownRef = useRef<HTMLDivElement>(null);

    const [isApiDropdownOpen, setIsApiDropdownOpen] = useState(false);
    const apiDropdownRef = useRef<HTMLDivElement>(null);

    // Languages configuration
    const languages: { code: Language; name: string }[] = [
        { code: "en", name: "English" },
        { code: "es", name: "Español" },
        { code: "fr", name: "Français" },
        { code: "pt", name: "Português" },
        { code: "de", name: "Deutsch" },
        { code: "zh", name: "中文" },
    ];

    const handleLanguageChange = useCallback((lang: Language) => {
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
            if (apiDropdownRef.current && !apiDropdownRef.current.contains(target)) {
                setIsApiDropdownOpen(false);
            }
        };

        if (isLanguageDropdownOpen || isApiDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLanguageDropdownOpen, isApiDropdownOpen]);

    // Fallback values for SSR
    const currentTheme = mounted ? theme : "dark";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 animate-slide-down">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="header-logo cursor-pointer">Flare</Link>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* API Dropdown */}
                    <div className="relative" ref={apiDropdownRef}>
                        <button
                            onClick={() => setIsApiDropdownOpen(!isApiDropdownOpen)}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm"
                            aria-label="Open API menu"
                        >
                            <span className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#CBD5E1] uppercase">API</span>
                        </button>
                        {isApiDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-slide-down">
                                <Link
                                    href="/documentation"
                                    onClick={() => setIsApiDropdownOpen(false)}
                                    className={`block px-3 py-2.5 text-sm text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 ${pathname === '/documentation' ? 'bg-slate-100 dark:bg-slate-700 text-flare-primary font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    {t.documentation}
                                </Link>
                                <Link
                                    href="/information"
                                    onClick={() => setIsApiDropdownOpen(false)}
                                    className={`block px-3 py-2.5 text-sm text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 ${pathname === '/information' ? 'bg-slate-100 dark:bg-slate-700 text-flare-primary font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    {t.info}
                                </Link>
                                <Link
                                    href="/key"
                                    onClick={() => setIsApiDropdownOpen(false)}
                                    className={`block px-3 py-2.5 text-sm text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 ${pathname === '/key' ? 'bg-slate-100 dark:bg-slate-700 text-flare-primary font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    {t.key}
                                </Link>
                            </div>
                        )}
                    </div>
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
                                        className={`w-full px-3 py-2.5 text-center text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 ${language === lang.code
                                            ? 'bg-slate-100 dark:bg-slate-700 text-flare-primary font-semibold'
                                            : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {lang.name}
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
