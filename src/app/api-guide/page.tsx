// "use client";

// import { useLanguage } from '../../contexts/LanguageContext';
// import { translations } from '../../lib/translations';

// export default function ApiGuide() {
//     const { language, mounted } = useLanguage();
//     const t = translations[mounted ? language : "en"];

//     return (
//         <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-16 pb-16">
//             <div className="w-full flex flex-col justify-center items-center">
//                 <div className="w-full max-w-6xl">
//                     <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 lg:px-10 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50">

//                         <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">
//                             {t.apiGuideTitle}
//                         </h1>

//                         <div className="prose prose-slate dark:prose-invert max-w-none text-base">

//                             <section className="mb-8">
//                                 <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
//                                     {t.exchangeRateApis}
//                                 </h2>
//                                 <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
//                                     {t.exchangeRateApisText}
//                                 </p>

//                                 {/* Complete Data - Exchange Rates */}
//                                 <div className="bg-white dark:bg-slate-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
//                                     <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
//                                         {t.completeDataInfo}
//                                     </h3>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <code className="text-blue-600 dark:text-blue-400 text-sm font-mono">
//                                             GET /api/api-guide
//                                         </code>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-gray-300 dark:text-gray-200">
//                                             <strong className="text-blue-500 dark:text-blue-400">{t.description}:</strong> <span className="text-gray-400 dark:text-gray-300">{t.completeDataDesc}</span>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-gray-300 dark:text-gray-200">
//                                             <strong className="text-blue-500 dark:text-blue-400">{t.response}:</strong>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <pre className="text-gray-100 dark:text-gray-200 text-sm whitespace-pre-wrap break-words font-mono">
//                                             {`{
//   "success": true,
//   "data": {
//     "usd": {
//       "currency": "USD",
//       "buy": 62.64,
//       "sell": 63.84,
//       "variation": 0.02,
//       "spread": 1.19
//     },
//     "eur": {
//       "currency": "EUR",
//       "buy": 71.95,
//       "sell": 75.95,
//       "variation": 0.06,
//       "spread": 4.00
//     }
//   },
//   "lastUpdated": "2025-10-16T17:32:34.661Z",
//   "globalRates": {
//     "USD-DOP": 62.64,
//     "EUR-DOP": 71.95,
//     "USD-EUR": 0.87,
//     "EUR-USD": 1.15,
//     "DOP-USD": 0.02,
//     "DOP-EUR": 0.01
//   }
// }`}
//                                         </pre>
//                                     </div>
//                                 </div>

//                                 {/* Only Global Rates */}
//                                 <div className="bg-white dark:bg-slate-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
//                                     <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
//                                         2. {t.onlyGlobalRates}
//                                     </h3>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <code className="text-blue-600 dark:text-blue-400 text-sm font-mono">
//                                             GET /api/api-guide?action=rates
//                                         </code>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-slate-300">
//                                             <strong className="text-blue-400">{t.description}:</strong> <span className="text-slate-300">{t.onlyGlobalRatesDesc}</span>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-gray-300 dark:text-gray-200">
//                                             <strong className="text-blue-500 dark:text-blue-400">{t.response}:</strong>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-800/80 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-600/40">
//                                         <pre className="text-gray-100 dark:text-gray-200 text-sm whitespace-pre-wrap break-words font-mono">
//                                             {`{
//   "success": true,
//   "data": {
//     "USD-DOP": 62.64,
//     "EUR-DOP": 71.95,
//     "USD-EUR": 0.87,
//     "EUR-USD": 1.15,
//     "DOP-USD": 0.02,
//     "DOP-EUR": 0.01
//   },
//   "lastUpdated": "2025-10-16T17:32:34.661Z"
// }`}
//                                         </pre>
//                                     </div>
//                                 </div>

