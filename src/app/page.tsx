"use client";

import { useEffect } from "react";
// import { useEffect, useLayoutEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { measurePerformance, measureWebVitals } from "@/lib/performance";
import CurrencyConverter from "@/components/CurrencyConverter";
import CurrencyCard from "@/components/CurrencyCard";


export default function Home() {
  const { language, mounted } = useLanguage();
  const t = translations[mounted ? language : "en"];

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
    <main className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 homepage-vertical-center">
      {/* Header */}
      <div className="w-full max-w-6xl mb-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-flare-primary mb-4">
            Flare Exchange Rate
          </h1>
          <p className="text-base sm:text-xl text-flare-primary max-w-2xl mx-auto">
            {t.siteDescription}
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col items-center justify-center gap-6">
        <div className="w-full max-w-none">
          <CurrencyCard>
            <CurrencyConverter />
          </CurrencyCard>
        </div>
      </div>

      {/* Live Exchange Rates Display */}
      <div className="mt-4 animate-fade-in">
        {/* <LastUpdated /> */}
      </div>


    </main>
  );
}