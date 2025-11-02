import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

/**
 * POST /api/rates/update
 * Actualizar tasas de cambio (llamado desde GitHub Actions)
 * 
 * Body:
 * {
 *   "rates": {
 *     "USD": 1,
 *     "EUR": 0.85,
 *     ...
 *   }
 * }
 * 
 * This endpoint:
 * 1. Updates the rates table
 * 2. Inserts records into historicals table
 * 
 * ⚠️ Security: This endpoint should be protected (e.g., with API key)
 */
export async function POST(request: Request) {
    try {
        const supabase = createServiceClient();

        // Parse request body
        const body = await request.json();
        const { rates } = body;

        if (!rates || typeof rates !== 'object') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body. Expected { rates: { "USD": 1, ... } }',
                    message: 'Invalid request'
                },
                { status: 400 }
            );
        }

        // Get all currencies to map codes to IDs
        const { data: currencies, error: currenciesError } = await supabase
            .from('currencies')
            .select('id, code')
            .eq('is_active', true);

        if (currenciesError || !currencies) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to fetch currencies',
                    message: 'Database error'
                },
                { status: 500 }
            );
        }

        // Create currency code to ID map
        const currencyMap = new Map<string, number>(
            currencies.map((c: { code: string; id: number }) => [c.code, c.id])
        );

        const today = new Date().toISOString().split('T')[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const historicalInserts: any[] = [];

        // Prepare updates and inserts
        for (const [code, rate] of Object.entries(rates)) {
            const currencyId = currencyMap.get(code);
            if (!currencyId) {
                console.warn(`Currency ${code} not found in database, skipping`);
                continue;
            }

            const rateValue = typeof rate === 'number' ? rate : parseFloat(rate as string);
            if (isNaN(rateValue)) {
                console.warn(`Invalid rate for ${code}, skipping`);
                continue;
            }

            // Prepare rate update (upsert)
            updates.push({
                currency_id: currencyId,
                rate: rateValue
            });

            // Prepare historical insert (only if not exists for today)
            historicalInserts.push({
                currency_id: currencyId,
                rate: rateValue,
                date: today
            });
        }

        if (updates.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No valid rates to update',
                    message: 'Invalid request'
                },
                { status: 400 }
            );
        }

        // Update rates table (upsert based on currency_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: ratesError } = await (supabase as any)
            .from('rates')
            .upsert(updates, {
                onConflict: 'currency_id',
                ignoreDuplicates: false
            });

        if (ratesError) {
            console.error('Error updating rates:', ratesError);
            return NextResponse.json(
                {
                    success: false,
                    error: ratesError.message,
                    message: 'Failed to update rates'
                },
                { status: 500 }
            );
        }

        // Insert into historicals (with conflict handling - don't insert duplicate date+currency)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: historicalError } = await (supabase as any)
            .from('historicals')
            .upsert(historicalInserts, {
                onConflict: 'currency_id,date',
                ignoreDuplicates: true
            });

        if (historicalError) {
            console.error('Error inserting historical data:', historicalError);
            // Don't fail the whole request if historical insert fails
            // Rates were updated successfully
        }

        return NextResponse.json({
            success: true,
            message: 'Rates updated successfully',
            data: {
                updated: updates.length,
                historical_inserted: historicalInserts.length,
                date: today
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in POST /api/rates/update:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to update rates'
            },
            { status: 500 }
        );
    }
}

