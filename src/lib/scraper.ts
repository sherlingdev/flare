// Simplified exchange rate management system for InfoDolar.com.do

// =============================================================================
// CONFIGURATION
// =============================================================================

interface RateConfig {
    usdRateUrl: string;
    eurRateUrl: string;
    localRates: Record<string, number>;
    cacheDuration: number;
    scrapingTimeout: number;
    sourceName: string;
    sourceDescription: string;
}

const rateConfig: RateConfig = {
    // Primary rate source URLs
    usdRateUrl: process.env.NEXT_PUBLIC_USD_RATE_URL || 'https://www.infodolar.com.do/precio-dolar.aspx',
    eurRateUrl: process.env.NEXT_PUBLIC_EUR_RATE_URL || 'https://www.infodolar.com.do/precio-euro.aspx',

    // Local base exchange rates (using BUY prices for currency conversion)
    localRates: {
        'USD-DOP': 63.38,
        'EUR-DOP': 73.94,
        'USD-EUR': 0.857,
        'EUR-USD': 1.167,
        'DOP-USD': 0.0158,
        'DOP-EUR': 0.0135,
        // CAD rates
        'CAD-DOP': 45.24,
        'DOP-CAD': 0.022,
        'CAD-USD': 0.72,
        'USD-CAD': 1.39,
        'CAD-EUR': 0.61,
        'EUR-CAD': 1.63,
        // GBP rates
        'GBP-DOP': 85.15,
        'DOP-GBP': 0.0117,
        'GBP-USD': 1.34,
        'USD-GBP': 0.74,
        'GBP-EUR': 1.15,
        'EUR-GBP': 0.87,
        // MXN rates
        'MXN-DOP': 3.45,
        'DOP-MXN': 0.29,
        'MXN-USD': 0.054,
        'USD-MXN': 18.37,
        'MXN-EUR': 0.047,
        'EUR-MXN': 21.43,
        // Cross rates between new currencies
        'GBP-CAD': 1.88,
        'CAD-GBP': 0.53,
        'GBP-MXN': 24.68,
        'MXN-GBP': 0.041,
        'CAD-MXN': 13.11,
        'MXN-CAD': 0.076
    },

    // Rate update configuration
    cacheDuration: parseInt(process.env.NEXT_PUBLIC_RATE_CACHE_DURATION || '86400000'), // 24 hours
    scrapingTimeout: parseInt(process.env.NEXT_PUBLIC_SCRAPING_TIMEOUT || '10000'), // 10 seconds

    // Rate source configuration
    sourceName: process.env.NEXT_PUBLIC_RATE_SOURCE_NAME || 'InfoDolar.com.do',
    sourceDescription: process.env.NEXT_PUBLIC_RATE_SOURCE_DESCRIPTION || 'Dominican Republic Exchange Rates'
};

// =============================================================================
// INTERFACES
// =============================================================================

interface ExchangeRate {
    currency: string;
    buy: number;
    sell: number;
    variation: string;
    spread: number;
    timestamp: string;
}

interface ScrapedData {
    usd: ExchangeRate;
    eur: ExchangeRate;
}

interface CachedExchangeRates extends ScrapedData {
    scrapedAt: string;
    timeUntilExpiry: number;
    source: string;
    isFromCache: boolean;
    cacheStatus: string;
}

// =============================================================================
// LOCAL RATE MANAGEMENT
// =============================================================================

