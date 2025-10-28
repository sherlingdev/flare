"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import CopyButton from "@/components/CopyButton";

export default function ApiGuide() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];

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
                            {t.apiGuide}
                        </h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-base">

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.exchangeRateApis}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.exchangeRateApisText}
                                </p>

                                {/* Complete Data - Exchange Rates */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <h3 className="text-lg font-medium text-flare-primary mb-2">
                                        {t.completeDataInfo}
                                    </h3>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <code className="text-gray-200 text-base font-mono">
                                            GET /api/api-guide
                                        </code>
                                        <CopyButton textToCopy="GET /api/api-guide" />
                                    </div>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <code className="text-gray-200 text-base font-mono">
                                            {t.description}:
                                        </code>
                                    </div>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <div className="text-base text-gray-200">
                                            {t.completeDataDesc}
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
    "usd": {
      "currency": "USD",
      "buy": 62.64,
      "sell": 63.84,
      "variation": 0.02,
      "spread": 1.19
    },
    "eur": {
      "currency": "EUR",
      "buy": 71.95,
      "sell": 75.95,
      "variation": 0.06,
      "spread": 4.00
    }
  },
  "lastUpdated": "2025-10-16T17:32:34.661Z",
  "globalRates": {
    "USD-DOP": 62.64,
    "EUR-DOP": 71.95,
    "USD-EUR": 0.87,
    "EUR-USD": 1.15,
    "DOP-USD": 0.02,
    "DOP-EUR": 0.01
  }
}`}
                                        </pre>
                                        <CopyButton textToCopy={`{
  "success": true,
  "data": {
    "usd": {
      "currency": "USD",
      "buy": 62.64,
      "sell": 63.84,
      "variation": 0.02,
      "spread": 1.19
    },
    "eur": {
      "currency": "EUR",
      "buy": 71.95,
      "sell": 75.95,
      "variation": 0.06,
      "spread": 4.00
    }
  },
  "lastUpdated": "2025-10-16T17:32:34.661Z",
  "globalRates": {
    "USD-DOP": 62.64,
    "EUR-DOP": 71.95,
    "USD-EUR": 0.87,
    "EUR-USD": 1.15,
    "DOP-USD": 0.02,
    "DOP-EUR": 0.01
  }
}`} />
                                    </div>
                                </div>

                                {/* Only Global Rates */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <h3 className="text-lg font-medium text-flare-primary mb-2">
                                        {t.onlyGlobalRates}
                                    </h3>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <code className="text-gray-200 text-base font-mono">
                                            GET /api/api-guide?action=rates
                                        </code>
                                        <CopyButton textToCopy="GET /api/api-guide?action=rates" />
                                    </div>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <div className="text-base text-gray-200">
                                            <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.onlyGlobalRatesDesc}</span>
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
    "USD-DOP": 62.64,
    "EUR-DOP": 71.95,
    "USD-EUR": 0.87,
    "EUR-USD": 1.15,
    "DOP-USD": 0.02,
    "DOP-EUR": 0.01
  },
  "lastUpdated": "2025-10-16T17:32:34.661Z"
}`}
                                        </pre>
                                        <CopyButton textToCopy={`{
  "success": true,
  "data": {
    "USD-DOP": 62.64,
    "EUR-DOP": 71.95,
    "USD-EUR": 0.87,
    "EUR-USD": 1.15,
    "DOP-USD": 0.02,
    "DOP-EUR": 0.01
  },
  "lastUpdated": "2025-10-16T17:32:34.661Z"
}`} />
                                    </div>
                                </div>

                                {/* Only USD Data */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <h3 className="text-lg font-medium text-flare-primary mb-2">
                                        {t.onlyUsdData}
                                    </h3>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <code className="text-gray-200 text-base font-mono">
                                            GET /api/api-guide?currency=usd
                                        </code>
                                        <CopyButton textToCopy="GET /api/api-guide?currency=usd" />
                                    </div>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <div className="text-base text-gray-200">
                                            <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.onlyUsdDataDesc}</span>
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
    "usd": {
      "currency": "USD",
      "buy": 62.64,
      "sell": 63.84,
      "variation": 0.02,
      "spread": 1.19
    }
  },
  "lastUpdated": "2025-10-16T17:32:34.661Z"
}`}
                                        </pre>
                                        <CopyButton textToCopy={`{
  "success": true,
  "data": {
    "usd": {
      "currency": "USD",
      "buy": 62.64,
      "sell": 63.84,
      "variation": 0.02,
      "spread": 1.19
    }
  },
  "lastUpdated": "2025-10-16T17:32:34.661Z"
}`} />
                                    </div>
                                </div>
                            </section>

                            {/* Only EUR Data */}
                            <section className="mb-8">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-700">
                                    <h3 className="text-lg font-medium text-flare-primary mb-2">
                                        {t.onlyEurData}
                                    </h3>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <code className="text-gray-200 text-base font-mono">
                                            GET /api/api-guide?currency=eur
                                        </code>
                                        <CopyButton textToCopy="GET /api/api-guide?currency=eur" />
                                    </div>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <div className="text-base text-gray-200">
                                            <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.onlyEurDataDesc}</span>
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
    "eur": {
      "currency": "EUR",
      "buy": 71.95,
      "sell": 75.95,
      "variation": 0.06,
      "spread": 4.00
    }
  },
  "lastUpdated": "2025-10-16T17:32:34.661Z"
}`}
                                        </pre>
                                        <CopyButton textToCopy={`{
  "success": true,
  "data": {
    "eur": {
      "currency": "EUR",
      "buy": 71.95,
      "sell": 75.95,
      "variation": 0.06,
      "spread": 4.00
    }
  },
  "lastUpdated": "2025-10-16T17:32:34.661Z"
}`} />
                                    </div>
                                </div>

                                {/* Convert Currency */}
                                <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
                                    <h3 className="text-lg font-medium text-flare-primary mb-2">
                                        {t.convertCurrency}
                                    </h3>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <code className="text-gray-200 text-base font-mono">
                                            POST /api/convert-currency
                                        </code>
                                        <CopyButton textToCopy="POST /api/convert-currency" />
                                    </div>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <div className="text-base text-gray-200">
                                            <code className="text-gray-200 text-base font-mono">{t.description}:</code> <span className="text-gray-200">{t.convertCurrencyDesc}</span>
                                        </div>
                                    </div>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <code className="text-gray-200 text-base font-mono">
                                            {t.requestBody}:
                                        </code>
                                    </div>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <pre className="text-gray-200 text-base whitespace-pre-wrap break-words">
                                            {`{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "DOP"
}`}
                                        </pre>
                                        <CopyButton textToCopy={`{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "DOP"
}`} />
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
    "amount": 100,
    "fromCurrency": "USD",
    "toCurrency": "DOP",
    "convertedAmount": 6265.00,
    "exchangeRate": 62.64,
    "timestamp": "2025-10-16T17:32:34.661Z"
  },
  "metadata": {
    "source": "InfoDolar.com.do",
    "rateType": "buy"
  }
}`}
                                        </pre>
                                        <CopyButton textToCopy={`{
  "success": true,
  "data": {
    "amount": 100,
    "fromCurrency": "USD",
    "toCurrency": "DOP",
    "convertedAmount": 6265.00,
    "exchangeRate": 62.64,
    "timestamp": "2025-10-16T17:32:34.661Z"
  },
  "metadata": {
    "source": "InfoDolar.com.do",
    "rateType": "buy"
  }
}`} />
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
                                        <li>• <strong>API requests:</strong> {t.noRateLimiting}</li>
                                        <li>• <strong>Scraper endpoints:</strong> {t.cachedForOneHour} (3600 seconds)</li>
                                        <li>• <strong>Data Source:</strong> InfoDolar.com.do scraping</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Error Handling */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.errorHandling}
                                </h2>

                                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                                    <h3 className="text-lg font-medium text-flare-primary mb-3">
                                        {t.errorResponse}
                                    </h3>
                                    <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                        <pre className="text-gray-200 text-base whitespace-pre-wrap break-words">
                                            {`{
  "success": false,
  "error": "Failed to fetch exchange rates from InfoDolar.com.do",
  "message": "Unable to retrieve current exchange rates. Please try again later."
}`}
                                        </pre>
                                        <CopyButton textToCopy={`{
  "success": false,
  "error": "Failed to fetch exchange rates from InfoDolar.com.do",
  "message": "Unable to retrieve current exchange rates. Please try again later."
}`} />
                                    </div>
                                </div>
                            </section>

                            {/* SDK Examples */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.sdkExamples}
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                                        <h3 className="text-lg font-medium text-flare-primary mb-3">
                                            JavaScript/TypeScript
                                        </h3>
                                        <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                            <pre className="text-gray-200 text-base whitespace-pre-wrap break-words">
                                                {`// Get complete exchange rate data
