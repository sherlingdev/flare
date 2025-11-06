/**
 * Currency Info Scraper
 * 
 * Scrapes currency information from dev.me/currency/info/{code}
 * and saves it to Supabase info table.
 * 
 * Usage:
 *   npm run scrape:currency-info
 *   OR
 *   npx tsx scripts/scrape-currency-info.ts [currencyCode]
 * 
 * Examples:
 *   npx tsx scripts/scrape-currency-info.ts DOP  # Scrape only DOP
 *   npx tsx scripts/scrape-currency-info.ts      # Scrape all active currencies
 * 
 * Required environment variables:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import type { Database } from '../src/types/supabase';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

interface ScrapedInfo {
    country_codes: string[];
    major_unit_name: string | null;
    // major_unit_symbol removed - use currencies.symbol instead
    minor_unit_name: string | null;
    // minor_unit_symbol removed
    minor_unit_value: number | null;
    banknotes: {
        frequently: number[];
        rarely: number[];
    };
    coins: {
        frequently: number[];
        rarely: number[];
    };
    overview: string | null;
    central_bank: string | null;
}

class CurrencyInfoScraper {
    private supabase;
    private baseUrl = 'https://dev.me/currency/info';
    private delayMs = 2000; // Delay between requests to avoid rate limiting

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
        }

        this.supabase = createClient<Database>(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }

    /**
     * Scrape currency info from dev.me
     */
    async scrapeCurrencyInfo(code: string): Promise<ScrapedInfo | null> {
        const url = `${this.baseUrl}/${code.toUpperCase()}`;

        try {
            console.log(`Fetching ${code} from ${url}...`);
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!response.ok) {
                console.error(`HTTP ${response.status} for ${code}`);
                return null;
            }

            const html = await response.text();

            // Debug: Save full HTML for analysis (only for DOP or UGX)
            if (code === 'DOP' || code === 'UGX') {
                const fs = await import('fs');
                const path = await import('path');
                const htmlPath = path.resolve(process.cwd(), `${code.toLowerCase()}-html-sample.html`);
                fs.writeFileSync(htmlPath, html, 'utf-8');
                console.log(`  Saved HTML to: ${htmlPath}`);
            }

            // Try to extract JSON data from script tags or __NEXT_DATA__
            let jsonData: unknown = null;

            // Look for __NEXT_DATA__ (Next.js stores page data here)
            // Note: 's' flag requires ES2018, but we use [\s\S] instead for compatibility
            const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
            if (nextDataMatch) {
                try {
                    const parsed = JSON.parse(nextDataMatch[1]) as Record<string, unknown>;
                    // Navigate through Next.js structure to find currency data
                    if (parsed?.props && typeof parsed.props === 'object') {
                        const props = parsed.props as Record<string, unknown>;
                        if (props?.pageProps && typeof props.pageProps === 'object') {
                            const pageProps = props.pageProps as Record<string, unknown>;
                            if (pageProps?.currencyData) {
                                jsonData = pageProps.currencyData;
                            }
                        }
                    }
                } catch {
                    // Not valid JSON, continue with regex
                }
            }

            // Extract data using JSON if available, otherwise use regex patterns
            const info: ScrapedInfo = jsonData ? this.extractFromJSON(jsonData) : {
                country_codes: this.extractCountryCodes(html),
                major_unit_name: this.extractMajorUnitName(html),
                // major_unit_symbol removed - use currencies.symbol instead
                minor_unit_name: this.extractMinorUnitName(html),
                // minor_unit_symbol removed
                minor_unit_value: this.extractMinorUnitValue(html),
                banknotes: this.extractBanknotes(html),
                coins: this.extractCoins(html),
                overview: this.extractOverview(html),
                central_bank: this.extractCentralBank(html)
            };

            // Debug: Test if we can find $20, $50, etc. directly in HTML
            if (code === 'DOP' && (info.banknotes.frequently.length === 0 || info.coins.frequently.length === 0)) {
                const banknotesDebug = html.match(/Banknotes[^]*?Frequently Used[^]*?(?=Rarely Used|Coins)/i);
                if (banknotesDebug) {
                    const testInSection = banknotesDebug[0].match(/\$20|\$50|\$100/g);
                    console.log('  Found in banknotes section:', testInSection);
                    console.log('  Banknotes section length:', banknotesDebug[0].length);
                    console.log('  Banknotes section sample (first 500 chars):', banknotesDebug[0].substring(0, 500));

                    // Test direct match
                    const directMatch = banknotesDebug[0].match(/\$(\d{1,5})/g);
                    console.log('  Direct $XX matches in section:', directMatch);
                }
            }

            // Log extracted data for debugging
            console.log(`  Extracted data for ${code}:`, {
                country_codes: info.country_codes,
                major_unit_name: info.major_unit_name,
                // major_unit_symbol removed - use currencies.symbol instead
                minor_unit_name: info.minor_unit_name,
                // minor_unit_symbol removed
                minor_unit_value: info.minor_unit_value,
                banknotes_frequently: info.banknotes.frequently,
                banknotes_rarely: info.banknotes.rarely,
                coins_frequently: info.coins.frequently,
                coins_rarely: info.coins.rarely,
                overview: info.overview ? `${info.overview.substring(0, 50)}...` : null,
                central_bank: info.central_bank
            });

            return info;
        } catch (error) {
            console.error(`Error scraping ${code}:`, error);
            return null;
        }
    }

    /**
     * Extract data from JSON structure (if available)
     */
    private extractFromJSON(jsonData: unknown): ScrapedInfo {
        // Extract from JSON structure if available
        // Adjust this based on actual JSON structure from dev.me
        const data = jsonData as Record<string, unknown>;
        return {
            country_codes: (data.country_codes as string[]) ||
                ((data.countries as Array<{ code: string }>)?.map((c) => c.code)) || [],
            major_unit_name: ((data.major_unit as { name?: string })?.name) ||
                (data.majorUnitName as string) || null,
            // major_unit_symbol removed - use currencies.symbol instead
            minor_unit_name: ((data.minor_unit as { name?: string })?.name) ||
                (data.minorUnitName as string) || null,
            // minor_unit_symbol removed
            // Explicitly handle 0 - ensure it's saved as 0, not null
            minor_unit_value: (() => {
                const value = ((data.minor_unit as { value?: number })?.value) ??
                    (data.minorUnitValue as number) ?? null;
                // Explicitly return 0 if value is 0
                return value === 0 ? 0 : value;
            })(),
            banknotes: {
                frequently: ((data.banknotes as { frequently?: number[] })?.frequently) ||
                    (data.banknotes_frequently as number[]) || [],
                rarely: ((data.banknotes as { rarely?: number[] })?.rarely) ||
                    (data.banknotes_rarely as number[]) || []
            },
            coins: {
                frequently: ((data.coins as { frequently?: number[] })?.frequently) ||
                    (data.coins_frequently as number[]) || [],
                rarely: ((data.coins as { rarely?: number[] })?.rarely) ||
                    (data.coins_rarely as number[]) || []
            },
            overview: (data.overview as string) || null,
            central_bank: ((data.central_bank as string) ||
                ((data.generalInformation as { centralBank?: string })?.centralBank) ||
                (data.centralBank as string)) || null
        };
    }

    /**
     * Extract country codes from HTML
     */
    private extractCountryCodes(html: string): string[] {
        // Look for country codes in the Countries card
        // Pattern 1: Countries</p><p class="text-xl font-bold">US, AS, GU, MP, ...</p> (multiple codes)
        // Pattern 2: Countries</p><p class="text-xl font-bold">DO</p> (single code)
        // Match the exact structure: Countries followed by </p> then <p class="text-xl font-bold">XX,YY,ZZ</p>
        const countriesMatch = html.match(/Countries<\/p>[\s\S]*?<p[^>]*text-xl[^>]*font-bold[^>]*>([A-Z]{2}(?:,\s*[A-Z]{2})*)<\/p>/i);
        if (countriesMatch) {
            const codes = countriesMatch[1]
                .split(',')
                .map(c => c.trim().toUpperCase())
                .filter(c => c.length === 2);
            if (codes.length > 0) {
                return codes;
            }
        }

        // Alternative: Look for country code in <p class="text-xl font-bold"> after "Countries" (single code)
        const altMatch = html.match(/Countries[\s\S]*?<p[^>]*text-xl[\s\S]*?font-bold[^>]*>([A-Z]{2})<\/p>/i);
        if (altMatch) {
            return [altMatch[1]];
        }

        // Alternative: Look for country code in <p> tag after "Countries"
        const simpleMatch = html.match(/Countries[\s\S]*?<p[^>]*>([A-Z]{2})<\/p>/i);
        if (simpleMatch) {
            return [simpleMatch[1]];
        }

        return [];
    }

    /**
     * Extract major unit name
     */
    private extractMajorUnitName(html: string): string | null {
        // Look for "Major Unit" section, then find the Name value
        // Based on image: "Name: peso" should be in the HTML

        // Look for "Major Unit" section, then "Name:" label
        // Pattern: <span class="text-gray-500">Name:</span> <span class="font-medium">peso</span>
        // Use [\s\S] instead of . with 's' flag for ES2017 compatibility
        const majorUnitMatch = html.match(/Major Unit[\s\S]*?<span[^>]*text-gray-500[^>]*>Name:[^<]*<\/span>[^<]*<span[^>]*font-medium[^>]*>([^<]+)<\/span>/i);
        if (majorUnitMatch) {
            const value = majorUnitMatch[1].trim().toLowerCase();
            if (value && value.length < 50 && !value.includes('http')) {
                return value;
            }
        }

        return null;
    }

    /**
     * Extract major unit symbol
     */
    private extractMajorUnitSymbol(html: string): string | null {
        // Look for "Major Unit" section, then "Symbol:" label, then the value
        // Pattern: <span class="text-gray-500">Symbol:</span> <span class="font-medium text-lg">$</span>
        // Use [\s\S] instead of . with 's' flag for ES2017 compatibility

        // Pattern 1: Look for symbol in <span class="font-medium text-lg">$</span> after Symbol:
        // Match: Major Unit section -> Symbol: -> <span class="font-medium text-lg">VALUE</span>
        const pattern1 = html.match(/Major Unit[\s\S]*?<span[^>]*text-gray-500[^>]*>Symbol:[^<]*<\/span>[\s\S]*?<span[^>]*font-medium[^>]*text-lg[^>]*>([^<]+)<\/span>/i);
        if (pattern1) {
            const value = pattern1[1].trim();
            if (value && value.length < 10 && !value.includes('http') && !value.includes('//')) {
                return value;
            }
        }

        // Pattern 2: Look for symbol after "Symbol:" label (simpler pattern)
        const pattern2 = html.match(/Major Unit[\s\S]*?Symbol[^:]*:\s*([\$€£¥₹₽¢]+)/i);
        if (pattern2) {
            return pattern2[1].trim();
        }

        // Pattern 3: Look for symbol in structured format
        const pattern3 = html.match(/Major Unit[\s\S]*?Symbol[^>]*>([\$€£¥₹₽¢]{1,5})</i);
        if (pattern3) {
            return pattern3[1].trim();
        }

        return null;
    }

    /**
     * Extract minor unit name
     */
    private extractMinorUnitName(html: string): string | null {
        // Look for "Minor Unit" section, then find the Name value
        // Based on image: "Name: centavo" should be in the HTML

        // Look for "Minor Unit" section, then "Name:" label
        // Pattern: <span class="text-gray-500">Name:</span> <span class="font-medium">centavo</span>
        // Use [\s\S] instead of . with 's' flag for ES2017 compatibility
        const minorUnitMatch = html.match(/Minor Unit[\s\S]*?<span[^>]*text-gray-500[^>]*>Name:[^<]*<\/span>[^<]*<span[^>]*font-medium[^>]*>([^<]+)<\/span>/i);
        if (minorUnitMatch) {
            const value = minorUnitMatch[1].trim().toLowerCase();
            if (value && value.length < 50 && !value.includes('http')) {
                return value;
            }
        }

        return null;
    }

    /**
     * Extract minor unit symbol
     */
    private extractMinorUnitSymbol(html: string): string | null {
        // Look for "Minor Unit" section, then "Symbol:" label, then the value (may be empty)
        // Pattern: <span class="text-gray-500">Symbol:</span> <span class="font-medium text-lg"></span> (empty)
        // Use [\s\S] instead of . with 's' flag for ES2017 compatibility

        // Pattern 1: Look for symbol in <span class="font-medium text-lg">...</span> after Symbol:
        // Match: Minor Unit section -> Symbol: -> <span class="font-medium text-lg">VALUE or empty</span>
        const pattern1 = html.match(/Minor Unit[\s\S]*?<span[^>]*text-gray-500[^>]*>Symbol:[^<]*<\/span>[\s\S]*?<span[^>]*font-medium[^>]*text-lg[^>]*>([^<]*)<\/span>/i);
        if (pattern1) {
            const value = pattern1[1].trim();
            // Return empty string if no symbol, or the symbol if valid
            if (!value.includes('http') && !value.includes('//') && value.length < 20) {
                return value || '';
            }
        }

        // Pattern 2: Look for symbol in <div> after Symbol:
        const pattern2 = html.match(/Minor Unit[\s\S]*?Symbol[^>]*>([^<]*?)<\/div>/i);
        if (pattern2) {
            const value = pattern2[1].trim();
            if (!value.includes('http') && !value.includes('//') && value.length < 20) {
                return value || '';
            }
        }

        // Pattern 3: Look for symbol after "Symbol:" label
        const pattern3 = html.match(/Minor Unit[\s\S]*?Symbol[^:]*:\s*([\$€£¥₹₽¢]*)/i);
        if (pattern3) {
            const value = pattern3[1].trim();
            if (!value.includes('http') && !value.includes('//') && value.length < 20) {
                return value || '';
            }
        }

        return '';
    }

    /**
     * Extract minor unit value
     */
    private extractMinorUnitValue(html: string): number | null {
        // Look for "Minor Unit" section, then "Value:" label, then the number
        // Pattern: Minor Unit section -> Value label -> 0.01 or 0
        // Use [\s\S] instead of . with 's' flag for ES2017 compatibility
        const match = html.match(/Minor Unit[\s\S]*?Value[^>]*>([\d.]+?)<\/div>/i) ||
            html.match(/Minor Unit[\s\S]*?Value[^:]*:\s*<strong[^>]*>([\d.]+)<\/strong>/i) ||
            html.match(/Minor Unit[\s\S]*?Value[^:]*:\s*([\d.]+)/i);
        if (match) {
            const valueStr = match[1];
            const value = parseFloat(valueStr);
            // Allow 0 and values in valid range (0 <= value < 1)
            // Explicitly check for 0 as a string to ensure we capture it
            if (valueStr === '0' || valueStr === '0.0' || valueStr === '0.00') {
                return 0;
            }
            if (!isNaN(value) && value > 0 && value < 1) {
                return value;
            }
        }
        return null;
    }

    /**
     * Extract banknotes (frequently and rarely used)
     */
    private extractBanknotes(html: string): { frequently: number[]; rarely: number[] } {
        const frequently: number[] = [];
        const rarely: number[] = [];

        // Look for Banknotes section
        // Frequently Used: <span class="px-3 py-1 bg-green-100...">$XX</span>
        // Rarely Used: <span class="px-3 py-1 bg-gray-100...">$XX</span>

        // Extract frequently used banknotes (bg-green-100) - but only in Banknotes section
        const banknotesSection = html.match(/Banknotes[\s\S]*?(?=Coins|Plural|Overview)/i);
        if (banknotesSection) {
            // Extract frequently used banknotes (bg-green-100)
            // Pattern: <span...bg-green-100...>SYMBOLXX</span> or <span...bg-green-100...>XXSYMBOL</span>
            // Match any currency symbol (not just $, €, £, etc.) - capture the number regardless of symbol
            // More flexible: captures any non-digit character(s) before/after the number
            // Examples: $5, €5, £5, 5€, 5$, R$5, ¥5, etc.
            const frequentlyRegex = /<span[^>]*bg-green-100[^>]*>([^\d]*?)(\d+)([^\d]*?)<\/span>/gi;
            let match: RegExpExecArray | null;
            while ((match = frequentlyRegex.exec(banknotesSection[0])) !== null) {
                // match[1] = optional non-digit chars before, match[2] = number, match[3] = optional non-digit chars after
                const numStr = match[2]; // The number is always in group 2
                if (numStr) {
                    const num = parseInt(numStr, 10);
                    // Include all banknote values (no upper limit)
                    if (num >= 1 && !frequently.includes(num)) {
                        frequently.push(num);
                    }
                }
            }
            frequently.sort((a, b) => a - b);

            // Extract rarely used banknotes (bg-gray-100) - but only in the Banknotes section
            // Pattern: <span...bg-gray-100...>SYMBOLXX</span> or <span...bg-gray-100...>XXSYMBOL</span>
            // Match any currency symbol - more flexible to handle any symbol
            const rarelyRegex = /<span[^>]*bg-gray-100[^>]*>([^\d]*?)(\d+)([^\d]*?)<\/span>/gi;
            while ((match = rarelyRegex.exec(banknotesSection[0])) !== null) {
                // match[1] = optional non-digit chars before, match[2] = number, match[3] = optional non-digit chars after
                const numStr = match[2]; // The number is always in group 2
                if (numStr) {
                    const num = parseInt(numStr, 10);
                    // Include all banknote values (no upper limit)
                    if (num >= 1 && !rarely.includes(num)) {
                        rarely.push(num);
                    }
                }
            }
            rarely.sort((a, b) => a - b);
        }

        return { frequently, rarely };
    }

    /**
     * Extract coins (frequently and rarely used)
     */
    private extractCoins(html: string): { frequently: number[]; rarely: number[] } {
        const frequently: number[] = [];
        const rarely: number[] = [];

        // Look for Coins section
        // Frequently Used: <span class="px-3 py-1 bg-yellow-100...">1¢</span>
        // Rarely Used: <span class="px-3 py-1 bg-gray-100...">50¢, $1</span>

        // Extract frequently used coins (bg-yellow-100) - can be in format $1, $5 or 1¢, 5¢
        // First, find the Coins section to limit search scope
        const coinsStart = html.indexOf('Coins');
        const coinsEnd = Math.min(
            html.indexOf('Plural Forms', coinsStart) > 0 ? html.indexOf('Plural Forms', coinsStart) : Infinity,
            html.indexOf('Overview', coinsStart) > 0 ? html.indexOf('Overview', coinsStart) : Infinity,
            html.indexOf('</div>', coinsStart + 5000) > 0 ? html.indexOf('</div>', coinsStart + 5000) : Infinity
        );
        const coinsSection = coinsStart >= 0 && coinsEnd < Infinity
            ? html.substring(coinsStart, coinsEnd)
            : html.match(/Coins[\s\S]*?(?=Plural|Overview|<\/)/i)?.[0] || '';

        if (coinsSection) {
            // Extract frequently used coins (bg-yellow-100)
            // Pattern: <span...bg-yellow-100...>1¢</span> or <span...bg-yellow-100...>$1</span> or <span...bg-yellow-100...>€1</span> or <span...bg-yellow-100...>5c</span>
            // Match formats: 1¢, 5¢, 10¢, 25¢, $1, €1, €2, 5c, 10c, 20c, 50c, 1c, 2c, R$1, ¥5, etc.
            // More flexible: captures any non-digit character(s) before/after the number
            // This handles ANY currency symbol, not just the ones we know about
            const frequentlyRegex = /<span[^>]*bg-yellow-100[^>]*>([^\d]*?)(\d+)([^\d]*?)<\/span>/gi;
            let match: RegExpExecArray | null;
            while ((match = frequentlyRegex.exec(coinsSection)) !== null) {
                // match[1] = optional non-digit chars before, match[2] = number, match[3] = optional non-digit chars after
                const numStr = match[2]; // The number is always in group 2
                if (numStr) {
                    const num = parseInt(numStr, 10);
                    // Include all coin values (no upper limit)
                    if (num >= 1 && !frequently.includes(num)) {
                        frequently.push(num);
                    }
                }
            }
            frequently.sort((a, b) => a - b);

            // Extract rarely used coins (bg-gray-100) - can be 50¢, $1, €1, 1c, 2c, etc.
            // Pattern: <span...bg-gray-100...>50¢</span> or <span...bg-gray-100...>$1</span> or <span...bg-gray-100...>€1</span> or <span...bg-gray-100...>1c</span>
            // Match formats: 50¢, $1, €1, 1c, 2c, R$1, ¥5, etc.
            // IMPORTANT: Only search within the Coins section, not Banknotes section
            // More flexible: captures any non-digit character(s) before/after the number
            // This handles ANY currency symbol, not just the ones we know about
            const rarelyRegex = /<span[^>]*bg-gray-100[^>]*>([^\d]*?)(\d+)([^\d]*?)<\/span>/gi;
            while ((match = rarelyRegex.exec(coinsSection)) !== null) {
                // match[1] = optional non-digit chars before, match[2] = number, match[3] = optional non-digit chars after
                const numStr = match[2]; // The number is always in group 2
                if (numStr) {
                    const num = parseInt(numStr, 10);
                    // Include all coin values (no upper limit)
                    if (num >= 1 && !rarely.includes(num)) {
                        rarely.push(num);
                    }
                }
            }
            rarely.sort((a, b) => a - b);
        }

        return { frequently, rarely };
    }

    /**
     * Extract overview text
     */
    private extractOverview(html: string): string | null {
        // Look for "Overview" section, then get the paragraph text
        // Pattern: Overview heading -> div.prose or paragraph text (avoiding ads and other sections)
        // Use [\s\S] instead of . with 's' flag for ES2017 compatibility

        // Pattern 1: Look for <h2>Overview</h2> followed by <div class="prose">
        const pattern1 = html.match(/<h2[^>]*>Overview<\/h2>[\s\S]*?<div[^>]*class[^>]*prose[^>]*>([\s\S]*?)<\/div>/i);
        if (pattern1 && pattern1[1]) {
            const text = pattern1[1]
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (this.isValidOverviewText(text)) {
                return text;
            }
        }

        // Pattern 2: Look for <h2>Overview</h2> followed by <p>
        const pattern2 = html.match(/<h2[^>]*>Overview<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
        if (pattern2 && pattern2[1]) {
            const text = pattern2[1]
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (this.isValidOverviewText(text)) {
                return text;
            }
        }

        // Pattern 3: Look for Overview section between h2 tags, then find prose div or paragraph
        const overviewSection = html.match(/<h2[^>]*>Overview<\/h2>[\s\S]*?(?=<h2|<h3|##|Economy|History|General Information|CORE APIS)/i);
        if (overviewSection) {
            const sectionText = overviewSection[0];
            // Try prose div first (common in Next.js/Tailwind)
            const proseMatch = sectionText.match(/<div[^>]*class[^>]*prose[^>]*>([\s\S]*?)<\/div>/i);
            if (proseMatch && proseMatch[1]) {
                const text = proseMatch[1]
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                if (this.isValidOverviewText(text)) {
                    return text;
                }
            }
            // Fallback to paragraph
            const paragraphMatch = sectionText.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
            if (paragraphMatch && paragraphMatch[1]) {
                const text = paragraphMatch[1]
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                if (this.isValidOverviewText(text)) {
                    return text;
                }
            }
        }

        return null;
    }

    /**
     * Validate overview text (filter out ads and invalid content)
     */
    private isValidOverviewText(text: string): boolean {
        if (!text) return false;
        return text.length > 20 &&
            text.length < 2000 &&
            !text.match(/\$\d+\/mo/) && // Filter pricing ads like "$49/mo"
            !text.includes('API Documentation') &&
            !text.includes('Email Validation API') &&
            !text.includes('CORE APIS') &&
            !text.includes('DEVELOPERS') &&
            !text.includes('LICENSING') &&
            !text.match(/^\d+$/);
    }

    /**
     * Extract central bank name
     */
    private extractCentralBank(html: string): string | null {
        // Look for "Central Bank:" label in General Information section
        // Pattern: Central Bank: -> value (avoiding ads and pricing)
        // Use [\s\S] instead of . with 's' flag for ES2017 compatibility

        // First, find the General Information section to avoid ads
        const generalInfoSection = html.match(/General Information[\s\S]*?(?=CORE APIS|DEVELOPERS|COMPANY|<\/div>|<\/ul>)/i);
        if (generalInfoSection) {
            // Look for Central Bank in the General Information section
            // Pattern 1: <li>Central Bank: Bank of Uganda</li>
            const pattern1 = generalInfoSection[0].match(/<li[^>]*>Central Bank[^:]*:\s*([^<]+)<\/li>/i);
            if (pattern1 && pattern1[1]) {
                const value = pattern1[1].trim().replace(/\s*\([^)]*\)\s*/g, '').trim();
                if (this.isValidCentralBankText(value)) {
                    return value;
                }
            }

            // Pattern 2: Central Bank: <strong>Bank of Uganda</strong>
            const pattern2 = generalInfoSection[0].match(/Central Bank[^:]*:[\s\S]*?<strong[^>]*>([^<]+)<\/strong>/i);
            if (pattern2 && pattern2[1]) {
                const value = pattern2[1].trim().replace(/\s*\([^)]*\)\s*/g, '').trim();
                if (this.isValidCentralBankText(value)) {
                    return value;
                }
            }

            // Pattern 3: Central Bank: <span>Bank of Uganda</span>
            const pattern3 = generalInfoSection[0].match(/Central Bank[^:]*:[\s\S]*?<span[^>]*>([^<]+)<\/span>/i);
            if (pattern3 && pattern3[1]) {
                const value = pattern3[1].trim().replace(/\s*\([^)]*\)\s*/g, '').trim();
                if (this.isValidCentralBankText(value)) {
                    return value;
                }
            }

            // Pattern 4: Central Bank: Bank of Uganda (plain text)
            const pattern4 = generalInfoSection[0].match(/Central Bank[^:]*:\s*([^\n<]+)/i);
            if (pattern4 && pattern4[1]) {
                const value = pattern4[1].trim().replace(/\s*\([^)]*\)\s*/g, '').trim();
                if (this.isValidCentralBankText(value)) {
                    return value;
                }
            }
        }

        // Fallback: try to find it anywhere but with stricter filters
        const fallbackMatch = html.match(/Central Bank[^:]*:[\s\S]*?<strong[^>]*>([^<]+)<\/strong>/i) ||
            html.match(/Central Bank[^:]*:[\s\S]*?<span[^>]*>([^<]+)<\/span>/i) ||
            html.match(/<li[^>]*>Central Bank[^:]*:\s*([^<]+)<\/li>/i);
        if (fallbackMatch) {
            const value = (fallbackMatch[1] || fallbackMatch[2] || fallbackMatch[3] || '').trim().replace(/\s*\([^)]*\)\s*/g, '').trim();
            if (this.isValidCentralBankText(value)) {
                return value;
            }
        }
        return null;
    }

    /**
     * Validate central bank text (filter out ads and invalid content)
     */
    private isValidCentralBankText(text: string): boolean {
        if (!text) return false;
        return text.length > 3 &&
            text.length < 200 &&
            !text.includes('http') &&
            !text.includes('$') &&
            !text.includes('mo') &&
            !text.includes('API') &&
            !text.match(/^\d+$/);
    }

    /**
     * Save scraped info to database
     */
    async saveInfo(currencyId: number, info: ScrapedInfo): Promise<boolean> {
        try {
            // Check if info already exists
            const { data: existing } = await this.supabase
                .from('info')
                .select('id')
                .eq('currency_id', currencyId)
                .single();

            const data = {
                currency_id: currencyId,
                country_codes: info.country_codes,
                major_unit_name: info.major_unit_name,
                // major_unit_symbol removed - use currencies.symbol instead
                minor_unit_name: info.minor_unit_name,
                // minor_unit_symbol removed
                // Explicitly ensure 0 is saved as 0, not null
                minor_unit_value: info.minor_unit_value === 0 ? 0 : (info.minor_unit_value ?? null),
                banknotes: info.banknotes,
                coins: info.coins,
                overview: info.overview ? info.overview.toLowerCase() : null,
                central_bank: info.central_bank ? info.central_bank.replace(/\s*\([^)]*\)\s*/g, '').trim().toLowerCase() : null
            };

            if (existing) {
                // Update existing
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await (this.supabase as any)
                    .from('info')
                    .update(data)
                    .eq('currency_id', currencyId);

                if (error) throw error;
                console.log(`  ✓ Updated info for currency_id ${currencyId}`);
            } else {
                // Insert new
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await (this.supabase as any)
                    .from('info')
                    .insert(data);

                if (error) throw error;
                console.log(`  ✓ Inserted info for currency_id ${currencyId}`);
            }

            return true;
        } catch (error) {
            console.error(`  ✗ Error saving info for currency_id ${currencyId}:`, error);
            return false;
        }
    }

    /**
     * Check if an info record is null/empty (should be re-scraped)
     */
    private isInfoEmpty(info: {
        country_codes?: string[] | null;
        major_unit_name?: string | null;
        banknotes?: { frequently?: number[]; rarely?: number[] } | null;
        coins?: { frequently?: number[]; rarely?: number[] } | null;
    } | null): boolean {
        if (!info) return true;

        const hasCountryCodes = info.country_codes &&
            Array.isArray(info.country_codes) &&
            info.country_codes.length > 0;

        const hasMajorUnit = info.major_unit_name && info.major_unit_name.trim() !== '';

        const hasBanknotes = info.banknotes && (
            (info.banknotes.frequently && info.banknotes.frequently.length > 0) ||
            (info.banknotes.rarely && info.banknotes.rarely.length > 0)
        );

        const hasCoins = info.coins && (
            (info.coins.frequently && info.coins.frequently.length > 0) ||
            (info.coins.rarely && info.coins.rarely.length > 0)
        );

        // Return true if ALL fields are empty/null
        return !hasCountryCodes && !hasMajorUnit && !hasBanknotes && !hasCoins;
    }

    /**
     * Process a single currency
     */
    async processCurrency(code: string): Promise<void> {
        // Get currency from database
        const { data: currency, error } = await this.supabase
            .from('currencies')
            .select('id, code')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !currency) {
            console.error(`Currency ${code} not found in database`);
            return;
        }

        // Type assertion for currency
        const currencyData = currency as { id: number; code: string };

        // Check if info already exists
        const { data: existingInfo } = await this.supabase
            .from('info')
            .select('*')
            .eq('currency_id', currencyData.id)
            .single();

        // Scrape info (always scrape to check for updates)
        const info = await this.scrapeCurrencyInfo(code);
        if (!info) {
            console.error(`Failed to scrape info for ${code}`);
            return;
        }

        // Check if scraped info is empty/null - don't insert null records
        if (this.isInfoEmpty(info)) {
            if (existingInfo) {
                console.log(`  ⏭️  Skipping ${code} - scraped info is empty/null, keeping existing record`);
            } else {
                console.log(`  ⏭️  Skipping ${code} - scraped info is empty/null, not inserting`);
            }
            return;
        }

        // If info exists and has data, check if we need to update
        if (existingInfo && !this.isInfoEmpty(existingInfo)) {
            // Type assertion for existingInfo
            const existingInfoData = existingInfo as {
                minor_unit_value: number | null;
                overview: string | null;
                central_bank: string | null;
                [key: string]: unknown;
            };
            // Check if any field needs updating
            // Compare overview and central_bank in lowercase (we save them in lowercase)
            const existingOverviewLower = (existingInfoData.overview || '').toLowerCase();
            const existingCentralBankLower = (existingInfoData.central_bank || '').toLowerCase();
            const newOverviewLower = (info.overview || '').toLowerCase();
            const newCentralBankLower = (info.central_bank || '').toLowerCase();

            const needsUpdate =
                existingInfoData.minor_unit_value !== info.minor_unit_value ||
                existingOverviewLower !== newOverviewLower ||
                existingCentralBankLower !== newCentralBankLower;
            if (needsUpdate) {
                const changes: string[] = [];
                if (existingInfoData.minor_unit_value !== info.minor_unit_value) {
                    changes.push(`minor_unit_value: ${existingInfoData.minor_unit_value} → ${info.minor_unit_value}`);
                }
                if ((existingInfoData.overview || '').toLowerCase() !== (info.overview || '').toLowerCase()) {
                    changes.push(`overview: ${existingInfoData.overview ? 'exists' : 'null'} → ${info.overview ? 'exists' : 'null'}`);
                }
                if ((existingInfoData.central_bank || '').toLowerCase() !== (info.central_bank || '').toLowerCase()) {
                    changes.push(`central_bank: ${existingInfoData.central_bank || 'null'} → ${info.central_bank || 'null'}`);
                }
                console.log(`  ↻ Updating ${code} - ${changes.join(', ')}`);
            } else {
                console.log(`  ⏭️  Skipping ${code} - info already exists with same data`);
                return;
            }
        }

        // Save to database (insert new or update existing)
        await this.saveInfo(currencyData.id, info);

        // Rate limiting
        await this.delay(this.delayMs);
    }

    /**
     * Process all active currencies
     */
    async processAll(): Promise<void> {
        const { data: currencies, error } = await this.supabase
            .from('currencies')
            .select('code')
            .eq('is_active', true)
            .order('code');

        if (error || !currencies) {
            throw new Error(`Failed to load currencies: ${error?.message || 'Unknown error'}`);
        }

        console.log(`Processing ${currencies.length} currencies...\n`);

        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i] as { code: string };
            console.log(`[${i + 1}/${currencies.length}] Processing ${currency.code}...`);
            await this.processCurrency(currency.code);
        }

        console.log('\n✓ Scraping completed');
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Main execution
async function main() {
    try {
        const scraper = new CurrencyInfoScraper();

        const code = process.argv[2];
        if (code) {
            await scraper.processCurrency(code);
        } else {
            await scraper.processAll();
        }
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();