//                                 {/* Only USD Data */}
//                                 <div className="bg-white dark:bg-slate-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
//                                     <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
//                                         3. {t.onlyUsdData}
//                                     </h3>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <code className="text-blue-600 dark:text-blue-400 text-sm font-mono">
//                                             GET /api/api-guide?currency=usd
//                                         </code>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-slate-300">
//                                             <strong className="text-blue-400">{t.description}:</strong> <span className="text-slate-300">{t.onlyUsdDataDesc}</span>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-gray-300 dark:text-gray-200">
//                                             <strong className="text-blue-500 dark:text-blue-400">{t.response}:</strong>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-800/80 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-600/40">
//                                         <pre className="text-gray-100 dark:text-gray-200 text-sm whitespace-pre-wrap break-words font-mono">
//                                             {`{
//   "success": true,
//   "data": {
//     "usd": {
//       "currency": "USD",
//       "buy": 62.64,
//       "sell": 63.84,
//       "variation": 0.02,
//       "spread": 1.19
//     }
//   },
//   "lastUpdated": "2025-10-16T17:32:34.661Z"
// }`}
//                                         </pre>
//                                     </div>
//                                 </div>
//                             </section>

//                             {/* Only EUR Data */}
//                             <section className="mb-8">
//                                 <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
//                                     <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
//                                         4. {t.onlyEurData}
//                                     </h3>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <code className="text-blue-600 dark:text-blue-400 text-sm font-mono">
//                                             GET /api/api-guide?currency=eur
//                                         </code>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-slate-300">
//                                             <strong className="text-blue-400">{t.description}:</strong> <span className="text-slate-300">{t.onlyEurDataDesc}</span>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-gray-300 dark:text-gray-200">
//                                             <strong className="text-blue-500 dark:text-blue-400">{t.response}:</strong>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-800/80 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-600/40">
//                                         <pre className="text-gray-100 dark:text-gray-200 text-sm whitespace-pre-wrap break-words font-mono">
//                                             {`{
//   "success": true,
//   "data": {
//     "eur": {
//       "currency": "EUR",
//       "buy": 71.95,
//       "sell": 75.95,
//       "variation": 0.06,
//       "spread": 4.00
//     }
//   },
//   "lastUpdated": "2025-10-16T17:32:34.661Z"
// }`}
//                                         </pre>
//                                     </div>
//                                 </div>

//                                 {/* Convert Currency */}
//                                 <div className="bg-white dark:bg-slate-800/90 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600/50 shadow-sm dark:shadow-slate-900/20">
//                                     <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
//                                         5. {t.convertCurrency}
//                                     </h3>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <code className="text-blue-600 dark:text-blue-400 text-sm font-mono">
//                                             POST /api/convert-currency
//                                         </code>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-slate-300">
//                                             <strong className="text-blue-400">{t.description}:</strong> <span className="text-slate-300">{t.convertCurrencyDesc}</span>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-slate-300">
//                                             <strong className="text-blue-400">{t.requestBody}:</strong>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <pre className="text-indigo-400 text-sm whitespace-pre-wrap break-words">
//                                             {`{
//   "amount": 100,
//   "fromCurrency": "USD",
//   "toCurrency": "DOP"
// }`}
//                                         </pre>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-900 rounded p-3 mb-2 overflow-x-auto border border-gray-700 dark:border-slate-700 shadow-inner">
//                                         <div className="text-sm text-gray-300 dark:text-gray-200">
//                                             <strong className="text-blue-500 dark:text-blue-400">{t.response}:</strong>
//                                         </div>
//                                     </div>
//                                     <div className="bg-gray-900 dark:bg-slate-800/80 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-600/40">
//                                         <pre className="text-gray-100 dark:text-gray-200 text-sm whitespace-pre-wrap break-words font-mono">
//                                             {`{
//   "success": true,
//   "data": {
//     "amount": 100,
//     "fromCurrency": "USD",
//     "toCurrency": "DOP",
//     "convertedAmount": 6265.00,
//     "exchangeRate": 62.64,
//     "timestamp": "2025-10-16T17:32:34.661Z"
//   },
//   "metadata": {
//     "source": "InfoDolar.com.do",
//     "rateType": "buy"
//   }
// }`}
//                                         </pre>
//                                     </div>
//                                 </div>
//                             </section>

