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
        // First, get existing rates to determine if we need to update or insert
        const { data: existingRates } = await supabase
            .from('rates')
            .select('id, currency_id');

        const existingMap = new Map<number, number>();
        if (existingRates) {
            existingRates.forEach((rate: { id: number; currency_id: number }) => {
                existingMap.set(rate.currency_id, rate.id);
            });
        }

        // Separate updates and inserts
        const toUpdate: Array<{ id: number; currency_id: number; rate: number; updated_at: string }> = [];
        const toInsert: Array<{ currency_id: number; rate: number; updated_at: string }> = [];
        const now = new Date().toISOString();

        updates.forEach((update: { currency_id: number; rate: number }) => {
            const existingId = existingMap.get(update.currency_id);
            if (existingId) {
                toUpdate.push({
                    id: existingId,
                    currency_id: update.currency_id,
                    rate: update.rate,
                    updated_at: now
                });
            } else {
                toInsert.push({
                    currency_id: update.currency_id,
                    rate: update.rate,
                    updated_at: now
                });
            }
        });

        // Perform updates and inserts
        let ratesError = null;

        // Update existing records using id (primary key)
        // Since Supabase doesn't support bulk updates with different values,
        // we'll update each record individually
        if (toUpdate.length > 0) {
            const updatePromises = toUpdate.map((record) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (supabase as any)
                    .from('rates')
                    .update({ rate: record.rate, updated_at: record.updated_at })
                    .eq('id', record.id)
            );

            const updateResults = await Promise.all(updatePromises);
            const firstError = updateResults.find((result) => result.error);

            if (firstError) {
                ratesError = firstError.error;
            }
        }

        // Insert new records
        if (!ratesError && toInsert.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: insertError } = await (supabase as any)
                .from('rates')
                .insert(toInsert);
            ratesError = insertError;
        }

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

        // Insert into historicals (only if not exists for today)
        // Check existing historical records for today to avoid duplicates
        const { data: existingHistoricals } = await supabase
            .from('historicals')
            .select('currency_id, date')
            .eq('date', today);

        const existingHistoricalSet = new Set<string>();
        if (existingHistoricals) {
            existingHistoricals.forEach((h: { currency_id: number; date: string }) => {
                existingHistoricalSet.add(`${h.currency_id}-${h.date}`);
            });
        }

        // Filter out duplicates
        const historicalToInsert = historicalInserts.filter((h: { currency_id: number; date: string }) => {
            return !existingHistoricalSet.has(`${h.currency_id}-${h.date}`);
        });

        let historicalError = null;
        if (historicalToInsert.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('historicals')
                .insert(historicalToInsert);
            historicalError = error;
        }

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
                inserted: toInsert.length,
                historical_inserted: historicalToInsert.length,
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

