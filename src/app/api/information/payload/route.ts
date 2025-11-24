import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type InfoRow = {
    country_codes: string[] | null;
    major_unit_name: string | null;
    minor_unit_name: string | null;
    minor_unit_value: number | null;
    banknotes: { frequently: number[]; rarely: number[] } | null;
    coins: { frequently: number[]; rarely: number[] } | null;
    overview: string | null;
    central_bank: string | null;
} | null;

type CurrencyRow = {
    code: string;
    name: string;
    symbol: string | null;
    info: InfoRow;
};

type InsightPayload = {
    insights: Array<{
        code: string;
        name: string;
        symbol: string | null;
        info: {
            country_codes: string[];
            major_unit: { name: string | null };
            minor_unit: { name: string | null; value: number | null };
            banknotes: { frequently: number[]; rarely: number[] };
            coins: { frequently: number[]; rarely: number[] };
            overview: string | null;
            central_bank: string | null;
        } | null;
    }>;
    fetchedAt: string;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
let cachedInsights: InsightPayload | null = null;
let cacheExpiresAt = 0;

export async function GET() {
    const now = Date.now();

    if (cachedInsights && now < cacheExpiresAt) {
        return NextResponse.json({ success: true, data: cachedInsights });
    }

    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('currencies')
            .select(`
                code,
                name,
                symbol,
                info:info(
                    country_codes,
                    major_unit_name,
                    minor_unit_name,
                    minor_unit_value,
                    banknotes,
                    coins,
                    overview,
                    central_bank
                )
            `)
            .eq('is_active', true)
            .order('code', { ascending: true });

        if (error) {
            throw error;
        }

        const insights = (data as CurrencyRow[] | null)?.map((currency) => ({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            info: currency.info
                ? {
                    country_codes: currency.info.country_codes || [],
                    major_unit: {
                        name: currency.info.major_unit_name
                    },
                    minor_unit: {
                        name: currency.info.minor_unit_name,
                        value: currency.info.minor_unit_value
                    },
                    banknotes: currency.info.banknotes || { frequently: [], rarely: [] },
                    coins: currency.info.coins || { frequently: [], rarely: [] },
                    overview: currency.info.overview,
                    central_bank: currency.info.central_bank
                }
                : null
        })) ?? [];

        const payload: InsightPayload = {
            insights,
            fetchedAt: new Date().toISOString()
        };

        cachedInsights = payload;
        cacheExpiresAt = now + CACHE_TTL_MS;

        return NextResponse.json(
            { success: true, data: payload },
            {
                headers: {
                    'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=7200'
                }
            }
        );
    } catch (error) {
        console.error('Error in GET /api/information/payload:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to load currency insights',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}



