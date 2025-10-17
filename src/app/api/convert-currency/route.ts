import { NextRequest, NextResponse } from 'next/server';
import { rateConfig, getExchangeRate } from '../../../lib/scraper';

export async function POST(request: NextRequest) {
    try {
        const { amount, fromCurrency, toCurrency } = await request.json();

        // Validate required fields
        if (!amount || !fromCurrency || !toCurrency) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: amount, fromCurrency, toCurrency'
            }, { status: 400 });
        }

        // Validate amount is a number
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return NextResponse.json({
                success: false,
                error: 'Amount must be a positive number'
            }, { status: 400 });
        }

        // Validate currencies
        const validCurrencies = ['USD', 'EUR', 'DOP'];
        if (!validCurrencies.includes(fromCurrency.toUpperCase()) || !validCurrencies.includes(toCurrency.toUpperCase())) {
            return NextResponse.json({
                success: false,
                error: 'Invalid currency. Supported currencies: USD, EUR, DOP'
            }, { status: 400 });
        }

        const from = fromCurrency.toUpperCase();
        const to = toCurrency.toUpperCase();

        // If same currency, return the same amount
        if (from === to) {
            return NextResponse.json({
                success: true,
                data: {
                    amount: numericAmount,
                    fromCurrency: from,
                    toCurrency: to,
                    convertedAmount: numericAmount,
                    exchangeRate: 1.0,
                    timestamp: new Date().toISOString()
                },
                metadata: {
                    source: 'Same currency conversion',
                    rateType: 'direct'
                }
            });
        }

        // Get exchange rate using the scraper function
        const exchangeRate = getExchangeRate(from, to);
        
        if (!exchangeRate || exchangeRate === 0) {
            return NextResponse.json({
                success: false,
                error: `Exchange rate not available for ${from} to ${to}. Supported pairs: USD-DOP, EUR-DOP, DOP-USD, DOP-EUR, USD-EUR, EUR-USD`
            }, { status: 400 });
        }

        // Calculate converted amount
        const convertedAmount = numericAmount * exchangeRate;

        return NextResponse.json({
            success: true,
            data: {
                amount: numericAmount,
                fromCurrency: from,
                toCurrency: to,
                convertedAmount: parseFloat(convertedAmount.toFixed(2)),
                exchangeRate: exchangeRate,
                timestamp: new Date().toISOString()
            },
            metadata: {
                source: rateConfig.sourceName,
                rateType: 'current',
                isFromFallback: false,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Currency conversion error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// Disable caching for real-time conversion
export const dynamic = 'force-dynamic';