// Single global structure that stores everything
const globalRates = {
    usd: {
        buy: 63.38,
        sell: 64.50,
        variation: 0.02,
        spread: 1.12
    },
    eur: {
        buy: 73.94,
        sell: 77.50,
        variation: 0.06,
        spread: 3.56
    },
    cad: {
        buy: 45.24,
        sell: 46.00,
        variation: 0.02,
        spread: 0.76
    },
    gbp: {
        buy: 85.15,
        sell: 87.00,
        variation: 0.03,
        spread: 1.85
    },
    mxn: {
        buy: 3.45,
        sell: 3.55,
        variation: 0.01,
        spread: 0.10
    },
    lastUpdated: new Date().toISOString(),
    // Derived rates for currency conversion
    'USD-DOP': 63.38,
    'EUR-DOP': 73.94,
    'USD-EUR': 0.857,
    'EUR-USD': 1.167,
    'DOP-USD': 0.0158,
    'DOP-EUR': 0.0135,
    // CAD rates
    'CAD-DOP': 45.24,
    'DOP-CAD': 0.022,
    'CAD-USD': 0.72,
    'USD-CAD': 1.39,
    'CAD-EUR': 0.61,
    'EUR-CAD': 1.63,
    // GBP rates
    'GBP-DOP': 85.15,
    'DOP-GBP': 0.0117,
    'GBP-USD': 1.34,
    'USD-GBP': 0.74,
    'GBP-EUR': 1.15,
    'EUR-GBP': 0.87,
    // MXN rates
    'MXN-DOP': 3.45,
    'DOP-MXN': 0.29,
    'MXN-USD': 0.054,
    'USD-MXN': 18.37,
    'MXN-EUR': 0.047,
    'EUR-MXN': 21.43,
    // Cross rates between new currencies
    'GBP-CAD': 1.88,
    'CAD-GBP': 0.53,
    'GBP-MXN': 24.68,
    'MXN-GBP': 0.041,
    'CAD-MXN': 13.11,
    'MXN-CAD': 0.076
};

/**
 * Update rates directly when scraper executes
 */
export function updateRates(usdBuy: number, usdSell: number, eurBuy: number, eurSell: number, timestamp?: string): void {
    // Update USD data
    globalRates.usd.buy = usdBuy;
    globalRates.usd.sell = usdSell;
    globalRates.usd.spread = usdSell - usdBuy;

    // Update EUR data
    globalRates.eur.buy = eurBuy;
    globalRates.eur.sell = eurSell;
    globalRates.eur.spread = eurSell - eurBuy;

    // Update lastUpdated timestamp
    globalRates.lastUpdated = timestamp || new Date().toISOString();

    // Update derived rates for currency conversion (using BUY prices)
    globalRates['USD-DOP'] = usdBuy;
    globalRates['EUR-DOP'] = eurBuy;
    globalRates['USD-EUR'] = usdBuy / eurBuy;
    globalRates['EUR-USD'] = eurBuy / usdBuy;
    globalRates['DOP-USD'] = 1 / usdBuy;
    globalRates['DOP-EUR'] = 1 / eurBuy;

}

/**
 * Get current rates
 */
export function getCurrentRates(): Record<string, number> {
    return {
        'USD-DOP': globalRates['USD-DOP'],
        'EUR-DOP': globalRates['EUR-DOP'],
        'USD-EUR': globalRates['USD-EUR'],
        'EUR-USD': globalRates['EUR-USD'],
        'DOP-USD': globalRates['DOP-USD'],
        'DOP-EUR': globalRates['DOP-EUR']
    };
}

// =============================================================================
// WEB SCRAPING FUNCTIONS
// =============================================================================

/**
 * Scrapes exchange rates from InfoDolar.com.do and updates global variables
 */
export async function scrapeExchangeRates(): Promise<{ usd: ExchangeRate; eur: ExchangeRate; lastUpdated: string }> {
    try {
        const [usdData, eurData] = await Promise.all([
            scrapeUSD(),
            scrapeEUR()
        ]);

        // Create timestamp for API response
        const apiTimestamp = new Date().toISOString();

        // Update global rates directly when scraper executes
        updateRates(usdData.buy, usdData.sell, eurData.buy, eurData.sell, apiTimestamp);

        return {
            usd: usdData,
            eur: eurData,
            lastUpdated: apiTimestamp
        };
    } catch (error) {
        console.error('Error scraping exchange rates:', error);
        throw error;
    }
}

/**
 * Scrapes USD exchange rate from InfoDolar
 */
