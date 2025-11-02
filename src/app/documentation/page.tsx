"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import CopyButton from "@/components/CopyButton";

export default function Documentation() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'getAllRates': true,
        'getRateByCode': false,
        'convertCurrency': false,
        'getAllCurrencies': false,
        'getHistoricalRates': false,
        'authentication': false,
        'rateLimitExceeded': false,
        'errorResponse': false,
        'javascriptTypescript': false,
        'curl': false,
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => {
            // For SDK examples, allow multiple sections open at once
            if (section === 'javascriptTypescript' || section === 'curl') {
                return {
                    ...prev,
                    [section]: !prev[section]
                };
            }
            // Accordion behavior: close all others, toggle the selected one
            const newState: Record<string, boolean> = {};
            Object.keys(prev).forEach(key => {
                newState[key] = false;
            });
            // If the section is already open, close it; otherwise, open it
            newState[section] = !prev[section];
            return newState;
        });
    };

    // Scroll to top on mount and prevent scroll restoration
    useEffect(() => {
        // Force scroll to top immediately
        window.scrollTo(0, 0);

        // Disable scroll restoration temporarily
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // Additional scroll to top after a brief delay to override any restoration
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);

        // Force scroll again after a longer delay to ensure it sticks
        const timer2 = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
            // Re-enable scroll restoration when component unmounts
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        };
    }, []);

    return (
        <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-16 pb-16">
            <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full max-w-6xl">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 lg:px-10 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50">

                        <h1 className="text-2xl sm:text-3xl font-bold text-flare-primary mb-4 text-center">
                            {t.documentation}
                        </h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-base">

                            <section className="mb-4">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.exchangeRateApis}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.exchangeRateApisText}
                                </p>

                                {/* Get All Rates */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.getAllRates ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('getAllRates')}>
                                        <h3 className="text-lg font-medium text-flare-primary">
                                            {t.getAllRates}
                                        </h3>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.getAllRates ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.getAllRates ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    GET /api/rates
                                                </code>
                                                <CopyButton textToCopy="GET /api/rates" />
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <div className="text-base text-gray-200">
                                                    <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.getAllRatesDesc}</span>
                                                </div>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    {t.response}:
                                                </code>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words font-mono">
                                                    {`{
  "success": true,
  "data": [
    {
      "currency_id": 1,
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "rate": 62.64,
      "updated_at": "2025-10-16T17:32:34.661Z"
    },
    {
      "currency_id": 2,
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "rate": 71.95,
      "updated_at": "2025-10-16T17:32:34.661Z"
    }
  ],
  "count": 150,
  "timestamp": "2025-10-16T17:32:34.661Z"
}`}
                                                </pre>
                                                <CopyButton textToCopy={`{
  "success": true,
  "data": [
    {
      "currency_id": 1,
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "rate": 62.64,
      "updated_at": "2025-10-16T17:32:34.661Z"
    },
    {
      "currency_id": 2,
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "rate": 71.95,
      "updated_at": "2025-10-16T17:32:34.661Z"
    }
  ],
  "count": 150,
  "timestamp": "2025-10-16T17:32:34.661Z"
}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Get Rate by Code */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.getRateByCode ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('getRateByCode')}>
                                        <h3 className="text-lg font-medium text-flare-primary">
                                            {t.getRateByCode}
                                        </h3>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.getRateByCode ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.getRateByCode ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    GET /api/rates/USD
                                                </code>
                                                <CopyButton textToCopy="GET /api/rates/USD" />
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <div className="text-base text-gray-200">
                                                    <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.getRateByCodeDesc}</span>
                                                </div>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    {t.response}:
                                                </code>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words font-mono">
                                                    {`{
  "success": true,
  "data": {
    "currency_id": 1,
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$",
    "rate": 62.64,
    "updated_at": "2025-10-16T17:32:34.661Z"
  },
  "timestamp": "2025-10-16T17:32:34.661Z"
}`}
                                                </pre>
                                                <CopyButton textToCopy={`{
  "success": true,
  "data": {
    "currency_id": 1,
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$",
    "rate": 62.64,
    "updated_at": "2025-10-16T17:32:34.661Z"
  },
  "timestamp": "2025-10-16T17:32:34.661Z"
}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Convert Currency */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.convertCurrency ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('convertCurrency')}>
                                        <h3 className="text-lg font-medium text-flare-primary">
                                            {t.convertCurrency}
                                        </h3>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.convertCurrency ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.convertCurrency ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    GET /api/rates/convert?from=USD&to=EUR&amount=100
                                                </code>
                                                <CopyButton textToCopy="GET /api/rates/convert?from=USD&to=EUR&amount=100" />
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <div className="text-base text-gray-200">
                                                    <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.convertCurrencyDesc}</span>
                                                </div>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    {t.queryParams}:
                                                </code>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <div className="text-base text-gray-200">
                                                    <div className="mb-1">• <code>{t.queryParamFrom}</code></div>
                                                    <div className="mb-1">• <code>{t.queryParamTo}</code></div>
                                                    <div>• <code>{t.queryParamAmount}</code></div>
                                                </div>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    {t.response}:
                                                </code>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words font-mono">
                                                    {`{
  "success": true,
  "data": {
    "from": {
      "code": "USD",
      "amount": 100
    },
    "to": {
      "code": "EUR",
      "amount": 87.25
    },
    "rate": 0.8725,
    "timestamp": "2025-10-16T17:32:34.661Z"
  }
}`}
                                                </pre>
                                                <CopyButton textToCopy={`{
  "success": true,
  "data": {
    "from": {
      "code": "USD",
      "amount": 100
    },
    "to": {
      "code": "EUR",
      "amount": 87.25
    },
    "rate": 0.8725,
    "timestamp": "2025-10-16T17:32:34.661Z"
  }
}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Get All Currencies */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.getAllCurrencies ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('getAllCurrencies')}>
                                        <h3 className="text-lg font-medium text-flare-primary">
                                            {t.getAllCurrencies}
                                        </h3>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.getAllCurrencies ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.getAllCurrencies ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    GET /api/currencies
                                                </code>
                                                <CopyButton textToCopy="GET /api/currencies" />
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <div className="text-base text-gray-200">
                                                    <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.getAllCurrenciesDesc}</span>
                                                </div>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    {t.response}:
                                                </code>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words font-mono">
                                                    {`{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "is_active": true
    },
    {
      "id": 2,
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "is_active": true
    }
  ],
  "count": 150,
  "timestamp": "2025-10-16T17:32:34.661Z"
}`}
                                                </pre>
                                                <CopyButton textToCopy={`{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "is_active": true
    },
    {
      "id": 2,
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "is_active": true
    }
  ],
  "count": 150,
  "timestamp": "2025-10-16T17:32:34.661Z"
}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Get Historical Rates */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.getHistoricalRates ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('getHistoricalRates')}>
                                        <h3 className="text-lg font-medium text-flare-primary">
                                            {t.getHistoricalRates}
                                        </h3>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.getHistoricalRates ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.getHistoricalRates ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    GET /api/historical/USD?days=30
                                                </code>
                                                <CopyButton textToCopy="GET /api/historical/USD?days=30" />
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <div className="text-base text-gray-200">
                                                    <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.getHistoricalRatesDesc}</span>
                                                </div>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    {t.queryParams}:
                                                </code>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <div className="text-base text-gray-200">
                                                    <div className="mb-1">• <code>{t.queryParamDays}</code></div>
                                                    <div>• <code>{t.queryParamDate}</code></div>
                                                </div>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <code className="text-gray-200 text-base font-mono">
                                                    {t.response}:
                                                </code>
                                            </div>
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words font-mono">
                                                    {`{
  "success": true,
  "data": {
    "currency": {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$"
    },
    "rates": [
      {
        "id": 1,
        "rate": 62.64,
        "date": "2025-10-16",
        "created_at": "2025-10-16T17:32:34.661Z"
      },
      {
        "id": 2,
        "rate": 62.50,
        "date": "2025-10-15",
        "created_at": "2025-10-15T17:32:34.661Z"
      }
    ],
    "count": 30
  },
  "timestamp": "2025-10-16T17:32:34.661Z"
}`}
                                                </pre>
                                                <CopyButton textToCopy={`{
  "success": true,
  "data": {
    "currency": {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$"
    },
    "rates": [
      {
        "id": 1,
        "rate": 62.64,
        "date": "2025-10-16",
        "created_at": "2025-10-16T17:32:34.661Z"
      },
      {
        "id": 2,
        "rate": 62.50,
        "date": "2025-10-15",
        "created_at": "2025-10-15T17:32:34.661Z"
      }
    ],
    "count": 30
  },
  "timestamp": "2025-10-16T17:32:34.661Z"
}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Rate Limits */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.rateLimits}
                                </h2>
                                <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-lg p-4 shadow-sm dark:shadow-blue-900/10">
                                    <ul className="text-slate-700 dark:text-gray-200 space-y-2">
                                        <li>• <strong>{t.unauthenticatedRequests}:</strong> {t.rateLimitUnauth}</li>
                                        <li>• <strong>{t.authenticatedRequests}:</strong> {t.rateLimitAuth}</li>
                                        <li>• <strong>{t.cacheDuration}:</strong> {t.cachedForOneHour}</li>
                                        <li>• <strong>{t.dataSource}:</strong> {t.dataSourceText}</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Rate Limit Headers */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.rateLimitHeaders}
                                </h2>
                                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                                    <p className="text-base text-slate-700 dark:text-gray-200 mb-4">
                                        {t.rateLimitHeadersText}
                                    </p>
                                    <ul className="text-base text-slate-700 dark:text-gray-200 space-y-2 mb-4">
                                        <li>• <code className="text-base text-gray-200 bg-gray-800 dark:bg-gray-900 px-2 py-1 rounded">X-RateLimit-Limit</code> - {t.maxRequestsAllowed}</li>
                                        <li>• <code className="text-base text-gray-200 bg-gray-800 dark:bg-gray-900 px-2 py-1 rounded">X-RateLimit-Remaining</code> - {t.requestsRemaining}</li>
                                        <li>• <code className="text-base text-gray-200 bg-gray-800 dark:bg-gray-900 px-2 py-1 rounded">X-RateLimit-Reset</code> - {t.timestampReset}</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Rate Limit Exceeded */}
                            <section className="mb-4">
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.rateLimitExceeded ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('rateLimitExceeded')}>
                                        <h2 className="text-lg font-semibold text-flare-primary">
                                            {t.rateLimitExceeded}
                                        </h2>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.rateLimitExceeded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.rateLimitExceeded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words">
                                                    {`{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 1 request per minute. Get an API key for higher limits.",
  "rateLimit": {
    "limit": 1,
    "remaining": 0,
    "reset": "2025-10-16T17:33:00.000Z"
  },
  "getApiKey": "https://flarexrate.com/key"
}`}
                                                </pre>
                                                <CopyButton textToCopy={`{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 1 request per minute. Get an API key for higher limits.",
  "rateLimit": {
    "limit": 1,
    "remaining": 0,
    "reset": "2025-10-16T17:33:00.000Z"
  },
  "getApiKey": "https://flarexrate.com/key"
}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Authentication */}
                            <section className="mb-4">
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.authentication ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('authentication')}>
                                        <h2 className="text-lg font-semibold text-flare-primary">
                                            {t.authentication}
                                        </h2>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.authentication ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.authentication ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                                                <p className="text-slate-700 dark:text-gray-200 mb-4">
                                                    {t.authenticationText}
                                                </p>
                                                <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                    <code className="text-gray-200 text-base font-mono">
                                                        {t.headerApiKey}
                                                    </code>
                                                    <CopyButton textToCopy="X-API-Key: your-api-key-here" />
                                                </div>
                                                <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                    <code className="text-gray-200 text-base font-mono">
                                                        {t.authorizationBearer}
                                                    </code>
                                                    <CopyButton textToCopy="Authorization: Bearer: your-api-key-here" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Error Response */}
                            <section className="mb-4">
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.errorResponse ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('errorResponse')}>
                                        <h2 className="text-lg font-semibold text-flare-primary">
                                            {t.errorResponse}
                                        </h2>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.errorResponse ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.errorResponse ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words">
                                                    {`{
  "success": false,
  "error": "Failed to fetch exchange rates",
  "message": "Unable to retrieve current exchange rates. Please try again later."
}`}
                                                </pre>
                                                <CopyButton textToCopy={`{
  "success": false,
  "error": "Failed to fetch exchange rates",
  "message": "Unable to retrieve current exchange rates. Please try again later."
}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SDK Examples */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.sdkExamples}
                                </h2>

                                {/* JavaScript/TypeScript */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.javascriptTypescript ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('javascriptTypescript')}>
                                        <h3 className="text-lg font-medium text-flare-primary">
                                            {t.javascriptTypescript}
                                        </h3>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.javascriptTypescript ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.javascriptTypescript ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words">
                                                    {`// Get all exchange rates (without API key)
const response = await fetch('/api/rates');
const data = await response.json();

// Get all exchange rates (with API key - higher limits)
const response = await fetch('/api/rates', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
const data = await response.json();

// Get rate for a specific currency
const response = await fetch('/api/rates/USD', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
const data = await response.json();

// Convert currency
const response = await fetch('/api/rates/convert?from=USD&to=EUR&amount=100', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
const data = await response.json();

`}
                                                </pre>
                                                <CopyButton textToCopy={`// Get all exchange rates (without API key)
const response = await fetch('/api/rates');
const data = await response.json();

// Get all exchange rates (with API key - higher limits)
const response = await fetch('/api/rates', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
const data = await response.json();

// Get rate for a specific currency
const response = await fetch('/api/rates/USD', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
const data = await response.json();

// Convert currency
const response = await fetch('/api/rates/convert?from=USD&to=EUR&amount=100', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
const data = await response.json();

`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* cURL */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <div className={`flex items-center justify-between cursor-pointer transition-all duration-500 ${openSections.curl ? 'mb-2' : 'mb-0'}`} onClick={() => toggleSection('curl')}>
                                        <h3 className="text-lg font-medium text-flare-primary">
                                            {t.curl}
                                        </h3>
                                        <svg className={`w-5 h-5 text-flare-primary transition-transform duration-300 ease-in-out ${openSections.curl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.curl ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pt-0">
                                            <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                                <pre className="text-gray-200 text-base whitespace-pre-wrap break-words">
                                                    {`# Get all exchange rates (without API key)
curl -X GET https://your-domain.com/api/rates

# Get all exchange rates (with API key - higher limits)
curl -X GET https://your-domain.com/api/rates \\
  -H "X-API-Key: your-api-key-here"

# Get rate for a specific currency
curl -X GET https://your-domain.com/api/rates/USD \\
  -H "X-API-Key: your-api-key-here"

# Convert currency
curl -X GET "https://your-domain.com/api/rates/convert?from=USD&to=EUR&amount=100" \\
  -H "X-API-Key: your-api-key-here"

# Get all currencies
curl -X GET https://your-domain.com/api/currencies \\
  -H "X-API-Key: your-api-key-here"

# Get historical rates
curl -X GET "https://your-domain.com/api/historical/USD?days=30" \\
  -H "X-API-Key: your-api-key-here"

`}
                                                </pre>
                                                <CopyButton textToCopy={`# Get all exchange rates (without API key)
curl -X GET https://your-domain.com/api/rates

# Get all exchange rates (with API key - higher limits)
curl -X GET https://your-domain.com/api/rates \\
  -H "X-API-Key: your-api-key-here"

# Get rate for a specific currency
curl -X GET https://your-domain.com/api/rates/USD \\
  -H "X-API-Key: your-api-key-here"

# Convert currency
curl -X GET "https://your-domain.com/api/rates/convert?from=USD&to=EUR&amount=100" \\
  -H "X-API-Key: your-api-key-here"

# Get all currencies
curl -X GET https://your-domain.com/api/currencies \\
  -H "X-API-Key: your-api-key-here"

# Get historical rates
curl -X GET "https://your-domain.com/api/historical/USD?days=30" \\
  -H "X-API-Key: your-api-key-here"

`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Support */}
                            <section className="text-center">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.needHelp}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.needHelpText}
                                </p>
                                <a
                                    href={`mailto:${t.contactEmail}`}
                                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-gray-200 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    {t.contactUs}
                                </a>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

