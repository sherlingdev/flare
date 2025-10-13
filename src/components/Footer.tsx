"use client";

import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";

export default function Footer() {
    const { language, mounted: langMounted } = useLanguage();
    const t = translations[langMounted ? language : "en"];

    return (
        <footer className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 animate-slide-up">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                    <div className="footer-text text-center md:text-left" dangerouslySetInnerHTML={{ __html: t.copyright }} />
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
                        <Link href="/terms" className="footer-link text-center">
                            {t.terms}
                        </Link>
                        <Link href="/privacy" className="footer-link text-center">
                            {t.privacy}
                        </Link>
                        <Link href="/about" className="footer-link text-center">
                            {t.aboutUs}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
