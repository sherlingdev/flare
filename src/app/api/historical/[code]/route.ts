import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const { code: codeParam } = await params;
        const code = codeParam.toUpperCase();
        const daysParam = searchParams.get('days');
        const dateParam = searchParams.get('date');

        const supabase = await createClient();

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

        // Build query
        let query = supabase
            .from('historicals')
            .select('id, rate, date, created_at')
            .eq('currency_id', currency.id)
            .order('date', { ascending: false });

        // Apply filters
        if (dateParam) {
            const date = new Date(dateParam);
            if (isNaN(date.getTime())) {
                return NextResponse.json(
                    { success: false, error: 'Invalid date format. Use YYYY-MM-DD', message: 'Invalid request' },
                    { status: 400 }
                );
            }
            query = query.eq('date', dateParam);
        } else {
            const days = Math.min(Math.max(parseInt(daysParam || '30'), 1), 365);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            query = query.gte('date', startDate.toISOString().split('T')[0]);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching historical data:', error);
            return NextResponse.json(
                { success: false, error: error.message, message: 'Failed to fetch historical data' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                currency: {
                    code: currency.code,
                    name: currency.name,
                    symbol: currency.symbol
                },
                rates: data || [],
                count: count || data?.length || 0
            },
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/historical/[code]:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Unable to retrieve historical data. Please try again later.'
            },
            { status: 500 }
        );
    }
}
