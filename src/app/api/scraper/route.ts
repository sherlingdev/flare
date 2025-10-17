import { NextResponse } from 'next/server';
import { scrapeExchangeRates, getGlobalRates } from '../../../lib/scraper';

/**
 * Interface for currency data response
 */
interface CurrencyDataResponse {
    success: true;
    lastUpdated: string;
    data: {
        usd?: {
            currency: string;
            buy: number;
            sell: number;
            variation: number;
            spread: number;
        };
        eur?: {
            currency: string;
            buy: number;
            sell: number;
            variation: number;
            spread: number;
        };
    };
}

/**
 * Interface for global rates response
 */
interface GlobalRatesResponse {
    success: true;
    data: Record<string, number>;
    lastUpdated: string;
}

/**
 * Interface for complete data response
 */
interface CompleteDataResponse {
    success: true;
    data: {
        usd: {
            currency: string;
            buy: number;
            sell: number;
            variation: number;
            spread: number;
        };
        eur: {
            currency: string;
            buy: number;
            sell: number;
            variation: number;
            spread: number;
        };
    };
    lastUpdated: string;
    globalRates: Record<string, number>;
}

/**
 * Interface for error response
 */
interface ErrorResponse {
    success: false;
    error: string;
    message: string;
}

/**
 * Round a number to 2 decimal places
 */
function roundTo2Decimals(num: number): number {
    return Math.round(num * 100) / 100;
}

/**
 * Format global rates with 2 decimal precision
 */
function formatGlobalRates(rates: Record<string, number>): Record<string, number> {
    const formatted: Record<string, number> = {};
    for (const [key, value] of Object.entries(rates)) {
        formatted[key] = roundTo2Decimals(value);
    }
    return formatted;
}

/**
 * Format currency data with proper rounding and type conversion
 */
function formatCurrencyData(data: { currency: string; buy: number; sell: number; variation: string; spread: number }) {
    return {
        currency: data.currency,
        buy: roundTo2Decimals(data.buy),
        sell: roundTo2Decimals(data.sell),
        variation: roundTo2Decimals(parseFloat(data.variation)),
        spread: roundTo2Decimals(data.spread)
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const currency = searchParams.get('currency');

    // If requesting only global rates
    if (action === 'rates') {
        try {
            // Check if we need to update rates (force update for now)
            await scrapeExchangeRates();

            const response: GlobalRatesResponse = {
                success: true,
                data: formatGlobalRates(getGlobalRates().globalRates),
                lastUpdated: getGlobalRates().lastUpdated
            };
            return NextResponse.json(response);
        } catch (error) {
            console.error('Error getting rates:', error);
            const fallbackResponse: GlobalRatesResponse = {
                success: true,
                data: formatGlobalRates(getGlobalRates().globalRates),
                lastUpdated: getGlobalRates().lastUpdated
            };
            return NextResponse.json(fallbackResponse);
        }
    }

    // If requesting specific currency data
    if (currency === 'usd' || currency === 'eur') {
        try {
            // Check if we need to update rates (force update for now)
            const scrapedData = await scrapeExchangeRates();

            const response: CurrencyDataResponse = {
                success: true,
                lastUpdated: getGlobalRates().lastUpdated,
                data: {}
            };

            if (currency === 'usd') {
                response.data.usd = formatCurrencyData(scrapedData.usd);
            } else if (currency === 'eur') {
                response.data.eur = formatCurrencyData(scrapedData.eur);
            }

            return NextResponse.json(response);
        } catch (error) {
            console.error('Error getting currency data:', error);
            const errorResponse: ErrorResponse = {
                success: false,
                error: 'Failed to fetch currency data',
                message: 'Unable to retrieve current currency rates. Please try again later.'
            };
            return NextResponse.json(errorResponse, { status: 503 });
        }
    }

    try {
        // Use the unified scraper system from lib/scraper.ts
        const scrapedData = await scrapeExchangeRates();

        const response: CompleteDataResponse = {
            success: true,
            data: {
                usd: formatCurrencyData(scrapedData.usd),
                eur: formatCurrencyData(scrapedData.eur)
            },
            lastUpdated: getGlobalRates().lastUpdated,
            globalRates: formatGlobalRates(getGlobalRates().globalRates)
        };
        return NextResponse.json(response);

    } catch (error) {
        console.error('API Error:', error);

        // Only return error, no fallback data
        const errorResponse: ErrorResponse = {
            success: false,
            error: 'Failed to fetch exchange rates from InfoDolar.com.do',
            message: 'Unable to retrieve current exchange rates. Please try again later.'
        };
        return NextResponse.json(errorResponse, { status: 503 }); // Service Unavailable
    }
}

// Enable caching based on environment configuration
export const revalidate = 3600; // 1 hour cache
