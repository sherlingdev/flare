"use client";

import { useEffect, useLayoutEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import { measurePerformance, measureWebVitals } from "../lib/performance";
// import AdBanner from "../components/AdBanner";
// import AdSidebar from "../components/AdSidebar";
import CurrencyConverter from "../components/CurrencyConverter";
import CurrencyCard from "../components/CurrencyCard";
// import CurrencyVariations from "../components/CurrencyVariations";
// import LastUpdated from "../components/LastUpdated";

export default function Home() {
  const { language, mounted } = useLanguage();
  const t = translations[mounted ? language : "en"];

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
    <main className="relative z-10 w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 animate-fade-in">
      <div className="w-full flex flex-col items-center justify-center pt-16 pb-8">

        {/* Header */}
        <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mb-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              {t.siteName}
            </h1>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t.siteDescription}
            </p>
          </div>
        </div>

        <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start justify-center gap-8">

          {/* Left Sidebar Ad */}
          <div className="hidden lg:block">
            {/* <AdSidebar position="left" /> */}
          </div>

          <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
            {/* Currency Variations */}
            {/* <CurrencyVariations /> */}

            <CurrencyCard>
              <CurrencyConverter />
            </CurrencyCard>
          </div>

          <div className="hidden lg:block">
            {/* <AdSidebar position="right" /> */}
          </div>
        </div>

        {/* Live Exchange Rates Display */}
        <div className="mt-6 animate-fade-in">
          {/* <LastUpdated /> */}
        </div>

        <div className="mt-2">
          {/* <AdBanner className="mx-auto" position="bottom" /> */}
        </div>
      </div>
    </main>
  );
}