const response = await fetch('/api/api-guide');
const data = await response.json();

// Get only global rates
const ratesResponse = await fetch('/api/api-guide?action=rates');
const ratesData = await ratesResponse.json();

// Get only USD data
const usdResponse = await fetch('/api/api-guide?currency=usd');
const usdData = await usdResponse.json();

// Convert currency
const convertResponse = await fetch('/api/convert-currency', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100,
    fromCurrency: 'USD',
    toCurrency: 'DOP'
  })
});

`}
                                            </pre>
                                            <CopyButton textToCopy={`// Get complete exchange rate data
const response = await fetch('/api/api-guide');
const data = await response.json();

// Get only global rates
const ratesResponse = await fetch('/api/api-guide?action=rates');
const ratesData = await ratesResponse.json();

// Get only USD data
const usdResponse = await fetch('/api/api-guide?currency=usd');
const usdData = await usdResponse.json();

// Convert currency
const convertResponse = await fetch('/api/convert-currency', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100,
    fromCurrency: 'USD',
    toCurrency: 'DOP'
  })
});

`} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                                        <h3 className="text-lg font-medium text-flare-primary mb-3">
                                            cURL
                                        </h3>
                                        <div className="relative bg-gray-900 dark:bg-slate-900 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
                                            <pre className="text-gray-200 text-base whitespace-pre-wrap break-words">
                                                {`# Get complete data
curl -X GET https://your-domain.com/api/api-guide

# Get only global rates
curl -X GET https://your-domain.com/api/api-guide?action=rates

# Get only USD data
curl -X GET https://your-domain.com/api/api-guide?currency=usd

# Convert currency
curl -X POST https://your-domain.com/api/convert-currency \\
  -H "Content-Type: application/json" \\
  -d '{"amount":100,"fromCurrency":"USD","toCurrency":"DOP"}'

`}
                                            </pre>
                                            <CopyButton textToCopy={`# Get complete data
curl -X GET https://your-domain.com/api/api-guide

# Get only global rates
curl -X GET https://your-domain.com/api/api-guide?action=rates

# Get only USD data
curl -X GET https://your-domain.com/api/api-guide?currency=usd

# Convert currency
curl -X POST https://your-domain.com/api/convert-currency \\
  -H "Content-Type: application/json" \\
  -d '{"amount":100,"fromCurrency":"USD","toCurrency":"DOP"}'

`} />
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

