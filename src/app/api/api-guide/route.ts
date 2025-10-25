import { NextResponse } from 'next/server';
import { getGlobalRates } from '@/lib/scraper';

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
function formatCurrencyData(data: { buy: number; sell: number; variation: number; spread: number }) {
    return {
        buy: roundTo2Decimals(data.buy),
        sell: roundTo2Decimals(data.sell),
        variation: roundTo2Decimals(data.variation),
        spread: roundTo2Decimals(data.spread)
    };
}

/**
 * Exchange Rates API Endpoint (Read-Only)
 * 
 * Returns the same data structure as /api/scraper but without running the scraper.
 * Uses cached data from the global rates system.
 * Perfect for API documentation and read-only access.
 */

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const currency = searchParams.get('currency');

    try {
        // Get current cached data without scraping
        const globalRates = getGlobalRates();

        // If requesting only global rates
        if (action === 'rates') {
            return NextResponse.json({
                success: true,
                data: formatGlobalRates(globalRates.globalRates),
                lastUpdated: globalRates.lastUpdated
            });
        }

        // If requesting specific currency data
        if (currency === 'usd' || currency === 'eur') {
            const response: {
                success: boolean;
                lastUpdated: string;
                data?: {
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
            } = {
                success: true,
                lastUpdated: globalRates.lastUpdated
            };

            if (currency === 'usd') {
                response.data = {
                    usd: {
                        currency: 'USD',
                        ...formatCurrencyData(globalRates.usd)
                    }
                };
            } else if (currency === 'eur') {
                response.data = {
                    eur: {
                        currency: 'EUR',
                        ...formatCurrencyData(globalRates.eur)
                    }
                };
            }

            return NextResponse.json(response);
        }

        // Return complete data (default)
        return NextResponse.json({
            success: true,
            data: {
                usd: {
                    currency: 'USD',
                    ...formatCurrencyData(globalRates.usd)
                },
                eur: {
                    currency: 'EUR',
                    ...formatCurrencyData(globalRates.eur)
                }
            },
            lastUpdated: globalRates.lastUpdated,
            globalRates: formatGlobalRates(globalRates.globalRates)
        });

    } catch (error) {
        console.error('Exchange rates API error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve exchange rates',
            message: 'Unable to retrieve current exchange rates. Please try again later.'
        }, { status: 503 });
    }
}

// Enable caching based on environment configuration
export const revalidate = 3600; // 1 hour cache
