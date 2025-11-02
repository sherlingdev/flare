import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const supabase = await createClient();
        const { code: codeParam } = await params;
        const code = codeParam.toUpperCase();

        // Get currency
        const { data: currency, error: currencyError } = await supabase
            .from('currencies')
            .select('id, code, name, symbol')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (currencyError || !currency) {
            return NextResponse.json(
                { success: false, error: `Currency with code ${code} not found`, message: 'Currency not found' },
                { status: 404 }
            );
        }

        // Get rate - TypeScript guard: currency is guaranteed to exist here
        const currencyId = (currency as { id: number; code: string; name: string; symbol: string | null }).id;
        const { data: rate, error: rateError } = await supabase
            .from('rates')
            .select('rate, updated_at')
            .eq('currency_id', currencyId)
            .single();

        if (rateError || !rate) {
            return NextResponse.json(
                { success: false, error: `Rate not found for currency ${code}`, message: 'Rate not found' },
                { status: 404 }
            );
        }

        const currencyData = currency as { id: number; code: string; name: string; symbol: string | null };
        const rateData = rate as { rate: number; updated_at: string };

        return NextResponse.json({
            success: true,
            data: {
                currency_id: currencyData.id,
                code: currencyData.code,
                name: currencyData.name,
                symbol: currencyData.symbol,
                rate: rateData.rate,
                updated_at: rateData.updated_at
            },
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/rates/[code]:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Unable to retrieve exchange rate. Please try again later.'
            },
            { status: 500 }
        );
    }
}
