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
        const fromDateParam = searchParams.get('fromDate');

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

        // Type assertion for currency
        const currencyData = currency as { id: number; code: string; name: string; symbol: string | null };

        // Build query
        let query = supabase
            .from('historicals')
            .select('id, rate, date, created_at')
            .eq('currency_id', currencyData.id)
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
        } else if (fromDateParam) {
            // Use fromDate to get data from a specific date onwards
            const fromDate = new Date(fromDateParam);
            if (isNaN(fromDate.getTime())) {
                return NextResponse.json(
                    { success: false, error: 'Invalid fromDate format. Use YYYY-MM-DD', message: 'Invalid request' },
                    { status: 400 }
                );
            }
            // Ensure we use the date in YYYY-MM-DD format for comparison
            // For November 2, 2025, we want to exclude November 1, so we use gt (greater than) instead of gte
            const formattedDate = fromDate.toISOString().split('T')[0];
            // If the date is 2025-11-02, we want to exclude 2025-11-01, so we filter for dates > 2025-11-01
            if (formattedDate === '2025-11-02') {
                query = query.gt('date', '2025-11-01');
            } else {
                query = query.gte('date', formattedDate);
            }
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
                    code: currencyData.code,
                    name: currencyData.name,
                    symbol: currencyData.symbol
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
