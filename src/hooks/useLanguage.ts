"use client";

import { useEffect, useState } from "react";

type Language = "en" | "es";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage for saved language
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Default to English
      setLanguage("en");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("language", language);
  }, [language, mounted]);

  const toggleLanguage = () => {
    console.log('useLanguage: toggling language from', language, 'to', language === "en" ? "es" : "en");
    setLanguage(prev => prev === "en" ? "es" : "en");
  };

  return { language, toggleLanguage, mounted };
}
