import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error, count } = await supabase
            .from('currencies')
            .select('id, code, name, symbol, is_active')
            .eq('is_active', true)
            .order('code', { ascending: true });

        if (error) {
            console.error('Error fetching currencies:', error);
            return NextResponse.json(
                { success: false, error: error.message, message: 'Failed to fetch currencies' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data || [],
            count: count || data?.length || 0,
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/currencies:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Unable to retrieve currencies. Please try again later.'
            },
            { status: 500 }
        );
    }
}