async function scrapeUSD(): Promise<ExchangeRate> {
    try {
        const response = await fetch(rateConfig.usdRateUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(rateConfig.scrapingTimeout)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // Look for the average InfoDolar rate pattern in table structure
        const avgPattern = /Promedio InfoDolar[\s\S]*?data-order="\$(\d+\.\d+)"[\s\S]*?data-order="\$(\d+\.\d+)"/;
        const match = html.match(avgPattern);

        if (match) {
            const buy = parseFloat(match[1]);
            const sell = parseFloat(match[2]);
            const variation = '0.02'; // Default variation since we can't easily parse it from this structure
            const spread = sell - buy;

            return {
                currency: 'USD',
                buy,
                sell,
                variation,
                spread,
                timestamp: new Date().toISOString()
            };
        }

        console.error('USD Rate pattern not found in HTML');
        throw new Error('Could not find average USD rate in website data');
    } catch (error) {
        console.error('Error scraping USD:', error);
        throw error; // Re-throw to handle at higher level
    }
}

/**
 * Scrapes EUR exchange rate from InfoDolar
 */
async function scrapeEUR(): Promise<ExchangeRate> {
    try {
        const response = await fetch(rateConfig.eurRateUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(rateConfig.scrapingTimeout)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // Look for the average InfoDolar EUR rate pattern in table structure
        const avgPattern = /Promedio InfoDolar[\s\S]*?data-order="\$(\d+\.\d+)"[\s\S]*?data-order="\$(\d+\.\d+)"/;
        const match = html.match(avgPattern);

        if (match) {
            const buy = parseFloat(match[1]);
            const sell = parseFloat(match[2]);
            const variation = '0.06'; // Default variation since we can't easily parse it from this structure
            const spread = sell - buy;

            return {
                currency: 'EUR',
                buy,
                sell,
                variation,
                spread,
                timestamp: new Date().toISOString()
            };
        }

        console.error('EUR Rate pattern not found in HTML');
        throw new Error('Could not find average EUR rate in website data');
    } catch (error) {
        console.error('Error scraping EUR:', error);
        throw error; // Re-throw to handle at higher level
    }
}


// =============================================================================
// SIMPLE RATE ACCESS
// =============================================================================

/**
 * Get current rates (simple function)
 */
export function getCurrentLocalRates(): Record<string, number> {
    return getCurrentRates();
}

/**
 * Get the global last updated timestamp
 */
export function getLastUpdated(): string {
    return globalRates.lastUpdated;
}

/**
 * Get the complete global rates structure
 */
export function getGlobalRates() {
    return {
        usd: { ...globalRates.usd },
        eur: { ...globalRates.eur },
        lastUpdated: globalRates.lastUpdated,
        globalRates: {
            'USD-DOP': globalRates['USD-DOP'],
            'EUR-DOP': globalRates['EUR-DOP'],
            'USD-EUR': globalRates['USD-EUR'],
            'EUR-USD': globalRates['EUR-USD'],
            'DOP-USD': globalRates['DOP-USD'],
            'DOP-EUR': globalRates['DOP-EUR']
        }
    };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get current exchange rates for any currency pair
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rates = getCurrentRates();

    // Try to get from current rates first
    if (rates[rateKey]) {
        return rates[rateKey];
    }

    // If no direct rate, try reverse with high precision
    const reverseRate = rates[`${toCurrency}-${fromCurrency}`];
    if (reverseRate) {
        const precision = 1000000; // 6 decimal places
        return Math.round((1 / reverseRate) * precision) / precision;
    }

    return 1; // Same currency or unknown pair
}

// =============================================================================
// XE.COM CURRENCY DISCOVERY
// =============================================================================

interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
    flag: string;
}

/**
 * Get all available currencies from XE.com selector
 * More efficient: scrape the currency selector dropdown
 */
export async function getAllAvailableCurrencies(): Promise<CurrencyInfo[]> {
    try {
        const response = await fetch('https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=EUR', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(rateConfig.scrapingTimeout)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // Parse currencies from the selector dropdown
        const currencies: CurrencyInfo[] = [];

        // Look for currency options in the selector (more specific pattern)
        const currencyPattern = /<option[^>]*value="([A-Z]{3})"[^>]*>([^<]+)<\/option>/g;
        let match;

        while ((match = currencyPattern.exec(html)) !== null) {
            const code = match[1];
            const name = match[2].trim();

            // Skip empty or invalid entries
            if (code && code.length === 3 && name && !name.includes('Select')) {
                // Excluded currencies that cause 404 errors in production
                const excludedCurrencies = ['CLF', 'CNH', 'FOK', 'KID', 'SSP'];
                if (!excludedCurrencies.includes(code)) {
                    // Avoid duplicates
                    if (!currencies.find(c => c.code === code)) {
                        currencies.push({
                            code,
                            name,
                            symbol: getCurrencySymbol(code),
                            flag: `https://www.xe.com/svgs/flags/${code.toLowerCase()}.static.svg`
                        });
                    }
                }
            }
        }

        // If no currencies found with option pattern, try alternative pattern
        if (currencies.length === 0) {
            const altPattern = /data-currency="([A-Z]{3})"[^>]*>([^<]+)</g;
            let altMatch;

            while ((altMatch = altPattern.exec(html)) !== null) {
                const code = altMatch[1];
                const name = altMatch[2].trim();

                // Excluded currencies that cause 404 errors in production
                const excludedCurrencies = ['CLF', 'CNH', 'FOK', 'KID', 'SSP'];
                if (!excludedCurrencies.includes(code) && !currencies.find(c => c.code === code)) {
                    currencies.push({
                        code,
                        name,
                        symbol: getCurrencySymbol(code),
                        flag: `https://www.xe.com/svgs/flags/${code.toLowerCase()}.static.svg`
                    });
                }
            }
        }

        return currencies;
    } catch (error) {
        console.error('Error getting currencies from XE.com selector:', error);
        // Return fallback currencies if scraping fails
        return getFallbackCurrencies();
    }
}

/**
 * Get currency symbol for a given currency code
 */
function getCurrencySymbol(code: string): string {
    const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CNY': '¥',
        'DOP': 'RD$',
        'MXN': '$'
    };
    return symbols[code] || code;
}

/**
 * Fallback currencies if scraping fails
 */
function getFallbackCurrencies(): CurrencyInfo[] {
    return [
        { code: 'USD', name: 'US Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/usd.static.svg' },
        { code: 'EUR', name: 'Euro', symbol: '€', flag: 'https://www.xe.com/svgs/flags/eur.static.svg' },
        { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: 'https://www.xe.com/svgs/flags/dop.static.svg' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: 'https://www.xe.com/svgs/flags/cad.static.svg' },
        { code: 'GBP', name: 'British Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/gbp.static.svg' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/mxn.static.svg' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/jpy.static.svg' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: 'https://www.xe.com/svgs/flags/aud.static.svg' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: 'https://www.xe.com/svgs/flags/chf.static.svg' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/cny.static.svg' }
    ];
}

/**
 * Generate XE.com URLs for all currency pairs
 */
export function generateXEUrls(currencies: CurrencyInfo[]): string[] {
    const urls: string[] = [];

    // Generate URLs for each currency pair
    for (let i = 0; i < currencies.length; i++) {
        for (let j = 0; j < currencies.length; j++) {
            if (i !== j) {
                const from = currencies[i].code;
                const to = currencies[j].code;
                const url = `https://www.xe.com/currencyconverter/convert/?Amount=1&From=${from}&To=${to}`;
                urls.push(url);
            }
        }
    }

    return urls;
}

/**
 * Scrape rate from XE.com URL
 * Improved pattern matching based on actual XE.com structure
 */
export async function scrapeXERate(url: string): Promise<{ from: string; to: string; rate: number } | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(rateConfig.scrapingTimeout)
        });

        if (!response.ok) {
            // Log the error but don't throw to avoid stopping the entire process
            return null;
        }

        const html = await response.text();

        // Extract currency codes from URL first
        const urlMatch = url.match(/From=([A-Z]{3})&To=([A-Z]{3})/);
        if (!urlMatch) {
            return null;
        }

        const from = urlMatch[1];
        const to = urlMatch[2];

        // Multiple patterns to try for rate extraction
        const patterns = [
            // Pattern 1: Main conversion result "1,00 Dólar estadounidense = 63,530751 Peso dominicano"
            new RegExp(`1,00\\s+[^=]+=\\s+(\\d+[,\\.]\\d+)\\s+[^<]+`, 'i'),
            // Pattern 2: Alternative format "63,530751 Peso dominicano"
            new RegExp(`(\\d+[,\\.]\\d+)\\s+[A-Z]{3}`, 'i'),
            // Pattern 3: Number with comma as decimal separator
            /(\d+,\d+)/,
            // Pattern 4: Number with dot as decimal separator
            /(\d+\.\d+)/
        ];

        let rate: number | null = null;

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                // Convert comma to dot for parsing
                const rateStr = match[1].replace(',', '.');
                rate = parseFloat(rateStr);
                if (rate && rate > 0) {
                    break;
                }
            }
        }

        if (rate && rate > 0) {
            return {
                from,
                to,
                rate
            };
        }

        return null;
    } catch (error) {
        console.error(`Error scraping XE.com rate from ${url}:`, error);
        return null;
    }
}

