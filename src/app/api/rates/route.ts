import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error, count } = await supabase
            .from('rates')
            .select(`
                id, rate, updated_at,
                currencies!inner (id, code, name, symbol)
            `)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching rates:', error);
            return NextResponse.json(
                { success: false, error: error.message, message: 'Failed to fetch rates' },
                { status: 500 }
            );
        }

        const formattedData = data?.map((rate: {
            id: number;
            rate: number;
            updated_at: string;
            currencies: { id: number; code: string; name: string; symbol: string | null };
        }) => ({
            currency_id: rate.currencies.id,
            code: rate.currencies.code,
            name: rate.currencies.name,
            symbol: rate.currencies.symbol,
            rate: rate.rate,
            updated_at: rate.updated_at
        })) || [];

        return NextResponse.json({
            success: true,
            data: formattedData,
            count: count || formattedData.length,
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/rates:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Unable to retrieve current exchange rates. Please try again later.'
            },
            { status: 500 }
        );
    }
}
