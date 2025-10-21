"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import { measurePerformance, measureWebVitals } from "../lib/performance";
import CurrencyConverter from "../components/CurrencyConverter";
import CurrencyCard from "../components/CurrencyCard";

export default function Home() {
  const { language, mounted } = useLanguage();
  const t = translations[mounted ? language : "en"];
  const [dynamicTitle, setDynamicTitle] = useState("Flare Exchange Rate");

  // Update page title dynamically - useLayoutEffect to prevent static title flash
  useLayoutEffect(() => {
    document.title = t.pageTitle;
  }, [t.pageTitle]);

  useEffect(() => {
    if (mounted) {
      measurePerformance('Component Mount', () => {
        // Component mounted successfully
      });

      // Measure Web Vitals
      measureWebVitals();
    }
  }, [mounted, language]);

  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="w-full max-w-6xl mb-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            {dynamicTitle}
          </h1>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.siteDescription}
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-6">

        {/* Left Sidebar Ad */}
        <div className="hidden lg:block">
          {/* <AdSidebar position="left" /> */}
        </div>

        <div className="w-full max-w-none">
          <CurrencyCard>
            <CurrencyConverter onTitleChange={setDynamicTitle} />
          </CurrencyCard>
        </div>

        <div className="hidden lg:block">
          {/* <AdSidebar position="right" /> */}
        </div>
      </div>

      {/* Live Exchange Rates Display */}
      <div className="mt-4 animate-fade-in">
        {/* <LastUpdated /> */}
      </div>
    </main>
  );
}