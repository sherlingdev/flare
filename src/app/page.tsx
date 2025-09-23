"use client";

import { useState } from "react";
import { ArrowUpDown, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { useLanguage } from "../hooks/useLanguage";
import { translations } from "../lib/translations";

export default function Home() {
  const [fromAmount, setFromAmount] = useState("1,000.00");
  const [toAmount, setToAmount] = useState("58,500.00");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("DOP");
  const { theme, toggleTheme, mounted } = useTheme();
  const { language, toggleLanguage, mounted: langMounted } = useLanguage();
  const t = translations[language];

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
    const tempAmount = fromAmount;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
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

            <div className="w-full max-w-4xl flex justify-center">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 w-full max-w-2xl">
                {/* Exchange Form - Horizontal Layout */}
                <div className="flex items-center justify-between space-x-6">
                  {/* You Send Section */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="w-full text-3xl font-bold text-gray-900 dark:text-white border-none outline-none bg-transparent"
                      />
                      <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                        <span className="text-2xl">🇺🇸</span>
                        <select
                          value={fromCurrency}
                          onChange={(e) => setFromCurrency(e.target.value)}
                          className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none"
                        >
                          <option value="USD">USD</option>
                          <option value="DOP">DOP</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Swap Button - Centered with proper arrows */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <button
                      onClick={handleSwapCurrencies}
                      className="p-4 bg-gray-100 dark:bg-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      <ArrowUpDown className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Recipient Gets Section */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={toAmount}
                        onChange={(e) => setToAmount(e.target.value)}
                        className="w-full text-3xl font-bold text-gray-900 dark:text-white border-none outline-none bg-transparent"
                      />
                      <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                        <span className="text-2xl">🇩🇴</span>
                        <select
                          value={toCurrency}
                          onChange={(e) => setToCurrency(e.target.value)}
                          className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none"
                        >
                          <option value="DOP">DOP</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Info */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-600 mt-8">
                  <div className="text-left">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t.youCouldSave}</p>
                    <p className="text-lg font-semibold text-green-600">$15.50 USD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t.shouldArrive}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">December 14th</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button className="flex-1 text-indigo-600 dark:text-indigo-400 font-medium py-3 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    {t.comparePrice}
                  </button>
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    {t.getStarted}
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