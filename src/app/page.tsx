"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { translations } from "../lib/translations";
import { measurePerformance, measureWebVitals } from "../lib/performance";
import AdBanner from "../components/AdBanner";
import AdSidebar from "../components/AdSidebar";

// Lazy load icons for better performance
const ArrowUpDown = lazy(() => import("lucide-react").then(module => ({ default: module.ArrowUpDown })));

export default function Home() {
  const { language, mounted } = useLanguage();
  const t = translations[mounted ? language : "en"];

  const [fromAmountDisplay, setFromAmountDisplay] = useState("1.00");
  const [toAmountDisplay, setToAmountDisplay] = useState("62.24");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("DOP");
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const fromAmountRef = useRef<HTMLInputElement>(null);
  const toAmountRef = useRef<HTMLInputElement>(null);
  const { getRate } = useExchangeRate(fromCurrency, toCurrency);

  // Update page title dynamically - useLayoutEffect to prevent static title flash
  useLayoutEffect(() => {
    document.title = t.pageTitle;
  }, [t.pageTitle]);

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


  return (
    <main className="relative z-10 w-full animate-fade-in">
      <div className="w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">

        {/* Top Banner Ad */}
        <div className="mb-4">
          <AdBanner className="mx-auto" position="top" />
        </div>

        {/* Currency Exchange Card - Responsive Layout */}
        <div className="flex flex-col lg:flex-row justify-center items-center lg:space-x-8 space-y-4 lg:space-y-0">
          {/* Left Sidebar Ad */}
          <div className="hidden lg:block">
            <AdSidebar position="left" />
          </div>

          <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
            <div className="currency-converter-card bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50 animate-scale-in">
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


            </div>
          </div>

          <div className="hidden lg:block">
            <AdSidebar position="right" />
          </div>
        </div>

        <div className="mt-4">
          <AdBanner className="mx-auto" position="bottom" />
        </div>
      </div>
    </main>
  );
}