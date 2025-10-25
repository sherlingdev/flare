"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const { language, mounted } = useLanguage();

    // Global title management - simple and reactive
    useEffect(() => {
        if (!mounted) return;

        const titles = {
            "/": translations[language].pageTitle,
            "/privacy": translations[language].privacyTitle,
            "/terms": translations[language].termsTitle,
            "/about": translations[language].aboutTitle
        };

        const newTitle = titles[pathname as keyof typeof titles] || translations[language].pageTitle;

        // Only update if different from initial title
        if (document.title !== newTitle) {
            document.title = newTitle;
        }

    }, [pathname, language, mounted]);

    // Conditional layout based on route
    const isHomePage = pathname === "/";
    const isLegalPage = ["/privacy", "/terms", "/about"].includes(pathname);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 flex flex-col">
            <Header />
            <div className={`flex-1 flex justify-center ${isHomePage
                ? "items-center"
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
