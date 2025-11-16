import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type RateRow = {
    rate: number;
    updated_at: string;
    currencies: {
        code: string;
        name: string;
        symbol: string | null;
    };
};

type CurrencyRow = {
    code: string;
    name: string;
    symbol: string | null;
    is_active: boolean;
};

type Payload = {
    rates: Record<string, number>;
    currencies: Array<{
        code: string;
        name: string;
        symbol: string;
        flag: string;
    }>;
    fetchedAt: string;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
let cachedPayload: Payload | null = null;
let cacheExpiresAt = 0;

export async function GET() {
    const now = Date.now();

    if (cachedPayload && now < cacheExpiresAt) {
        return NextResponse.json({ success: true, data: cachedPayload });
    }

    try {
        const supabase = await createClient();

        const { data: rateRows, error: ratesError } = await supabase
            .from('rates')
            .select(`
                rate,
                updated_at,
                currencies!inner (code, name, symbol)
            `)
            .order('updated_at', { ascending: false });

        if (ratesError) {
            throw ratesError;
        }

        const { data: currencyRows, error: currenciesError } = await supabase
            .from('currencies')
            .select('code, name, symbol, is_active')
            .eq('is_active', true)
            .order('code', { ascending: true });

        if (currenciesError) {
            throw currenciesError;
        }

        const rates: Record<string, number> = {};
        (rateRows as RateRow[] | null)?.forEach(rate => {
            rates[rate.currencies.code] = rate.rate;
        });

        const currencies = (currencyRows as CurrencyRow[] | null)?.map(currency => ({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol || currency.code,
            flag: `https://www.xe.com/svgs/flags/${currency.code.toLowerCase()}.static.svg`
        })) ?? [];

        const payload: Payload = {
            rates,
            currencies,
            fetchedAt: new Date().toISOString()
        };

        cachedPayload = payload;
        cacheExpiresAt = now + CACHE_TTL_MS;

        return NextResponse.json(
            { success: true, data: payload },
            {
                headers: {
                    'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120'
                }
            }
        );
    } catch (error) {
        console.error('Error in GET /api/payload:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to load homepage payload',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

