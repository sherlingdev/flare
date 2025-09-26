"use client";

import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { useTheme } from "../components/ThemeProvider";
import { useLanguage } from "../hooks/useLanguage";
import { translations } from "../lib/translations";
import { measurePerformance, measureWebVitals } from "../lib/performance";
import AdBanner from "../components/AdBanner";
import AdSidebar from "../components/AdSidebar";

// Lazy load icons for better performance
const ArrowUpDown = lazy(() => import("lucide-react").then(module => ({ default: module.ArrowUpDown })));
const Sun = lazy(() => import("lucide-react").then(module => ({ default: module.Sun })));
const Moon = lazy(() => import("lucide-react").then(module => ({ default: module.Moon })));
const Globe = lazy(() => import("lucide-react").then(module => ({ default: module.Globe })));

export default function Home() {
  const [fromAmountDisplay, setFromAmountDisplay] = useState("1.00");
  const [toAmountDisplay, setToAmountDisplay] = useState("62.00");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("DOP");
  const [lastUpdated, setLastUpdated] = useState("");
  const fromAmountRef = useRef<HTMLInputElement>(null);
  const toAmountRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme, mounted } = useTheme();
  const { language, toggleLanguage, mounted: langMounted } = useLanguage();
  const t = translations[language];

  // Tasa de cambio USD a DOP (SCT - Agente de Cambio: 1 USD = 62.00 DOP)
  const exchangeRate = 62.00;

  useEffect(() => {
    if (mounted) {
      measurePerformance('Component Mount', () => {
        setLastUpdated(new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        }));

        // Seleccionar el input automáticamente al cargar
        if (fromAmountRef.current) {
          fromAmountRef.current.focus();
          fromAmountRef.current.select();
        }
      });

      // Measure Web Vitals
      measureWebVitals();
    }
  }, [mounted]);


  // Calcular automáticamente el monto de destino
  useEffect(() => {
    // Usar el valor de display para el cálculo (sin comas)
    const cleanFromAmount = fromAmountDisplay.replace(/,/g, '');
    const fromValue = parseFloat(cleanFromAmount) || 0;

    if (fromCurrency === "USD" && toCurrency === "DOP") {
      const calculatedAmount = (fromValue * exchangeRate).toFixed(2);
      setToAmountDisplay(parseFloat(calculatedAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    } else if (fromCurrency === "DOP" && toCurrency === "USD") {
      const calculatedAmount = (fromValue / exchangeRate).toFixed(2);
      setToAmountDisplay(parseFloat(calculatedAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    }
  }, [fromAmountDisplay, fromCurrency, toCurrency, exchangeRate]);

  const handleThemeToggle = useCallback(() => {
    console.log('Theme toggle clicked, current theme:', theme);
    toggleTheme();
  }, [theme, toggleTheme]);

  const handleLanguageToggle = useCallback(() => {
    console.log('Language toggle clicked, current language:', language);
    toggleLanguage();
  }, [language, toggleLanguage]);

  const handleSwapCurrencies = useCallback(() => {
    const tempCurrency = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    // El cálculo automático se encargará de actualizar los montos
  }, [fromCurrency, toCurrency]);


  // Memoized components for better performance
  const Header = useMemo(() => (
    <header className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="w-full px-8 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-slate-800 dark:text-slate-100 text-2xl font-bold tracking-tight cursor-pointer">Flare</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLanguageToggle}
            className="px-4 py-2 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 flex items-center space-x-2 cursor-pointer backdrop-blur-sm"
            aria-label="Toggle language"
          >
            <Suspense fallback={<div className="w-4 h-4" />}>
              <Globe className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </Suspense>
            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
              {langMounted && language === "en" ? "EN" : "ES"}
            </span>
          </button>
          <button
            onClick={handleThemeToggle}
            className="p-3 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm"
            aria-label="Toggle theme"
          >
            <Suspense fallback={<div className="w-5 h-5" />}>
              {mounted && theme === "dark" ? (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </Suspense>
          </button>
        </div>
      </div>
    </header>
  ), [mounted, theme, langMounted, language, handleThemeToggle, handleLanguageToggle]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      {Header}

      {/* Main Content */}
      <main className="relative z-10 px-1 py-1 flex-1 flex items-center justify-center min-h-0">
        <div className="max-w-7xl mx-auto w-full flex flex-col justify-center py-4">

          {/* Top Banner Ad */}
          <div className="mb-4">
            <AdBanner className="mx-auto" position="top" />
          </div>

          {/* Currency Exchange Card - Centered Layout */}
          <div className="flex justify-center items-center space-x-8">
            {/* Left Sidebar Ad */}
            <div className="hidden lg:block">
              <AdSidebar position="left" />
            </div>

            <div className="w-full max-w-4xl mx-8">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-12 w-full border border-slate-200/50 dark:border-slate-700/50">
                {/* Exchange Form - Perfectly Symmetric Layout */}
                <div className="flex items-center justify-center space-x-8">
                  {/* From Currency Section */}
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 rounded-xl px-6 py-4">
                      <input
                        ref={fromAmountRef}
                        type="text"
                        value={fromAmountDisplay}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "0") {
                            setFromAmountDisplay("1.00");
                          } else {
                            setFromAmountDisplay(value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "0") {
                            setFromAmountDisplay("1.00");
                          } else {
                            const num = parseFloat(value);
                            if (!isNaN(num) && num > 0) {
                              if (value.includes('.')) {
                                const parts = value.split('.');
                                const integerPart = parts[0];
                                const decimalPart = parts[1] || '00';
                                if (parseFloat(integerPart) >= 1000) {
                                  const formattedInteger = parseFloat(integerPart).toLocaleString('en-US');
                                  setFromAmountDisplay(`${formattedInteger}.${decimalPart}`);
                                } else {
                                  setFromAmountDisplay(`${integerPart}.${decimalPart}`);
                                }
                              } else {
                                const formatted = num.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                });
                                setFromAmountDisplay(formatted);
                              }
                            }
                          }
                        }}
                        onClick={(e) => e.currentTarget.select()}
                        onFocus={(e) => e.currentTarget.select()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        className="flex-1 text-base font-medium text-gray-900 dark:text-white border-none outline-none bg-transparent"
                        placeholder="1"
                      />
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        USD
                      </span>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={handleSwapCurrencies}
                      className="p-4 bg-gray-100 dark:bg-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Suspense fallback={<div className="w-6 h-6" />}>
                        <ArrowUpDown className="w-6 h-6 text-gray-600 dark:text-gray-300 rotate-90" />
                      </Suspense>
                    </button>
                  </div>

                  {/* To Currency Section */}
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 rounded-xl px-6 py-4">
                      <input
                        ref={toAmountRef}
                        type="text"
                        value={toAmountDisplay}
                        onChange={(e) => setToAmountDisplay(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value;
                          const num = parseFloat(value);
                          if (!isNaN(num) && num > 0) {
                            if (value.includes('.')) {
                              const parts = value.split('.');
                              const integerPart = parts[0];
                              const decimalPart = parts[1] || '00';
                              if (parseFloat(integerPart) >= 1000) {
                                const formattedInteger = parseFloat(integerPart).toLocaleString('en-US');
                                setToAmountDisplay(`${formattedInteger}.${decimalPart}`);
                              } else {
                                setToAmountDisplay(`${integerPart}.${decimalPart}`);
                              }
                            } else {
                              const formatted = num.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              });
                              setToAmountDisplay(formatted);
                            }
                          }
                        }}
                        onClick={(e) => e.currentTarget.select()}
                        onFocus={(e) => e.currentTarget.select()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        className="flex-1 text-base font-medium text-gray-900 dark:text-white border-none outline-none bg-transparent"
                        placeholder="62.00"
                      />
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        DOP
                      </span>
                    </div>
                  </div>
                </div>


                {/* Rate Update Info */}
                <div className="text-center mt-6">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t.lastUpdated} {lastUpdated || t.loading}
                  </p>
                </div>


              </div>
            </div>

            {/* Right Sidebar Ad */}
            <div className="hidden lg:block">
              <AdSidebar position="right" />
            </div>
          </div>

          {/* Bottom Banner Ad */}
          <div className="mt-4">
            <AdBanner className="mx-auto" position="bottom" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="w-full px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1 md:mb-0">
              Copyright <span className="text-indigo-600 dark:text-indigo-400">©</span> 2025 Flare Exchange. All rights reserved.
            </div>
            <div className="flex space-x-6 text-slate-600 dark:text-slate-300 text-sm font-medium">
              <a href="#" className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
                {t.terms}
              </a>
              <a href="#" className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
                {t.privacy}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}