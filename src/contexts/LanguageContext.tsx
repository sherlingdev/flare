"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Language = "en" | "es";

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    mounted: boolean;
    isEnglish: boolean;
    isSpanish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    // Initialize from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("language") as Language;
        if (saved === "en" || saved === "es") {
            setLanguage(saved);
        }
        setMounted(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("language", language);
        }
    }, [language, mounted]);

    const toggleLanguage = useCallback(() => {
        const newLang = language === "en" ? "es" : "en";
        setLanguage(newLang);
    }, [language]);

    const value = {
        language,
        toggleLanguage,
        mounted,
        isEnglish: language === "en",
        isSpanish: language === "es"
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
