/**
 * Historical Data Import Script
 * 
 * Fetches historical exchange rates from exchangerate-api.com
 * and inserts/updates them in Supabase historicals table.
 * 
 * Starting from 2025, processes year by year backwards (2025, 2024, 2023...)
 * 
 * Usage:
 *   npm run historical:import
 *   OR
 *   npm run historical:import [startYear] [endYear]
 *   OR
 *   npx tsx scripts/historical-import.ts [startYear] [endYear]
 * 
 * Examples:
 *   npm run historical:import              # Process only 2025 (for testing)
 *   npm run historical:import 2025 2021    # Process 2025 to 2021
 *   npm run historical:import 2024 2023    # Process only 2024 and 2023
 *   npx tsx scripts/historical-import.ts 2025 2025  # Process only 2025
 * 
 * Required environment variables:
 *   - EXCHANGE_RATE_API_KEY: Your exchangerate-api.com API key
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (for bypassing RLS)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import type { Database } from '../src/types/supabase';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

interface ExchangeRateApiResponse {
    result: 'success' | 'error';
    documentation?: string;
    terms_of_use?: string;
    year?: number;
    month?: number;
    day?: number;
    base_code?: string;
    conversion_rates?: Record<string, number>;
    error_type?: string;
}

interface HistoricalRecord {
    currency_id: number;
    rate: number;
    date: string; // YYYY-MM-DD format
}

class HistoricalImporter {
    private supabase;
    private apiKey: string;
    private baseUrl = 'https://v6.exchangerate-api.com/v6';
    private currencyMap: Map<string, number> = new Map();
    private delayMs = 1000; // Delay between API calls to avoid rate limiting

    constructor() {
        // Validate environment variables
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!apiKey) {
            throw new Error('EXCHANGE_RATE_API_KEY environment variable is required');
        }
        if (!supabaseUrl) {
            throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
        }
        if (!supabaseKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
        }

        this.apiKey = apiKey;
        this.supabase = createClient<Database>(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }

    /**
     * Load all active currencies from database and create code->id map
     */
    async loadCurrencies(): Promise<void> {
        console.log('Loading currencies from database...');
        const { data: currencies, error } = await this.supabase
            .from('currencies')
            .select('id, code')
            .eq('is_active', true);

        if (error || !currencies) {
            throw new Error(`Failed to load currencies: ${error?.message || 'Unknown error'}`);
        }

        this.currencyMap = new Map(
            currencies.map((c: { code: string; id: number }) => [c.code, c.id])
        );

        console.log(`Loaded ${currencies.length} active currencies`);
    }

    /**
     * Fetch historical exchange rates for a specific date
     */
    async fetchHistoricalRates(
        year: number,
        month: number,
        day: number
    ): Promise<Record<string, number> | null> {
        const url = `${this.baseUrl}/${this.apiKey}/history/USD/${year}/${month}/${day}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                let errorData: ExchangeRateApiResponse | null = null;

                try {
                    errorData = JSON.parse(errorText) as ExchangeRateApiResponse;
                } catch {
                    // Not JSON, use raw text
                }

                // Handle specific error types
                if (errorData?.error_type === 'plan-upgrade-required') {
                    if (year === 2025) {
                        // Only log once for 2025 to avoid spam
                        if (month === 1 && day === 1) {
                            console.error('\n⚠️  ERROR: Your API plan does not support historical data access.');
                            console.error('   Please upgrade your plan at https://www.exchangerate-api.com/');
                            console.error('   Or try processing older years (e.g., 2023, 2024) that may be available in your plan.\n');
                        }
                    }
                    return null;
                }

                console.error(`HTTP Error ${response.status} for ${year}-${month}-${day}: ${errorText.substring(0, 200)}`);
                return null;
            }

            const data = (await response.json()) as ExchangeRateApiResponse;

            if (data.result === 'error') {
                const errorMsg = data.error_type || 'Unknown error';

                // Handle plan upgrade error
                if (errorMsg === 'plan-upgrade-required') {
                    if (year === 2025 && month === 1 && day === 1) {
                        console.error('\n⚠️  ERROR: Your API plan does not support historical data access.');
                        console.error('   Please upgrade your plan at https://www.exchangerate-api.com/');
                        console.error('   Or try processing older years (e.g., 2023, 2024) that may be available in your plan.\n');
                    }
                    return null;
                }

                // Skip quietly for common errors (future dates, no data available)
                if (errorMsg.includes('invalid-date') || errorMsg.includes('future') || errorMsg.includes('not available')) {
                    return null;
                }
                console.error(`API Error for ${year}-${month}-${day}: ${errorMsg}`);
                return null;
            }

            if (!data.conversion_rates) {
                console.warn(`No conversion rates for ${year}-${month}-${day}`);
                return null;
            }

            return data.conversion_rates;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Only log if it's not a network timeout or similar
            if (!errorMessage.includes('timeout') && !errorMessage.includes('ECONNREFUSED')) {
                console.error(`Failed to fetch ${year}-${month}-${day}:`, errorMessage);
            }
            return null;
        }
    }

    /**
     * Get all days in a year (excluding future dates)
     */
    getAllDaysInYear(year: number): Array<{ year: number; month: number; day: number }> {
        const days: Array<{ year: number; month: number; day: number }> = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentDay = today.getDate();

        // Determine the last day of the year to process
        let lastMonth = 12;
        let lastDay = 31;

        if (year === currentYear) {
            lastMonth = currentMonth;
            lastDay = currentDay;
        }

        for (let month = 1; month <= lastMonth; month++) {
            const daysInMonth = new Date(year, month, 0).getDate();
            const maxDay = month === lastMonth && year === currentYear ? lastDay : daysInMonth;

            for (let day = 1; day <= maxDay; day++) {
                days.push({ year, month, day });
            }
        }

        return days;
    }

    /**
     * Format date as YYYY-MM-DD
     */
    formatDate(year: number, month: number, day: number): string {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    /**
     * Convert rates to historical records
     */
    convertRatesToRecords(
        rates: Record<string, number>,
        date: string
    ): HistoricalRecord[] {
        const records: HistoricalRecord[] = [];

        for (const [code, rate] of Object.entries(rates)) {
            const currencyId = this.currencyMap.get(code);
            if (!currencyId) {
                // Currency not in database, skip
                continue;
            }

            records.push({
                currency_id: currencyId,
                rate,
                date,
            });
        }

        return records;
    }

    /**
     * Upsert historical records (insert if not exists, update if exists and different)
     */
    async upsertHistoricalRecords(records: HistoricalRecord[]): Promise<{
        inserted: number;
        updated: number;
        skipped: number;
    }> {
        if (records.length === 0) {
            return { inserted: 0, updated: 0, skipped: 0 };
        }

        // Check existing records for this date (include id for updates)
        const date = records[0].date;
        const { data: existingRecords, error: fetchError } = await this.supabase
            .from('historicals')
            .select('id, currency_id, rate, date')
            .eq('date', date);

        if (fetchError) {
            console.error(`Error fetching existing records for ${date}:`, fetchError);
            throw fetchError;
        }

        // Create maps of existing records: currency_id -> { id, rate }
        const existingMap = new Map<number, { id: number; rate: number }>();
        if (existingRecords) {
            existingRecords.forEach((r: { currency_id: number; id: number; rate: number }) => {
                existingMap.set(r.currency_id, { id: r.id, rate: r.rate });
            });
        }

        // Separate records into insert, update, and skip
        const toInsert: HistoricalRecord[] = [];
        const toUpdate: Array<HistoricalRecord & { id: number }> = [];
        const skipped: HistoricalRecord[] = [];

        for (const record of records) {
            const existing = existingMap.get(record.currency_id);

            if (existing === undefined) {
                // New record, insert
                toInsert.push(record);
            } else if (existing.rate !== record.rate) {
                // Rate changed, need to update
                toUpdate.push({ ...record, id: existing.id });
            } else {
                // Same rate, skip
                skipped.push(record);
            }
        }

        // Perform inserts
        let inserted = 0;
        if (toInsert.length > 0) {
            // Supabase has a limit on batch size, so we'll insert in chunks
            const chunkSize = 1000;
            for (let i = 0; i < toInsert.length; i += chunkSize) {
                const chunk = toInsert.slice(i, i + chunkSize);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: insertError } = await (this.supabase as any)
                    .from('historicals')
                    .insert(chunk);

                if (insertError) {
                    console.error(`Error inserting chunk for ${date}:`, insertError);
                    throw insertError;
                }
                inserted += chunk.length;
            }
        }

        // Perform updates
        let updated = 0;
        if (toUpdate.length > 0) {
            // Update each record individually (Supabase doesn't support bulk update with different values)
            const updatePromises = toUpdate.map(async (record) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: updateError } = await (this.supabase as any)
                    .from('historicals')
                    .update({ rate: record.rate, updated_at: new Date().toISOString() })
                    .eq('id', record.id);

                if (updateError) {
                    console.error(`Error updating record ${record.id}:`, updateError);
                    throw updateError;
                }
            });

            await Promise.all(updatePromises);
            updated = toUpdate.length;
        }

        return {
            inserted,
            updated,
            skipped: skipped.length,
        };
    }

    /**
     * Process a single year
     */
    async processYear(year: number): Promise<void> {
        console.log(`\n=== Processing year ${year} ===`);
        const days = this.getAllDaysInYear(year);
        console.log(`Total days to process: ${days.length}`);

        let totalInserted = 0;
        let totalUpdated = 0;
        let totalSkipped = 0;
        let totalFailed = 0;

        for (let i = 0; i < days.length; i++) {
            const { year: y, month: m, day: d } = days[i];
            const date = this.formatDate(y, m, d);

            // Progress indicator (every 10 days or at the end)
            if ((i + 1) % 10 === 0 || i === days.length - 1) {
                console.log(`Processing day ${i + 1}/${days.length}: ${date} (Inserted: ${totalInserted}, Updated: ${totalUpdated}, Skipped: ${totalSkipped}, Failed: ${totalFailed})`);
            }

            // Fetch rates
            const rates = await this.fetchHistoricalRates(y, m, d);

            if (!rates) {
                totalFailed++;
                // Wait before next request
                await this.delay(this.delayMs);
                continue;
            }

            // Convert to records
            const records = this.convertRatesToRecords(rates, date);

            if (records.length === 0) {
                totalFailed++;
                await this.delay(this.delayMs);
                continue;
            }

            // Upsert records
            try {
                const result = await this.upsertHistoricalRecords(records);
                totalInserted += result.inserted;
                totalUpdated += result.updated;
                totalSkipped += result.skipped;
            } catch (error) {
                console.error(`Error upserting records for ${date}:`, error);
                totalFailed++;
            }

            // Rate limiting: wait before next request
            await this.delay(this.delayMs);
        }

        console.log(`\nYear ${year} summary:`);
        console.log(`  Inserted: ${totalInserted}`);
        console.log(`  Updated: ${totalUpdated}`);
        console.log(`  Skipped (no change): ${totalSkipped}`);
        console.log(`  Failed: ${totalFailed}`);
    }

    /**
     * Delay helper for rate limiting
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Main execution method
     */
    async run(startYear: number = 2025, endYear: number = 2025): Promise<void> {
        console.log('Starting historical data import...');
        if (startYear === endYear) {
            console.log(`Processing year ${startYear} only`);
        } else {
            console.log(`Processing years from ${startYear} to ${endYear} (backwards)`);
        }

        // Load currencies first
        await this.loadCurrencies();

        // Process each year from startYear down to endYear
        for (let year = startYear; year >= endYear; year--) {
            try {
                await this.processYear(year);
            } catch (error) {
                console.error(`Error processing year ${year}:`, error);
                // Continue with next year
            }
        }

        console.log('\n=== Import completed ===');
    }
}

// Main execution
async function main() {
    try {
        const importer = new HistoricalImporter();

        // Get start year from command line or default to 2025
        const startYear = process.argv[2] ? parseInt(process.argv[2], 10) : 2025;
        // Get end year from command line or default to 2025 (for testing)
        // To process multiple years: npx tsx scripts/historical-import.ts 2025 2021
        const endYear = process.argv[3] ? parseInt(process.argv[3], 10) : 2025;

        if (isNaN(startYear) || isNaN(endYear)) {
            console.error('Invalid year arguments. Usage: npx tsx scripts/historical-import.ts [startYear] [endYear]');
            process.exit(1);
        }

        await importer.run(startYear, endYear);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run if executed directly
main();

export default HistoricalImporter;

