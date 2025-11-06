import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/currency/info/{code}
 * 
 * Returns detailed technical information about a currency including:
 * - Country codes where the currency is used
 * - Decimal digits and rounding
 * - Major and minor unit information
 * - Banknote and coin denominations
 * 
 * Note: Overview and plural forms are handled in translations.ts (frontend)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code: codeParam } = await params;
        const code = codeParam.toUpperCase();

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

        // Get info (optional - may not exist for all currencies)
        // Use maybeSingle() to handle no rows gracefully (returns null data, no error)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: info, error: infoError } = await (supabase as any)
            .from('info')
            .select('*')
            .eq('currency_id', currencyData.id)
            .maybeSingle();

        // Debug logging in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEBUG] Currency ID: ${currencyData.id}, Code: ${code}`);
            console.log(`[DEBUG] Info data:`, info);
            console.log(`[DEBUG] Info error:`, infoError);
        }

        // Info is optional, so we don't error if it doesn't exist
        // maybeSingle() returns null data and no error when no rows found
        if (infoError && infoError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" which is fine
            console.error('Error fetching currency info:', infoError);
        }

        // Type assertion for info
        const infoData = info as {
            country_codes: string[] | null;
            major_unit_name: string | null;
            // major_unit_symbol removed - use currencies.symbol instead
            minor_unit_name: string | null;
            // minor_unit_symbol removed
            minor_unit_value: number | null;
            banknotes: { frequently: number[]; rarely: number[] } | null;
            coins: { frequently: number[]; rarely: number[] } | null;
            overview: string | null;
            central_bank: string | null;
        } | null;

        return NextResponse.json({
            success: true,
            data: {
                currency: {
                    code: currencyData.code,
                    name: currencyData.name,
                    symbol: currencyData.symbol
                },
                info: infoData ? {
                    country_codes: infoData.country_codes || [],
                    major_unit: {
                        name: infoData.major_unit_name
                    },
                    minor_unit: {
                        name: infoData.minor_unit_name,
                        // minor_unit_symbol removed
                        value: infoData.minor_unit_value
                    },
                    banknotes: infoData.banknotes || { frequently: [], rarely: [] },
                    coins: infoData.coins || { frequently: [], rarely: [] },
                    overview: infoData.overview,
                    central_bank: infoData.central_bank
                } : null
            },
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/currency/info/[code]:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Unable to retrieve currency information. Please try again later.'
            },
            { status: 500 }
        );
    }
}

