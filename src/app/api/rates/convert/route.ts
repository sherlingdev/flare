import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from')?.toUpperCase();
        const to = searchParams.get('to')?.toUpperCase();
        const amount = parseFloat(searchParams.get('amount') || '1');

        if (!from || !to) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameters: from and to', message: 'Invalid request' },
                { status: 400 }
            );
        }

        if (isNaN(amount) || amount < 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid amount. Must be a positive number', message: 'Invalid request' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get rates for both currencies
        const { data: rates, error } = await supabase
            .from('rates')
            .select(`rate, currencies!inner (code)`)
            .in('currencies.code', [from, to]);

        if (error || !rates || rates.length < 2) {
            return NextResponse.json(
                { success: false, error: 'Could not fetch rates for the specified currencies', message: 'Rates not found' },
                { status: 404 }
            );
        }

        const fromRate = rates.find(r => r.currencies.code === from)?.rate || 1;
        const toRate = rates.find(r => r.currencies.code === to)?.rate || 1;

        // Convert: amount in FROM currency -> USD -> TO currency
        const amountInUSD = amount / fromRate;
        const convertedAmount = amountInUSD * toRate;
        const exchangeRate = toRate / fromRate;

        return NextResponse.json({
            success: true,
            data: {
                from: { code: from, amount },
                to: { code: to, amount: convertedAmount },
                rate: exchangeRate,
                timestamp: new Date().toISOString()
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/rates/convert:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Unable to convert currency. Please try again later.'
            },
            { status: 500 }
        );
    }
}
