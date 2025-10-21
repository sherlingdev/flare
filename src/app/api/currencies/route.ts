import { NextResponse } from 'next/server';
import { scrapeSpecificXERates, getAllCurrencyCodes } from '../../../lib/scraper';

// Netlify function configuration
export const config = {
    maxDuration: 120, // 120 seconds timeout for Netlify (increased for all currencies)
};

export async function GET() {
    try {
        console.log('📋 Getting currencies with automatic pair generation...');

        // Get all currency codes from XE.com
        console.log('🌍 Getting all currency codes from XE.com...');
        const allCurrencyCodes = await getAllCurrencyCodes();
        console.log(`📊 Found ${allCurrencyCodes.length} currencies:`, allCurrencyCodes);

        // Create currency data structure for all found currencies
        const currencyData: Record<string, { name: string; symbol: string; flag: string }> = {};

        // Known currency info (expandable)
        const knownCurrencies: Record<string, { name: string; symbol: string; flag: string }> = {
            'USD': { name: 'US Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/usd.static.svg' },
            'EUR': { name: 'Euro', symbol: '€', flag: 'https://www.xe.com/svgs/flags/eur.static.svg' },
            'CAD': { name: 'Canadian Dollar', symbol: 'C$', flag: 'https://www.xe.com/svgs/flags/cad.static.svg' },
            'CHF': { name: 'Swiss Franc', symbol: 'CHF', flag: 'https://www.xe.com/svgs/flags/chf.static.svg' },
            'GBP': { name: 'British Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/gbp.static.svg' },
            'AED': { name: 'AED', symbol: 'AED', flag: 'https://www.xe.com/svgs/flags/aed.static.svg' },
            'AFN': { name: 'AFN', symbol: 'AFN', flag: 'https://www.xe.com/svgs/flags/afn.static.svg' },
            'ALL': { name: 'ALL', symbol: 'ALL', flag: 'https://www.xe.com/svgs/flags/all.static.svg' },
            'AMD': { name: 'AMD', symbol: 'AMD', flag: 'https://www.xe.com/svgs/flags/amd.static.svg' },
            'ANG': { name: 'ANG', symbol: 'ANG', flag: 'https://www.xe.com/svgs/flags/ang.static.svg' },
            'AOA': { name: 'AOA', symbol: 'AOA', flag: 'https://www.xe.com/svgs/flags/aoa.static.svg' },
            'ARS': { name: 'ARS', symbol: 'ARS', flag: 'https://www.xe.com/svgs/flags/ars.static.svg' },
            'AUD': { name: 'Australian Dollar', symbol: 'A$', flag: 'https://www.xe.com/svgs/flags/aud.static.svg' },
            'AWG': { name: 'AWG', symbol: 'AWG', flag: 'https://www.xe.com/svgs/flags/awg.static.svg' },
            'AZN': { name: 'AZN', symbol: 'AZN', flag: 'https://www.xe.com/svgs/flags/azn.static.svg' },
            'BAM': { name: 'BAM', symbol: 'BAM', flag: 'https://www.xe.com/svgs/flags/bam.static.svg' },
            'BBD': { name: 'BBD', symbol: 'BBD', flag: 'https://www.xe.com/svgs/flags/bbd.static.svg' },
            'BDT': { name: 'BDT', symbol: 'BDT', flag: 'https://www.xe.com/svgs/flags/bdt.static.svg' },
            'BGN': { name: 'BGN', symbol: 'BGN', flag: 'https://www.xe.com/svgs/flags/bgn.static.svg' },
            'BHD': { name: 'BHD', symbol: 'BHD', flag: 'https://www.xe.com/svgs/flags/bhd.static.svg' },
            'BIF': { name: 'BIF', symbol: 'BIF', flag: 'https://www.xe.com/svgs/flags/bif.static.svg' },
            'BMD': { name: 'BMD', symbol: 'BMD', flag: 'https://www.xe.com/svgs/flags/bmd.static.svg' },
            'BND': { name: 'BND', symbol: 'BND', flag: 'https://www.xe.com/svgs/flags/bnd.static.svg' },
            'BOB': { name: 'BOB', symbol: 'BOB', flag: 'https://www.xe.com/svgs/flags/bob.static.svg' },
            'BRL': { name: 'Brazilian Real', symbol: 'R$', flag: 'https://www.xe.com/svgs/flags/brl.static.svg' },
            'BTN': { name: 'BTN', symbol: 'BTN', flag: 'https://www.xe.com/svgs/flags/btn.static.svg' },
            'BWP': { name: 'BWP', symbol: 'BWP', flag: 'https://www.xe.com/svgs/flags/bwp.static.svg' },
            'BYN': { name: 'BYN', symbol: 'BYN', flag: 'https://www.xe.com/svgs/flags/byn.static.svg' },
            'BZD': { name: 'BZD', symbol: 'BZD', flag: 'https://www.xe.com/svgs/flags/bzd.static.svg' },
            'CDF': { name: 'CDF', symbol: 'CDF', flag: 'https://www.xe.com/svgs/flags/cdf.static.svg' },
            'CLP': { name: 'CLP', symbol: 'CLP', flag: 'https://www.xe.com/svgs/flags/clp.static.svg' },
            'CNY': { name: 'Chinese Yuan', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/cny.static.svg' },
            'COP': { name: 'COP', symbol: 'COP', flag: 'https://www.xe.com/svgs/flags/cop.static.svg' },
            'CRC': { name: 'CRC', symbol: 'CRC', flag: 'https://www.xe.com/svgs/flags/crc.static.svg' },
            'CZK': { name: 'CZK', symbol: 'CZK', flag: 'https://www.xe.com/svgs/flags/czk.static.svg' },
            'DJF': { name: 'DJF', symbol: 'DJF', flag: 'https://www.xe.com/svgs/flags/djf.static.svg' },
            'DOP': { name: 'Dominican Peso', symbol: 'RD$', flag: 'https://www.xe.com/svgs/flags/dop.static.svg' },
            'DZD': { name: 'DZD', symbol: 'DZD', flag: 'https://www.xe.com/svgs/flags/dzd.static.svg' },
            'EGP': { name: 'EGP', symbol: 'EGP', flag: 'https://www.xe.com/svgs/flags/egp.static.svg' },
            'ETB': { name: 'ETB', symbol: 'ETB', flag: 'https://www.xe.com/svgs/flags/etb.static.svg' },
            'FJD': { name: 'FJD', symbol: 'FJD', flag: 'https://www.xe.com/svgs/flags/fjd.static.svg' },
            'GEL': { name: 'GEL', symbol: 'GEL', flag: 'https://www.xe.com/svgs/flags/gel.static.svg' },
            'GTQ': { name: 'GTQ', symbol: 'GTQ', flag: 'https://www.xe.com/svgs/flags/gtq.static.svg' },
            'GYD': { name: 'GYD', symbol: 'GYD', flag: 'https://www.xe.com/svgs/flags/gyd.static.svg' },
            'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$', flag: 'https://www.xe.com/svgs/flags/hkd.static.svg' },
            'HNL': { name: 'HNL', symbol: 'HNL', flag: 'https://www.xe.com/svgs/flags/hnl.static.svg' },
            'HRK': { name: 'HRK', symbol: 'HRK', flag: 'https://www.xe.com/svgs/flags/hrk.static.svg' },
            'HUF': { name: 'HUF', symbol: 'HUF', flag: 'https://www.xe.com/svgs/flags/huf.static.svg' },
            'IDR': { name: 'IDR', symbol: 'IDR', flag: 'https://www.xe.com/svgs/flags/idr.static.svg' },
            'ILS': { name: 'ILS', symbol: 'ILS', flag: 'https://www.xe.com/svgs/flags/ils.static.svg' },
            'INR': { name: 'Indian Rupee', symbol: '₹', flag: 'https://www.xe.com/svgs/flags/inr.static.svg' },
            'IQD': { name: 'IQD', symbol: 'IQD', flag: 'https://www.xe.com/svgs/flags/iqd.static.svg' },
            'IRR': { name: 'IRR', symbol: 'IRR', flag: 'https://www.xe.com/svgs/flags/irr.static.svg' },
            'JMD': { name: 'JMD', symbol: 'JMD', flag: 'https://www.xe.com/svgs/flags/jmd.static.svg' },
            'JOD': { name: 'JOD', symbol: 'JOD', flag: 'https://www.xe.com/svgs/flags/jod.static.svg' },
            'JPY': { name: 'Japanese Yen', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/jpy.static.svg' },
            'KES': { name: 'KES', symbol: 'KES', flag: 'https://www.xe.com/svgs/flags/kes.static.svg' },
            'KGS': { name: 'KGS', symbol: 'KGS', flag: 'https://www.xe.com/svgs/flags/kgs.static.svg' },
            'KHR': { name: 'KHR', symbol: 'KHR', flag: 'https://www.xe.com/svgs/flags/khr.static.svg' },
            'KMF': { name: 'KMF', symbol: 'KMF', flag: 'https://www.xe.com/svgs/flags/kmf.static.svg' },
            'KRW': { name: 'South Korean Won', symbol: '₩', flag: 'https://www.xe.com/svgs/flags/krw.static.svg' },
            'KWD': { name: 'KWD', symbol: 'KWD', flag: 'https://www.xe.com/svgs/flags/kwd.static.svg' },
            'KYD': { name: 'KYD', symbol: 'KYD', flag: 'https://www.xe.com/svgs/flags/kyd.static.svg' },
            'KZT': { name: 'KZT', symbol: 'KZT', flag: 'https://www.xe.com/svgs/flags/kzt.static.svg' },
            'LAK': { name: 'LAK', symbol: 'LAK', flag: 'https://www.xe.com/svgs/flags/lak.static.svg' },
            'LBP': { name: 'LBP', symbol: 'LBP', flag: 'https://www.xe.com/svgs/flags/lbp.static.svg' },
            'LKR': { name: 'LKR', symbol: 'LKR', flag: 'https://www.xe.com/svgs/flags/lkr.static.svg' },
            'LSL': { name: 'LSL', symbol: 'LSL', flag: 'https://www.xe.com/svgs/flags/lsl.static.svg' },
            'LYD': { name: 'LYD', symbol: 'LYD', flag: 'https://www.xe.com/svgs/flags/lyd.static.svg' },
            'MAD': { name: 'MAD', symbol: 'MAD', flag: 'https://www.xe.com/svgs/flags/mad.static.svg' },
            'MDL': { name: 'MDL', symbol: 'MDL', flag: 'https://www.xe.com/svgs/flags/mdl.static.svg' },
            'MGA': { name: 'MGA', symbol: 'MGA', flag: 'https://www.xe.com/svgs/flags/mga.static.svg' },
            'MKD': { name: 'MKD', symbol: 'MKD', flag: 'https://www.xe.com/svgs/flags/mkd.static.svg' },
            'MNT': { name: 'MNT', symbol: 'MNT', flag: 'https://www.xe.com/svgs/flags/mnt.static.svg' },
            'MOP': { name: 'MOP', symbol: 'MOP', flag: 'https://www.xe.com/svgs/flags/mop.static.svg' },
            'MUR': { name: 'MUR', symbol: 'MUR', flag: 'https://www.xe.com/svgs/flags/mur.static.svg' },
            'MVR': { name: 'MVR', symbol: 'MVR', flag: 'https://www.xe.com/svgs/flags/mvr.static.svg' },
            'MXN': { name: 'Mexican Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/mxn.static.svg' },
            'MYR': { name: 'MYR', symbol: 'MYR', flag: 'https://www.xe.com/svgs/flags/myr.static.svg' },
            'MZN': { name: 'MZN', symbol: 'MZN', flag: 'https://www.xe.com/svgs/flags/mzn.static.svg' },
            'NIO': { name: 'NIO', symbol: 'NIO', flag: 'https://www.xe.com/svgs/flags/nio.static.svg' },
            'NOK': { name: 'Norwegian Krone', symbol: 'kr', flag: 'https://www.xe.com/svgs/flags/nok.static.svg' },
            'NPR': { name: 'NPR', symbol: 'NPR', flag: 'https://www.xe.com/svgs/flags/npr.static.svg' },
            'NZD': { name: 'NZD', symbol: 'NZD', flag: 'https://www.xe.com/svgs/flags/nzd.static.svg' },
            'OMR': { name: 'OMR', symbol: 'OMR', flag: 'https://www.xe.com/svgs/flags/omr.static.svg' },
            'PAB': { name: 'PAB', symbol: 'PAB', flag: 'https://www.xe.com/svgs/flags/pab.static.svg' },
            'PEN': { name: 'PEN', symbol: 'PEN', flag: 'https://www.xe.com/svgs/flags/pen.static.svg' },
            'PGK': { name: 'PGK', symbol: 'PGK', flag: 'https://www.xe.com/svgs/flags/pgk.static.svg' },
            'PHP': { name: 'PHP', symbol: 'PHP', flag: 'https://www.xe.com/svgs/flags/php.static.svg' },
            'PKR': { name: 'PKR', symbol: 'PKR', flag: 'https://www.xe.com/svgs/flags/pkr.static.svg' },
            'PLN': { name: 'PLN', symbol: 'PLN', flag: 'https://www.xe.com/svgs/flags/pln.static.svg' },
            'QAR': { name: 'QAR', symbol: 'QAR', flag: 'https://www.xe.com/svgs/flags/qar.static.svg' },
            'RON': { name: 'RON', symbol: 'RON', flag: 'https://www.xe.com/svgs/flags/ron.static.svg' },
            'RSD': { name: 'RSD', symbol: 'RSD', flag: 'https://www.xe.com/svgs/flags/rsd.static.svg' },
            'RUB': { name: 'Russian Ruble', symbol: '₽', flag: 'https://www.xe.com/svgs/flags/rub.static.svg' },
            'RWF': { name: 'RWF', symbol: 'RWF', flag: 'https://www.xe.com/svgs/flags/rwf.static.svg' },
            'SAR': { name: 'SAR', symbol: 'SAR', flag: 'https://www.xe.com/svgs/flags/sar.static.svg' },
            'SBD': { name: 'SBD', symbol: 'SBD', flag: 'https://www.xe.com/svgs/flags/sbd.static.svg' },
            'SCR': { name: 'SCR', symbol: 'SCR', flag: 'https://www.xe.com/svgs/flags/scr.static.svg' },
            'SDG': { name: 'SDG', symbol: 'SDG', flag: 'https://www.xe.com/svgs/flags/sdg.static.svg' },
            'SEK': { name: 'Swedish Krona', symbol: 'kr', flag: 'https://www.xe.com/svgs/flags/sek.static.svg' },
            'SGD': { name: 'Singapore Dollar', symbol: 'S$', flag: 'https://www.xe.com/svgs/flags/sgd.static.svg' },
            'SRD': { name: 'SRD', symbol: 'SRD', flag: 'https://www.xe.com/svgs/flags/srd.static.svg' },
            'SYP': { name: 'SYP', symbol: 'SYP', flag: 'https://www.xe.com/svgs/flags/syp.static.svg' },
            'SZL': { name: 'SZL', symbol: 'SZL', flag: 'https://www.xe.com/svgs/flags/szl.static.svg' },
            'THB': { name: 'THB', symbol: 'THB', flag: 'https://www.xe.com/svgs/flags/thb.static.svg' },
            'TJS': { name: 'TJS', symbol: 'TJS', flag: 'https://www.xe.com/svgs/flags/tjs.static.svg' },
            'TMT': { name: 'TMT', symbol: 'TMT', flag: 'https://www.xe.com/svgs/flags/tmt.static.svg' },
            'TND': { name: 'TND', symbol: 'TND', flag: 'https://www.xe.com/svgs/flags/tnd.static.svg' },
            'TOP': { name: 'TOP', symbol: 'TOP', flag: 'https://www.xe.com/svgs/flags/top.static.svg' },
            'TRY': { name: 'Turkish Lira', symbol: '₺', flag: 'https://www.xe.com/svgs/flags/try.static.svg' },
            'TTD': { name: 'TTD', symbol: 'TTD', flag: 'https://www.xe.com/svgs/flags/ttd.static.svg' },
            'TWD': { name: 'TWD', symbol: 'TWD', flag: 'https://www.xe.com/svgs/flags/twd.static.svg' },
            'TZS': { name: 'TZS', symbol: 'TZS', flag: 'https://www.xe.com/svgs/flags/tzs.static.svg' },
            'UAH': { name: 'UAH', symbol: 'UAH', flag: 'https://www.xe.com/svgs/flags/uah.static.svg' },
            'UGX': { name: 'UGX', symbol: 'UGX', flag: 'https://www.xe.com/svgs/flags/ugx.static.svg' },
            'UYU': { name: 'UYU', symbol: 'UYU', flag: 'https://www.xe.com/svgs/flags/uyu.static.svg' },
            'VES': { name: 'VES', symbol: 'VES', flag: 'https://www.xe.com/svgs/flags/ves.static.svg' },
            'VND': { name: 'VND', symbol: 'VND', flag: 'https://www.xe.com/svgs/flags/vnd.static.svg' },
            'VUV': { name: 'VUV', symbol: 'VUV', flag: 'https://www.xe.com/svgs/flags/vuv.static.svg' },
            'WST': { name: 'WST', symbol: 'WST', flag: 'https://www.xe.com/svgs/flags/wst.static.svg' },
            'XAF': { name: 'XAF', symbol: 'XAF', flag: 'https://www.xe.com/svgs/flags/xaf.static.svg' },
            'XCD': { name: 'XCD', symbol: 'XCD', flag: 'https://www.xe.com/svgs/flags/xcd.static.svg' },
            'XOF': { name: 'XOF', symbol: 'XOF', flag: 'https://www.xe.com/svgs/flags/xof.static.svg' },
            'XPF': { name: 'XPF', symbol: 'XPF', flag: 'https://www.xe.com/svgs/flags/xpf.static.svg' },
            'ZAR': { name: 'South African Rand', symbol: 'R', flag: 'https://www.xe.com/svgs/flags/zar.static.svg' },
            'ZMW': { name: 'ZMW', symbol: 'ZMW', flag: 'https://www.xe.com/svgs/flags/zmw.static.svg' }
        };

        // Build currency data for all found currencies
        allCurrencyCodes.forEach(code => {
            if (knownCurrencies[code]) {
                currencyData[code] = knownCurrencies[code];
            } else {
                // Fallback for unknown currencies
                currencyData[code] = {
                    name: code,
                    symbol: code,
                    flag: `https://www.xe.com/svgs/flags/${code.toLowerCase()}.static.svg`
                };
            }
        });

        // Generate currencies array
        const currencies = Object.entries(currencyData).map(([code, data]) => ({
            code,
            name: data.name,
            symbol: data.symbol,
            flag: data.flag
        }));

        // Generate USD-{CURRENCY} pairs for scraping (all currencies)
        const currencyCodes = Object.keys(currencyData);
        const usdPairs = currencyCodes
            .filter(code => code !== 'USD')
            .map(code => `USD-${code}`);

        console.log(`🔄 Scraping ${usdPairs.length} USD pairs from XE.com...`);
        const scrapedRates = await scrapeSpecificXERates(usdPairs);
        console.log('📊 Scraped rates:', scrapedRates);

        // Generate currency rates from scraped data
        const currencyRates: Record<string, number> = {};
        currencyCodes.forEach(code => {
            if (code === 'USD') {
                currencyRates[code] = 1.0; // USD is always 1.0
            } else {
                // Get USD-{CURRENCY} rate from scraped data
                const usdToCurrencyRate = scrapedRates[`USD-${code}`];
                console.log(`🔍 ${code}: USD-${code} = ${usdToCurrencyRate}`);
                if (usdToCurrencyRate) {
                    // The scraped rate is already the inverse (how many USD = 1 unit of target currency)
                    // Use it directly without additional division
                    currencyRates[code] = usdToCurrencyRate;
                    console.log(`✅ ${code}: Using scraped rate directly = ${usdToCurrencyRate}`);
                } else {
                    // Fallback to 1 if rate not found
                    currencyRates[code] = 1.0;
                    console.log(`❌ ${code}: Rate not found, using fallback 1.0`);
                }
            }
        });

        console.log('📈 Final currency rates:', currencyRates);

        // Generate copy-paste ready currency data structure
        // const copyPasteData = Object.entries(currencyData).map(([code, data]) => {
        //     return `'${code}': { name: '${data.name}', symbol: '${data.symbol}', flag: '${data.flag}' }`;
        // }).join(',\n            ');

        // const copyPasteCode = `const currencyData = {
        //     ${copyPasteData}
        // };`;

        return NextResponse.json({
            success: true,
            count: currencies.length,
            currencies: currencies,
            rates: currencyRates,
            // copyPasteCode: copyPasteCode,
            message: `Found ${currencies.length} currencies with ${Object.keys(currencyRates).length} rates from XE.com`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error getting currencies with rates:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to get currencies with rates',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
