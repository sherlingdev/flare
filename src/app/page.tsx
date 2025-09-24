"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUpDown, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { useLanguage } from "../hooks/useLanguage";
import { translations } from "../lib/translations";

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

  const handleThemeToggle = () => {
    console.log('Theme toggle clicked, current theme:', theme);
    toggleTheme();
  };

  const handleLanguageToggle = () => {
    console.log('Language toggle clicked, current language:', language);
    toggleLanguage();
  };

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    // El cálculo automático se encargará de actualizar los montos
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
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
              <Globe className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                {langMounted && language === "en" ? "EN" : "ES"}
              </span>
            </button>
            <button
              onClick={handleThemeToggle}
              className="p-3 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8 flex-1 flex items-center justify-center">
        <div className="max-w-7xl mx-auto w-full">
          {/* Space for top banner ads */}
          <div className="mb-8">
            {/* Top banner ad space */}
          </div>

          {/* Currency Exchange Card - Centered with ad space */}
          <div className="flex justify-center items-center">
            {/* Left sidebar ad space */}
            <div className="hidden lg:block w-48 mr-8">
              {/* Left sidebar ad space */}
            </div>

            <div className="w-full max-w-6xl flex justify-center">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full">
                {/* Exchange Form - Clean Horizontal Layout */}
                <div className="flex items-center justify-between space-x-8">
                  {/* From Currency Section */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                        <input
                          ref={fromAmountRef}
                          type="text"
                          value={fromAmountDisplay}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === "0") {
                              setFromAmountDisplay("1.00");
                            } else {
                              // Permitir escribir libremente
                              setFromAmountDisplay(value);
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === "0") {
                              setFromAmountDisplay("1.00");
                            } else {
                              // Formatear al salir solo si es un número válido
                              const num = parseFloat(value);
                              if (!isNaN(num) && num > 0) {
                                // Si el valor original tenía decimales, mantenerlos
                                if (value.includes('.')) {
                                  const parts = value.split('.');
                                  const integerPart = parts[0];
                                  const decimalPart = parts[1] || '00';

                                  // Solo formatear con comas si la parte entera es >= 1000
                                  if (parseFloat(integerPart) >= 1000) {
                                    const formattedInteger = parseFloat(integerPart).toLocaleString('en-US');
                                    setFromAmountDisplay(`${formattedInteger}.${decimalPart}`);
                                  } else {
                                    // Para números pequeños, mantener el formato original
                                    setFromAmountDisplay(`${integerPart}.${decimalPart}`);
                                  }
                                } else {
                                  // Si no tenía decimales, agregar .00
                                  const formatted = num.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  });
                                  setFromAmountDisplay(formatted);
                                }
                              }
                            }
                          }}
                          onClick={(e) => {
                            e.currentTarget.select();
                          }}
                          onFocus={(e) => {
                            e.currentTarget.select();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="flex-1 text-2xl font-medium text-gray-900 dark:text-white border-none outline-none bg-transparent"
                          placeholder="1"
                        />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Swap Button - Horizontal Arrows */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <button
                      onClick={handleSwapCurrencies}
                      className="p-4 bg-gray-100 dark:bg-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <ArrowUpDown className="w-6 h-6 text-gray-600 dark:text-gray-300 rotate-90" />
                    </button>
                  </div>

                  {/* To Currency Section */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                        <input
                          ref={toAmountRef}
                          type="text"
                          value={toAmountDisplay}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Permitir escribir libremente
                            setToAmountDisplay(value);
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            // Formatear al salir solo si es un número válido
                            const num = parseFloat(value);
                            if (!isNaN(num) && num > 0) {
                              // Si el valor original tenía decimales, mantenerlos
                              if (value.includes('.')) {
                                const parts = value.split('.');
                                const integerPart = parts[0];
                                const decimalPart = parts[1] || '00';

                                // Solo formatear con comas si la parte entera es >= 1000
                                if (parseFloat(integerPart) >= 1000) {
                                  const formattedInteger = parseFloat(integerPart).toLocaleString('en-US');
                                  setToAmountDisplay(`${formattedInteger}.${decimalPart}`);
                                } else {
                                  // Para números pequeños, mantener el formato original
                                  setToAmountDisplay(`${integerPart}.${decimalPart}`);
                                }
                              } else {
                                // Si no tenía decimales, agregar .00
                                const formatted = num.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                });
                                setToAmountDisplay(formatted);
                              }
                            }
                          }}
                          onClick={(e) => {
                            e.currentTarget.select();
                          }}
                          onFocus={(e) => {
                            e.currentTarget.select();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="flex-1 text-2xl font-medium text-gray-900 dark:text-white border-none outline-none bg-transparent"
                          placeholder="62.00"
                        />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          DOP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Exchange Info */}
                <div className="flex justify-between items-center pt-8 mt-10">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">You could save vs banks</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">$15.50 USD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Should arrive</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">by December 14th</p>
                  </div>
                </div>

                {/* Rate Update Info */}
                <div className="text-center mt-6">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Last updated: {lastUpdated || "Loading..."}
                  </p>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex space-x-6 pt-8">
                  <button className="flex-1 text-indigo-600 dark:text-indigo-400 font-semibold py-4 text-lg hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    Compare Price
                  </button>
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    Get Started
                  </button>
                </div>
              </div>
            </div>

            {/* Right sidebar ad space */}
            <div className="hidden lg:block w-48 ml-8">
              {/* Right sidebar ad space */}
            </div>
          </div>

          {/* Space for bottom banner ads */}
          <div className="mt-8">
            {/* Bottom banner ad space */}
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