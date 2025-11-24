"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { type SupportedLocale } from "@/lib/translations";

export type Language = SupportedLocale;

interface LanguageContextType {
    language: Language;
    changeLanguage: (lang: Language) => void;
    mounted: boolean;
    languageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageNames: Record<Language, string> = {
    en: "English",
    es: "Español",
    fr: "Français",
    pt: "Português",
    de: "Deutsch",
    zh: "中文 (简体)",
    it: "Italiano"
};

const supportedLanguages = Object.keys(languageNames) as Language[];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Always start with "en" to match server rendering
    const [language, setLanguage] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    // Load language from localStorage after mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage && supportedLanguages.includes(savedLanguage as Language)) {
            setLanguage(savedLanguage as Language);
        }
        setMounted(true);
    }, []);

    // Save to localStorage when language changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("language", language);
        }
    }, [language, mounted]);

    const changeLanguage = useCallback((lang: Language) => {
        setLanguage(lang);
    }, []);

    const value = {
        language,
        changeLanguage,
        mounted,
        languageName: languageNames[language]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}