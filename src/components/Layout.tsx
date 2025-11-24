"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { translations } from "@/lib/translations";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const { language, mounted } = useLanguage();
    const { closeModal, isOpen } = useAuthModal();

    useEffect(() => {
        if (!mounted) return;
        const direction = translations[language].direction || "ltr";
        document.documentElement.setAttribute("lang", language);
        document.documentElement.setAttribute("dir", direction);
        document.documentElement.dataset.language = language;
    }, [language, mounted]);

    // Global title management - simple and reactive
    useEffect(() => {
        if (!mounted) return;

        const titles = {
            "/": translations[language].pageTitle,
            "/privacy": translations[language].privacyTitle,
            "/terms": translations[language].termsTitle,
            "/about": translations[language].aboutTitle,
            "/documentation": translations[language].documentationTitle,
            "/key": translations[language].apiKeyTitle,
            "/information": translations[language].informationTitle,
            "/chart": translations[language].chartTitlePage,
        };

        const newTitle = titles[pathname as keyof typeof titles] || translations[language].notFoundPageTitle || translations[language].pageTitle;

        // Only update if different from initial title
        if (document.title !== newTitle) {
            document.title = newTitle;
        }

    }, [pathname, language, mounted]);

    // Close auth modal when navigating away from protected pages
    // Track previous pathname to only close when actually navigating away
    const prevPathnameRef = useRef(pathname);
    
    useEffect(() => {
        const protectedPages = ['/chart', '/key'];
        const isProtectedPage = protectedPages.includes(pathname);
        const wasProtectedPage = protectedPages.includes(prevPathnameRef.current);
        
        // Only close if we were on a protected page and now we're not
        // This prevents closing when user manually opens modal from homepage
        if (wasProtectedPage && !isProtectedPage && isOpen) {
            closeModal();
        }
        
        prevPathnameRef.current = pathname;
    }, [pathname, isOpen, closeModal]);

    // Conditional layout based on route
    const isHomeOrKey = pathname === "/" || pathname === "/key";
    const isLegalPage = ["/privacy", "/terms", "/about", "/documentation", "/information"].includes(pathname);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 flex flex-col">
            <Header />
            <div className={`flex-1 flex justify-center ${isHomeOrKey
                ? "items-center pt-24 sm:pt-28 pb-16 sm:pb-20"
                : isLegalPage
                    ? "items-start overflow-y-auto pt-20 sm:pt-24"
                    : "items-center pt-20 sm:pt-24"
                }`}>
                {children}
            </div>
            <Footer />
        </div>
    );
}
