import { NextResponse } from 'next/server';

interface ExchangeRateResponse {
  success: boolean;
  data?: {
    from: string;
    to: string;
    rate: number;
    timestamp: Date;
    source: string;
  };
  error?: string;
}

// Scrape Banco Central de República Dominicana
async function scrapeBancoCentral(): Promise<ExchangeRateResponse> {
  try {
    const response = await fetch('https://www.bancentral.gov.do/a/d/2545-tasa-de-cambio', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse HTML to extract exchange rate
    // Look for patterns like "USD/DOP: 62.50" or similar
    const rateMatch = html.match(/(?:USD|DOP|dólar|peso).*?(\d+\.?\d*)/i);
    
    if (rateMatch) {
      const rate = parseFloat(rateMatch[1]);
      if (rate > 0 && rate < 1000) { // Sanity check
        return {
          success: true,
          data: {
            from: 'USD',
            to: 'DOP',
            rate: rate,
            timestamp: new Date(),
            source: 'Banco Central RD (scraped)'
          }
        };
      }
    }

    // Fallback: try to find any number that looks like an exchange rate
    const numberMatches = html.match(/\b(\d{2}\.?\d{0,2})\b/g);
    if (numberMatches) {
      for (const match of numberMatches) {
        const rate = parseFloat(match);
        if (rate >= 50 && rate <= 80) { // Reasonable range for USD/DOP
          return {
            success: true,
            data: {
              from: 'USD',
              to: 'DOP',
              rate: rate,
              timestamp: new Date(),
              source: 'Banco Central RD (scraped)'
            }
          };
        }
      }
    }

    throw new Error('Could not extract exchange rate from HTML');

  } catch (error) {
    console.error('Banco Central scraping error:', error);
    throw error;
  }
}

// Alternative: Fetch from ExchangeRate-API
async function fetchFromExchangeRateAPI(): Promise<ExchangeRateResponse> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (data.rates && data.rates.DOP) {
      return {
        success: true,
        data: {
          from: 'USD',
          to: 'DOP',
          rate: data.rates.DOP,
          timestamp: new Date(),
          source: 'ExchangeRate-API'
        }
      };
    }
    throw new Error('DOP rate not found');
  } catch (error) {
    throw new Error(`ExchangeRate-API failed: ${error}`);
  }
}

export async function GET() {
  try {
    // Try Banco Central first
    try {
      const result = await scrapeBancoCentral();
      if (result.success) {
        return NextResponse.json(result);
      }
    } catch (error) {
      console.warn('Banco Central scraping failed, trying fallback:', error);
    }

    // Fallback to ExchangeRate-API
    try {
      const result = await fetchFromExchangeRateAPI();
      if (result.success) {
        return NextResponse.json(result);
      }
    } catch (error) {
      console.warn('ExchangeRate-API failed, using fallback rate:', error);
    }

    // Final fallback
    const fallbackRate = {
      success: true,
      data: {
        from: 'USD',
        to: 'DOP',
        rate: 62.00,
        timestamp: new Date(),
        source: 'fallback'
      }
    };

    return NextResponse.json(fallbackRate);

  } catch {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch exchange rate from all sources' 
      },
      { status: 500 }
    );
  }
}
