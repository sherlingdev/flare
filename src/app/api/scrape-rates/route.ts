import { NextRequest, NextResponse } from 'next/server';
import { scrapeBaseRatesAndCalculateAll } from '../../../lib/scraper';

// Netlify function configuration
export const config = {
    maxDuration: 60, // 60 seconds timeout for Netlify
};

export async function GET(request: NextRequest) {
    try {
        console.log('🚀 Starting complete XE.com rates scraping...');

        const rates = await scrapeBaseRatesAndCalculateAll();

        return NextResponse.json({
            success: true,
            count: Object.keys(rates).length,
            rates: rates,
            message: `Successfully scraped ${Object.keys(rates).length} rates from XE.com`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in complete XE scraping:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to complete XE.com scraping',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