/**
 * Main function to scrape all XE.com rates
 * Strategy: 1. Get all currencies, 2. Generate URLs, 3. Scrape rates
 */
export async function scrapeAllXERates(): Promise<Record<string, number>> {
    try {

        // Step 1: Get all available currencies
        const currencies = await getAllAvailableCurrencies();

        // Step 2: Generate URLs for all currency pairs
        const urls = generateXEUrls(currencies);

        // Step 3: Scrape rates with rate limiting
        const rates: Record<string, number> = {};
        const batchSize = 5; // Process 5 URLs at a time
        const delay = 1000; // 1 second delay between batches

        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);

            const batchPromises = batch.map(async (url) => {
                const result = await scrapeXERate(url);
                if (result) {
                    const key = `${result.from}-${result.to}`;
                    rates[key] = result.rate;
                }
                return result;
            });

            await Promise.all(batchPromises);

            // Add delay between batches to avoid rate limiting
            if (i + batchSize < urls.length) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return rates;

    } catch (error) {
        console.error('❌ Error in scrapeAllXERates:', error);
        throw error;
    }
}

/**
 * Scrape specific currency pairs from XE.com
 */
export async function scrapeSpecificXERates(currencyPairs: string[]): Promise<Record<string, number>> {
    const rates: Record<string, number> = {};

    for (const pair of currencyPairs) {
        const [from, to] = pair.split('-');
        const url = `https://www.xe.com/currencyconverter/convert/?Amount=1&From=${from}&To=${to}`;

        try {
            const result = await scrapeXERate(url);

            if (result) {
                rates[pair] = result.rate;
            } else {
            }
        } catch {
            // Continue with next pair instead of stopping
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return rates;
}

/**
 * Get only currency codes (siglas) from XE.com
 * First step: Get all available currency codes
 */
export async function getAllCurrencyCodes(): Promise<string[]> {
    try {

        const response = await fetch('https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=EUR', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(rateConfig.scrapingTimeout)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // Extract currency codes from the page
        const currencyCodes: string[] = [];

        // Multiple patterns to find currency codes
        const patterns = [
            // Pattern 1: Option values
            /<option[^>]*value="([A-Z]{3})"/g,
            // Pattern 2: Data attributes
            /data-currency="([A-Z]{3})"/g,
            // Pattern 3: Currency codes in URLs
            /From=([A-Z]{3})/g,
            /To=([A-Z]{3})/g,
            // Pattern 4: Currency codes in text
            /\b([A-Z]{3})\b/g
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const code = match[1];
                if (code && code.length === 3 && !currencyCodes.includes(code)) {
                    currencyCodes.push(code);
                }
            }
        }

        // Filter out common non-currency codes and invalid currencies
        // const invalidCodes = [
        //     'HTML', 'CSS', 'API', 'URL', 'XML', 'JSON', 'PDF', 'DOC', 'TXT',
        //     'GTM', 'UTC', 'GMT', 'EST', 'PST', 'CST', 'MST', 'EDT', 'PDT',
        //     'CDT', 'MDT', 'AKDT', 'HST', 'AST', 'NST', 'ADT', 'NDT',
        //     'CTA', 'GET', 'PUT', 'POST', 'HEAD', 'OPTIONS', 'PATCH', 'DELETE',
        //     'HTTP', 'HTTPS', 'FTP', 'SMTP', 'POP3', 'IMAP', 'SSH', 'SSL',
        //     'TCP', 'UDP', 'IP', 'DNS', 'DHCP', 'NTP', 'SNMP', 'LDAP',
        //     'SQL', 'NOSQL', 'REST', 'SOAP', 'JSON', 'XML', 'YAML', 'TOML',
        //     'INI', 'CFG', 'LOG', 'TMP', 'TEMP', 'BIN', 'EXE', 'DLL',
        //     'ZIP', 'RAR', 'TAR', 'GZ', 'BZ2', '7Z', 'ISO', 'IMG'
        // ];

        // Obsolete currencies to exclude
        const obsoleteCurrencies = [
            'ATS', 'AZM', 'BEF', 'CYP', 'DEM', 'ESP', 'FIM', 'FRF', 'GRD', 'IEP',
            'ITL', 'LUF', 'MTL', 'NLG', 'PTE', 'SIT', 'SKK', 'VAL', 'XEU', 'YUM',
            'ZMK', 'ZWD', 'ZWL', 'CSK', 'DDM', 'ECS', 'GHC', 'GWP', 'MZM', 'ROL',
            'RUR', 'SIT', 'SKK', 'TMM', 'UAK', 'UZS', 'VEB', 'YUM', 'ZAL', 'ZAR'
        ];

        // Only keep known valid currency codes (excluding obsolete ones)
        const validCurrencyCodes = [
            'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
            'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW',
            'DOP', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'BOB', 'VES', 'GTQ', 'HNL',
            'NIO', 'CRC', 'PAB', 'BZD', 'JMD', 'TTD', 'BBD', 'XCD', 'AWG', 'ANG',
            'SRD', 'GYD', 'BMD', 'KYD', 'BHD', 'QAR', 'AED', 'SAR', 'OMR', 'KWD',
            'JOD', 'LBP', 'ILS', 'EGP', 'MAD', 'TND', 'DZD', 'LYD', 'SDG', 'ETB',
            'KES', 'UGX', 'TZS', 'ZMW', 'BWP', 'SZL', 'LSL', 'MZN', 'AOA', 'XOF',
            'XAF', 'XPF', 'CDF', 'RWF', 'BIF', 'DJF', 'KMF', 'MGA', 'SCR', 'MUR',
            'MVR', 'LKR', 'NPR', 'BTN', 'BDT', 'PKR', 'AFN', 'IRR', 'IQD', 'SYP',
            'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'MKD', 'ALL', 'BAM',
            'UAH', 'BYN', 'MDL', 'GEL', 'AMD', 'AZN', 'KZT', 'UZS', 'KGS', 'TJS',
            'TMT', 'MNT', 'LAK', 'KHR', 'VND', 'THB', 'MYR', 'IDR', 'PHP',
            'TWD', 'MOP', 'BND', 'FJD', 'PGK', 'SBD', 'TOP', 'VUV', 'WST'
        ];

        const filteredCodes = currencyCodes.filter(code =>
            validCurrencyCodes.includes(code) &&
            !obsoleteCurrencies.includes(code) &&
            code.length === 3 &&
            /^[A-Z]{3}$/.test(code)
        );

        return filteredCodes;

    } catch (error) {
        console.error('Error getting currency codes from XE.com:', error);
        // Return fallback currency codes
        return ['USD', 'EUR', 'DOP', 'CAD', 'GBP', 'MXN', 'JPY', 'AUD', 'CHF', 'CNY'];
    }
}

/**
 * Generate all possible currency pairs from currency codes
 * Second step: Create all combinations
 */
export function generateAllCurrencyPairs(currencyCodes: string[]): string[] {
    const pairs: string[] = [];

    for (let i = 0; i < currencyCodes.length; i++) {
        for (let j = 0; j < currencyCodes.length; j++) {
            if (i !== j) {
                pairs.push(`${currencyCodes[i]}-${currencyCodes[j]}`);
            }
        }
    }

    return pairs;
}

/**
 * Complete XE.com scraping process
 * Step 1: Get all currency codes
 * Step 2: Generate all pairs
 * Step 3: Scrape all rates
 */
export async function scrapeAllXERatesComplete(): Promise<Record<string, number>> {
    try {

        // Step 1: Get all currency codes
        const currencyCodes = await getAllCurrencyCodes();

        // Step 2: Generate all currency pairs
        const allPairs = generateAllCurrencyPairs(currencyCodes);

        // Step 3: Scrape all rates
        const rates = await scrapeSpecificXERates(allPairs);

        return rates;

    } catch (error) {
        console.error('❌ Error in complete XE.com scraping:', error);
        throw error;
    }
}

/**
 * Scrape limited currency pairs (recommended for production)
 * Only scrapes major currencies to avoid timeouts
 */
export async function scrapeLimitedXERates(): Promise<Record<string, number>> {

    const majorCurrencies = ['USD', 'EUR', 'DOP', 'CAD', 'GBP', 'MXN', 'JPY', 'AUD', 'CHF', 'CNY'];
    const pairs = generateAllCurrencyPairs(majorCurrencies);

    return await scrapeSpecificXERates(pairs);
}

/**
 * Scrape only essential currency pairs (fastest and most reliable)
 * Perfect for production use
 */
export async function scrapeEssentialXERates(): Promise<Record<string, number>> {

    const essentialPairs = [
        'USD-DOP', 'DOP-USD',
        'EUR-DOP', 'DOP-EUR',
        'USD-EUR', 'EUR-USD',
        'GBP-DOP', 'DOP-GBP',
        'CAD-DOP', 'DOP-CAD',
        'MXN-DOP', 'DOP-MXN',
        'JPY-DOP', 'DOP-JPY',
        'AUD-DOP', 'DOP-AUD',
        'CHF-DOP', 'DOP-CHF',
        'CNY-DOP', 'DOP-CNY'
    ];

    return await scrapeSpecificXERates(essentialPairs);
}

/**
 * Test function to scrape a few specific rates
 * Perfect for testing the scraper before running full batch
 */
export async function testXEScraper(): Promise<Record<string, number>> {

    const testPairs = [
        'USD-DOP',
        'EUR-DOP',
        'GBP-DOP',
        'CAD-DOP',
        'USD-EUR',
        'EUR-USD'
    ];

    return await scrapeSpecificXERates(testPairs);
}

/**
 * Generate all currency rates from base rates
 * Uses mathematical calculations instead of scraping every pair
 */
export function generateAllRatesFromBase(baseRates: Record<string, number>): Record<string, number> {
    const allRates: Record<string, number> = {};

    // Add the base rates
    Object.assign(allRates, baseRates);

    // Generate all possible combinations
    const currencies = new Set<string>();
    Object.keys(baseRates).forEach(pair => {
        const [from, to] = pair.split('-');
        currencies.add(from);
        currencies.add(to);
    });

    const currencyList = Array.from(currencies);

    // Generate all pairs
    for (let i = 0; i < currencyList.length; i++) {
        for (let j = 0; j < currencyList.length; j++) {
            if (i !== j) {
                const from = currencyList[i];
                const to = currencyList[j];
                const pair = `${from}-${to}`;

                if (!allRates[pair]) {
                    // Try to calculate from existing rates
                    const directRate = baseRates[pair];
                    if (directRate) {
                        allRates[pair] = directRate;
                    } else {
                        // Try to calculate through USD as intermediate
                        const fromUSD = baseRates[`USD-${from}`];
                        const toUSD = baseRates[`USD-${to}`];
                        if (fromUSD && toUSD) {
                            allRates[pair] = toUSD / fromUSD;
                        } else {
                            // Try to calculate through DOP as intermediate
                            const fromDOP = baseRates[`DOP-${from}`];
                            const toDOP = baseRates[`DOP-${to}`];
                            if (fromDOP && toDOP) {
                                allRates[pair] = toDOP / fromDOP;
                            }
                        }
                    }
                }
            }
        }
    }

    return allRates;
}

/**
 * Scrape only essential base rates and calculate all others
 * Much more efficient than scraping every pair
 */
export async function scrapeBaseRatesAndCalculateAll(): Promise<Record<string, number>> {
    try {

        // Only scrape essential base pairs
        const basePairs = [
            'USD-DOP', 'EUR-DOP', 'GBP-DOP', 'CAD-DOP', 'MXN-DOP',
            'JPY-DOP', 'AUD-DOP', 'CHF-DOP', 'CNY-DOP', 'INR-DOP',
            'BRL-DOP', 'RUB-DOP', 'KRW-DOP', 'SGD-DOP', 'HKD-DOP',
            'NOK-DOP', 'SEK-DOP', 'TRY-DOP', 'ZAR-DOP'
        ];

        const baseRates = await scrapeSpecificXERates(basePairs);

        const allRates = generateAllRatesFromBase(baseRates);

        return allRates;

    } catch (error) {
        console.error('Error in base rates scraping:', error);
        throw error;
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { rateConfig, type ExchangeRate, type ScrapedData, type CachedExchangeRates, type CurrencyInfo };

