"use client";

import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { useTheme } from "../components/ThemeProvider";
import { useLanguage } from "../hooks/useLanguage";
import { useExchangeRate } from "../hooks/useExchangeRate";
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
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const fromAmountRef = useRef<HTMLInputElement>(null);
  const toAmountRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme, mounted } = useTheme();
  const { language, toggleLanguage, mounted: langMounted } = useLanguage();
  const { getRate } = useExchangeRate(fromCurrency, toCurrency);
  const t = translations[language];

  // Available currencies
  const currencies = useMemo(() => [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' }
  ], []);

  useEffect(() => {
    if (mounted) {
      measurePerformance('Component Mount', () => {
        // Seleccionar el input automáticamente al cargar
        if (fromAmountRef.current) {
          fromAmountRef.current.focus();
          fromAmountRef.current.select();
        }
      });

      // Measure Web Vitals
      measureWebVitals();
    }
  }, [mounted, language]);


  // Calcular automáticamente el monto de destino con alta precisión
  useEffect(() => {
    // Usar el valor de display para el cálculo (sin comas)
    const cleanFromAmount = fromAmountDisplay.replace(/,/g, '');
    const fromValue = parseFloat(cleanFromAmount) || 0;

    // Solo calcular si hay un valor válido y mayor que 0
    if (fromValue > 0) {
      const currentRate = getRate(fromCurrency, toCurrency);
      if (currentRate > 0) {
        // Use high precision calculation to avoid floating point errors
        const precision = 100; // 2 decimal places
        const calculatedAmount = Math.round(fromValue * currentRate * precision) / precision;
        setToAmountDisplay(calculatedAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }));
      }
    }
  }, [fromAmountDisplay, fromCurrency, toCurrency, getRate]);

  const handleThemeToggle = useCallback(() => {
    console.log('Theme toggle clicked, current theme:', theme);
    toggleTheme();
  }, [theme, toggleTheme]);

  const handleLanguageToggle = useCallback(() => {
    console.log('Language toggle clicked, current language:', language);
    toggleLanguage();
  }, [language, toggleLanguage]);

  const handleSwapCurrencies = useCallback(() => {
    // Intercambiar monedas
    const newFromCurrency = toCurrency;
    const newToCurrency = fromCurrency;

    // Intercambiar montos - usar el valor actual del "to" como nuevo "from"
    const newFromAmount = toAmountDisplay;

    // Limpiar el valor de destino para que se recalcule
    setToAmountDisplay("1.00");

    // Actualizar estados
    setFromCurrency(newFromCurrency);
    setToCurrency(newToCurrency);
    setFromAmountDisplay(newFromAmount);

    // Seleccionar el input después del swap
    setTimeout(() => {
      if (fromAmountRef.current) {
        fromAmountRef.current.focus();
        fromAmountRef.current.select();
      }
    }, 100);
  }, [fromCurrency, toCurrency, toAmountDisplay]);

  // Handle currency changes with validation
  const handleFromCurrencyChange = useCallback((newCurrency: string) => {
    if (newCurrency === toCurrency) {
      // If trying to select the same currency, find an alternative
      const availableCurrencies = currencies.filter(c => c.code !== newCurrency);
      if (availableCurrencies.length > 0) {
        setToCurrency(availableCurrencies[0].code);
      }
    }
    setFromCurrency(newCurrency);
  }, [toCurrency, currencies]);

  const handleToCurrencyChange = useCallback((newCurrency: string) => {
    if (newCurrency === fromCurrency) {
      // If trying to select the same currency, find an alternative
      const availableCurrencies = currencies.filter(c => c.code !== newCurrency);
      if (availableCurrencies.length > 0) {
        setFromCurrency(availableCurrencies[0].code);
      }
    }
    setToCurrency(newCurrency);
  }, [fromCurrency, currencies]);

  // Custom dropdown handlers
  const handleFromDropdownClick = useCallback(() => {
    setFromDropdownOpen(prev => !prev);
    setToDropdownOpen(false); // Close other dropdown
  }, []);

  const handleToDropdownClick = useCallback(() => {
    setToDropdownOpen(prev => !prev);
    setFromDropdownOpen(false); // Close other dropdown
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.currency-select') && !target.closest('.dropdown-options')) {
        setFromDropdownOpen(false);
        setToDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Function to get ordered currencies with selected first
  const getOrderedCurrencies = useCallback((excludeCurrency: string, selectedCurrency: string) => {
    const filteredCurrencies = currencies.filter(c => c.code !== excludeCurrency);
    const selected = filteredCurrencies.find(c => c.code === selectedCurrency);
    const others = filteredCurrencies.filter(c => c.code !== selectedCurrency);

    return selected ? [selected, ...others] : filteredCurrencies;
  }, [currencies]);


  // Memoized components for better performance
  const Header = useMemo(() => (
    <header className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center">
          <span className="header-logo cursor-pointer">Flare</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={handleLanguageToggle}
            className="px-3 sm:px-4 py-2 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 cursor-pointer backdrop-blur-sm"
            aria-label="Toggle language"
          >
            <Suspense fallback={<div className="w-3 h-3 sm:w-4 sm:h-4" />}>
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />
            </Suspense>
            <span className="header-button-text">
              {langMounted && language === "en" ? "EN" : "ES"}
            </span>
          </button>
          <button
            onClick={handleThemeToggle}
            className="p-2 sm:p-3 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm flex items-center justify-center"
            aria-label="Toggle theme"
          >
            <Suspense fallback={<div className="w-4 h-4 sm:w-5 sm:h-5" />}>
              {mounted && theme === "dark" ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
              )}
            </Suspense>
          </button>
        </div>
      </div>
    </header>
  ), [mounted, theme, langMounted, language, handleThemeToggle, handleLanguageToggle]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      {Header}

      {/* Main Content */}
      <main className="relative z-10 px-6 sm:px-8 lg:px-1 py-1 flex-1 flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col justify-center py-2">

          {/* Top Banner Ad */}
          <div className="mb-2">
            <AdBanner className="mx-auto" position="top" />
          </div>

          {/* Currency Exchange Card - Responsive Layout */}
          <div className="flex flex-col lg:flex-row justify-center items-center lg:space-x-8 space-y-4 lg:space-y-0">
            {/* Left Sidebar Ad */}
            <div className="hidden lg:block">
              <AdSidebar position="left" />
            </div>

            <div className="w-full max-w-4xl mx-4 sm:mx-6 lg:mx-8">
              <div className="currency-converter-card bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50">
                {/* Exchange Form - Mobile Vertical Stack, Desktop Horizontal */}
                <div className="currency-input-group flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8 relative">
                  {/* From Currency Section */}
                  <div className="w-full lg:flex-1 lg:max-w-xs order-1 lg:order-1">
                    <div className="flex items-center space-x-2 sm:space-x-4 bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
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
                        className="currency-input flex-1 border-none outline-none bg-transparent"
                        placeholder={t.enterAmount}
                        aria-label={t.fromCurrency}
                      />
                      <div className="relative">
                        <div
                          onClick={handleFromDropdownClick}
                          className={`currency-label currency-select ${fromDropdownOpen ? 'dropdown-open' : ''}`}
                          aria-label="From Currency"
                        >
                          {fromCurrency}
                        </div>
                        {fromDropdownOpen && (
                          <div className="dropdown-options absolute top-full z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                            {getOrderedCurrencies(toCurrency, fromCurrency).map((currency) => (
                              <div
                                key={currency.code}
                                onClick={() => {
                                  handleFromCurrencyChange(currency.code);
                                  setFromDropdownOpen(false);
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-normal ${currency.code === fromCurrency ? 'selected' : ''
                                  }`}
                              >
                                {currency.code}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Swap Button - Centered on Mobile, Between inputs on Desktop */}
                  <div className="flex-shrink-0 order-2 lg:order-2 flex justify-center lg:justify-center">
                    <button
                      onClick={handleSwapCurrencies}
                      className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
                      aria-label={t.swap}
                      title={t.swap}
                    >
                      <Suspense fallback={<div className="w-4 h-4 sm:w-5 sm:h-5" />}>
                        <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 rotate-90" />
                      </Suspense>
                    </button>
                  </div>

                  {/* To Currency Section */}
                  <div className="w-full lg:flex-1 lg:max-w-xs order-3 lg:order-3">
                    <div className="flex items-center space-x-2 sm:space-x-4 bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
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
                        className="currency-input flex-1 border-none outline-none bg-transparent"
                        placeholder={t.enterAmount}
                        aria-label={t.toCurrency}
                      />
                      <div className="relative">
                        <div
                          onClick={handleToDropdownClick}
                          className={`currency-label currency-select ${toDropdownOpen ? 'dropdown-open' : ''}`}
                          aria-label="To Currency"
                        >
                          {toCurrency}
                        </div>
                        {toDropdownOpen && (
                          <div className="dropdown-options absolute top-full z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                            {getOrderedCurrencies(fromCurrency, toCurrency).map((currency) => (
                              <div
                                key={currency.code}
                                onClick={() => {
                                  handleToCurrencyChange(currency.code);
                                  setToDropdownOpen(false);
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-normal ${currency.code === toCurrency ? 'selected' : ''
                                  }`}
                              >
                                {currency.code}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>


                {/* Rate Update Info */}
                {/* <div className="text-center mt-6">
                  <p className="rate-info">
                    {t.lastUpdated} {lastUpdated || t.loading}
                  </p>
                  {rateError && (
                    <p className="rate-info text-error mt-1">
                      Rate error: {rateError}
                    </p>
                  )}
                </div> */}


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
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="footer-text text-center md:text-left" dangerouslySetInnerHTML={{ __html: t.copyright }} />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
              <a href="#" className="footer-link text-center">
                {t.terms}
              </a>
              <a href="#" className="footer-link text-center">
                {t.privacy}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}