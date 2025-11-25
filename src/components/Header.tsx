"use client";

import { useCallback, lazy, Suspense, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePathname } from "next/navigation";
import { translations } from "@/lib/translations";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "@/components/AuthModal";
import { useAuthModal } from "@/contexts/AuthModalContext";

// Lazy load icons for better performance
const Sun = lazy(() => import("lucide-react").then(module => ({ default: module.Sun })));
const Moon = lazy(() => import("lucide-react").then(module => ({ default: module.Moon })));
const Box = lazy(() => import("lucide-react").then(module => ({ default: module.Box })));
const Globe = lazy(() => import("lucide-react").then(module => ({ default: module.Globe })));
const User = lazy(() => import("lucide-react").then(module => ({ default: module.User })));
const LogOut = lazy(() => import("lucide-react").then(module => ({ default: module.LogOut })));

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

    const router = useRouter();
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const languageDropdownRef = useRef<HTMLDivElement>(null);

    const [isApiDropdownOpen, setIsApiDropdownOpen] = useState(false);
    const apiDropdownRef = useRef<HTMLDivElement>(null);

    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Helper function to get display name from user
    const getUserDisplayName = (user: { user_metadata?: { full_name?: string; name?: string; display_name?: string }; email?: string }): string => {
        // Try to get name from user_metadata
        const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.display_name;
        if (fullName) {
            return fullName;
        }

        // If no name, extract from email (part before @) and capitalize
        if (user?.email) {
            const emailPart = user.email.split('@')[0];
            // Capitalize first letter and replace dots/underscores with spaces
            return emailPart
                .replace(/[._]/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }

        return user?.email || 'User';
    };

    const { isOpen: isAuthModalOpen, openModal: openAuthModal, closeModal: closeAuthModal } = useAuthModal();

    // Languages configuration
    // Ordered by global usage and regional importance
    const languages: { code: Language; name: string }[] = [
        { code: "en", name: "English" },      // Most widely used globally
        { code: "es", name: "Español" },      // Second most spoken native language
        { code: "pt", name: "Português" },    // Large market (Brazil)
        { code: "fr", name: "Français" },     // Major European language
        { code: "de", name: "Deutsch" },      // Major European language
        { code: "it", name: "Italiano" },     // European language
        { code: "zh", name: "中文" },         // Large market (China)
    ];

    const handleLanguageChange = useCallback((lang: Language) => {
        changeLanguage(lang);
        setIsLanguageDropdownOpen(false);
    }, [changeLanguage]);

    const handleThemeToggle = useCallback(() => {
        toggleTheme();
    }, [toggleTheme]);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setIsAuthenticated(true);
                setUserEmail(session.user.email || null);
                setUserName(getUserDisplayName(session.user));
            } else {
                setIsAuthenticated(false);
                setUserEmail(null);
                setUserName(null);
            }
        };

        // Check auth immediately, don't wait for mounted
        checkAuth();

        // Listen for auth state changes
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setIsAuthenticated(true);
                setUserEmail(session.user.email || null);
                setUserName(getUserDisplayName(session.user));
            } else {
                setIsAuthenticated(false);
                setUserEmail(null);
                setUserName(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

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
            if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
                setIsUserDropdownOpen(false);
            }
        };

        if (isLanguageDropdownOpen || isApiDropdownOpen || isUserDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLanguageDropdownOpen, isApiDropdownOpen, isUserDropdownOpen]);

    // Handle logout
    const handleLogout = async () => {
        const supabase = createClient();

        // Always clear local state first
        setIsUserDropdownOpen(false);
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserName(null);

        // Attempt sign out silently (don't wait for it or show errors)
        // Use signOut without scope to avoid global logout errors
        supabase.auth.signOut().catch(() => {
            // Silently ignore any errors - user is already logged out locally
        });

        // Redirect to home page immediately
        router.push('/');
        router.refresh();
    };

    // Fallback values for SSR
    const currentTheme = mounted ? theme : "dark";

    return (
        <header className="fixed top-0 left-0 right-0 z-[10000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 animate-slide-down">
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
                            <Suspense fallback={<div className="w-4 h-4 sm:w-5 sm:h-5" />}>
                                <Box className="w-4 h-4 sm:w-5 sm:h-5 text-flare-primary" />
                            </Suspense>
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
                                    href="/chart"
                                    onClick={() => setIsApiDropdownOpen(false)}
                                    className={`block px-3 py-2.5 text-sm text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 ${pathname === '/chart' ? 'bg-slate-100 dark:bg-slate-700 text-flare-primary font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    Chart
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
                            <Suspense fallback={<div className="w-4 h-4 sm:w-5 sm:h-5" />}>
                                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-flare-primary" />
                            </Suspense>
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

                    {/* User Auth Button / Dropdown */}
                    <div className="relative" ref={userDropdownRef}>
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm animate-slide-left"
                                    aria-label="User menu"
                                >
                                    <Suspense fallback={<div className="w-4 h-4 sm:w-5 sm:h-5" />}>
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-flare-primary" />
                                    </Suspense>
                                </button>
                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-slide-down">
                                        <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                                            <p className="text-sm font-semibold text-flare-primary truncate">
                                                {userName}
                                            </p>
                                            {userEmail && userName !== userEmail && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                    {userEmail}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                        >
                                            <Suspense fallback={<div className="w-4 h-4" />}>
                                                <LogOut className="w-4 h-4" />
                                            </Suspense>
                                            {t.logOut}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    openAuthModal();
                                }}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm animate-slide-left"
                                aria-label="Open authentication"
                            >
                                <Suspense fallback={<div className="w-4 h-4 sm:w-5 sm:h-5" />}>
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-flare-primary" />
                                </Suspense>
                            </button>
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
            <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
        </header>
    );
}