//                             {/* Rate Limits */}
//                             <section className="mb-8">
//                                 <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
//                                     {t.rateLimits}
//                                 </h2>
//                                 <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-lg p-4 shadow-sm dark:shadow-blue-900/10">
//                                     <ul className="text-slate-700 dark:text-slate-300 space-y-2">
//                                         <li>• <strong>API requests:</strong> {t.noRateLimiting}</li>
//                                         <li>• <strong>Scraper endpoints:</strong> {t.cachedForOneHour} (3600 seconds)</li>
//                                         <li>• <strong>Data Source:</strong> InfoDolar.com.do scraping</li>
//                                     </ul>
//                                 </div>
//                             </section>

//                             {/* Error Handling */}
//                             <section className="mb-8">
//                                 <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
//                                     {t.errorHandling}
//                                 </h2>
//                                 <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
//                                     {t.errorHandlingText}
//                                 </p>

//                                 <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-lg p-4 shadow-sm dark:shadow-red-900/10">
//                                     <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
//                                         {t.errorResponseExample}
//                                     </h3>
//                                     <div className="bg-gray-900 dark:bg-slate-800/80 rounded p-3 overflow-x-auto border border-gray-700 dark:border-slate-600/40">
//                                         <pre className="text-red-400 dark:text-red-300 text-sm whitespace-pre-wrap break-words">
//                                             {`{
//   "success": false,
//   "error": "Failed to fetch exchange rates from InfoDolar.com.do",
//   "message": "Unable to retrieve current exchange rates. Please try again later."
// }`}
//                                         </pre>
//                                     </div>
//                                 </div>
//                             </section>

//                             {/* SDK Examples */}
//                             <section className="mb-8">
//                                 <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
//                                     {t.sdkExamples}
//                                 </h2>

//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
//                                         <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
//                                             JavaScript/TypeScript
//                                         </h3>
//                                         <div className="bg-slate-900 rounded p-3 overflow-x-auto">
//                                             <pre className="text-indigo-400 text-sm whitespace-pre-wrap break-words">
//                                                 {`// Get complete exchange rate data
// const response = await fetch('/api/api-guide');
// const data = await response.json();

// // Get only global rates
// const ratesResponse = await fetch('/api/api-guide?action=rates');
// const ratesData = await ratesResponse.json();

// // Get only USD data
// const usdResponse = await fetch('/api/api-guide?currency=usd');
// const usdData = await usdResponse.json();

// // Convert currency
// const convertResponse = await fetch('/api/convert-currency', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     amount: 100,
//     fromCurrency: 'USD',
//     toCurrency: 'DOP'
//   })
// });

// `}
//                                             </pre>
//                                         </div>
//                                     </div>

//                                     <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
//                                         <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
//                                             cURL
//                                         </h3>
//                                         <div className="bg-slate-900 rounded p-3 overflow-x-auto">
//                                             <pre className="text-indigo-400 text-sm whitespace-pre-wrap break-words">
//                                                 {`# Get complete data
// curl -X GET https://your-domain.com/api/api-guide

// # Get only global rates
// curl -X GET https://your-domain.com/api/api-guide?action=rates

// # Get only USD data
// curl -X GET https://your-domain.com/api/api-guide?currency=usd

// # Convert currency
// curl -X POST https://your-domain.com/api/convert-currency \\
//   -H "Content-Type: application/json" \\
//   -d '{"amount":100,"fromCurrency":"USD","toCurrency":"DOP"}'

// `}
//                                             </pre>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </section>

//                             {/* Support */}
//                             <section className="text-center">
//                                 <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
//                                     {t.needHelp}
//                                 </h2>
//                                 <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
//                                     {t.needHelpText}
//                                 </p>
//                                 <a
//                                     href={`mailto:${t.contactEmail}`}
//                                     className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//                                 >
//                                     {t.contactUs}
//                                 </a>
//                             </section>

//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </main>
//     );
// }
