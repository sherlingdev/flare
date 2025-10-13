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
    // Always start with "en" to match server rendering
    const [language, setLanguage] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    // Load language from localStorage after mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage === "es" || savedLanguage === "en") {
            setLanguage(savedLanguage);
        }
        setMounted(true);
    }, []);

    // Save to localStorage when language changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("language", language);
        }
    }, [language, mounted]);

    const toggleLanguage = useCallback(() => {
        setLanguage((prev) => (prev === "en" ? "es" : "en"));
    }, []);

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