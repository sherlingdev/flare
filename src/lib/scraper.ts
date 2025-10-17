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
        'USD-DOP': 62.67,
        'EUR-DOP': 72.03,
        'USD-EUR': 0.87,
        'EUR-USD': 1.15,
        'DOP-USD': 0.016,
        'DOP-EUR': 0.014
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
        buy: 62.67,
        sell: 63.86,
        variation: 0.02,
        spread: 1.19
    },
    eur: {
        buy: 72.03,
        sell: 76.03,
        variation: 0.06,
        spread: 4.00
    },
    lastUpdated: new Date().toISOString(),
    // Derived rates for currency conversion
    'USD-DOP': 62.67,
    'EUR-DOP': 72.03,
    'USD-EUR': 0.87,
    'EUR-USD': 1.15,
    'DOP-USD': 0.016,
    'DOP-EUR': 0.014
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
// EXPORTS
// =============================================================================

export { rateConfig, type ExchangeRate, type ScrapedData, type CachedExchangeRates };

