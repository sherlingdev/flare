import { NextResponse } from 'next/server';
import { scrapeSpecificXERates } from '../../../lib/scraper';

// Netlify function configuration
export const config = {
    maxDuration: 120, // 120 seconds timeout for Netlify (increased for all currencies)
};

export async function GET() {
    try {
        console.log('📋 Getting currencies with automatic pair generation...');

        // Complete currencies array - all currencies hardcoded
        const currencies = [
            {
                "code": "USD",
                "name": "US Dollar",
                "symbol": "$",
                "flag": "https://www.xe.com/svgs/flags/usd.static.svg"
            },
            {
                "code": "EUR",
                "name": "Euro",
                "symbol": "€",
                "flag": "https://www.xe.com/svgs/flags/eur.static.svg"
            },
            {
                "code": "CAD",
                "name": "Canadian Dollar",
                "symbol": "C$",
                "flag": "https://www.xe.com/svgs/flags/cad.static.svg"
            },
            {
                "code": "CHF",
                "name": "Swiss Franc",
                "symbol": "CHF",
                "flag": "https://www.xe.com/svgs/flags/chf.static.svg"
            },
            {
                "code": "GBP",
                "name": "British Pound",
                "symbol": "£",
                "flag": "https://www.xe.com/svgs/flags/gbp.static.svg"
            },
            {
                "code": "AED",
                "name": "AED",
                "symbol": "AED",
                "flag": "https://www.xe.com/svgs/flags/aed.static.svg"
            },
            {
                "code": "AFN",
                "name": "AFN",
                "symbol": "AFN",
                "flag": "https://www.xe.com/svgs/flags/afn.static.svg"
            },
            {
                "code": "ALL",
                "name": "ALL",
                "symbol": "ALL",
                "flag": "https://www.xe.com/svgs/flags/all.static.svg"
            },
            {
                "code": "AMD",
                "name": "AMD",
                "symbol": "AMD",
                "flag": "https://www.xe.com/svgs/flags/amd.static.svg"
            },
            {
                "code": "ANG",
                "name": "ANG",
                "symbol": "ANG",
                "flag": "https://www.xe.com/svgs/flags/ang.static.svg"
            },
            {
                "code": "AOA",
                "name": "AOA",
                "symbol": "AOA",
                "flag": "https://www.xe.com/svgs/flags/aoa.static.svg"
            },
            {
                "code": "ARS",
                "name": "ARS",
                "symbol": "ARS",
                "flag": "https://www.xe.com/svgs/flags/ars.static.svg"
            },
            {
                "code": "AUD",
                "name": "Australian Dollar",
                "symbol": "A$",
                "flag": "https://www.xe.com/svgs/flags/aud.static.svg"
            },
            {
                "code": "AWG",
                "name": "AWG",
                "symbol": "AWG",
                "flag": "https://www.xe.com/svgs/flags/awg.static.svg"
            },
            {
                "code": "AZN",
                "name": "AZN",
                "symbol": "AZN",
                "flag": "https://www.xe.com/svgs/flags/azn.static.svg"
            },
            {
                "code": "BAM",
                "name": "BAM",
                "symbol": "BAM",
                "flag": "https://www.xe.com/svgs/flags/bam.static.svg"
            },
            {
                "code": "BBD",
                "name": "BBD",
                "symbol": "BBD",
                "flag": "https://www.xe.com/svgs/flags/bbd.static.svg"
            },
            {
                "code": "BDT",
                "name": "BDT",
                "symbol": "BDT",
                "flag": "https://www.xe.com/svgs/flags/bdt.static.svg"
            },
            {
                "code": "BGN",
                "name": "BGN",
                "symbol": "BGN",
                "flag": "https://www.xe.com/svgs/flags/bgn.static.svg"
            },
            {
                "code": "BHD",
                "name": "BHD",
                "symbol": "BHD",
                "flag": "https://www.xe.com/svgs/flags/bhd.static.svg"
            },
            {
                "code": "BIF",
                "name": "BIF",
                "symbol": "BIF",
                "flag": "https://www.xe.com/svgs/flags/bif.static.svg"
            },
            {
                "code": "BMD",
                "name": "BMD",
                "symbol": "BMD",
                "flag": "https://www.xe.com/svgs/flags/bmd.static.svg"
            },
            {
                "code": "BND",
                "name": "BND",
                "symbol": "BND",
                "flag": "https://www.xe.com/svgs/flags/bnd.static.svg"
            },
            {
                "code": "BOB",
                "name": "BOB",
                "symbol": "BOB",
                "flag": "https://www.xe.com/svgs/flags/bob.static.svg"
            },
            {
                "code": "BRL",
                "name": "Brazilian Real",
                "symbol": "R$",
                "flag": "https://www.xe.com/svgs/flags/brl.static.svg"
            },
            {
                "code": "BTN",
                "name": "BTN",
                "symbol": "BTN",
                "flag": "https://www.xe.com/svgs/flags/btn.static.svg"
            },
            {
                "code": "BWP",
                "name": "BWP",
                "symbol": "BWP",
                "flag": "https://www.xe.com/svgs/flags/bwp.static.svg"
            },
            {
                "code": "BYN",
                "name": "BYN",
                "symbol": "BYN",
                "flag": "https://www.xe.com/svgs/flags/byn.static.svg"
            },
            {
                "code": "BZD",
                "name": "BZD",
                "symbol": "BZD",
                "flag": "https://www.xe.com/svgs/flags/bzd.static.svg"
            },
            {
                "code": "CDF",
                "name": "CDF",
                "symbol": "CDF",
                "flag": "https://www.xe.com/svgs/flags/cdf.static.svg"
            },
            {
                "code": "CLP",
                "name": "CLP",
                "symbol": "CLP",
                "flag": "https://www.xe.com/svgs/flags/clp.static.svg"
            },
            {
                "code": "CNY",
                "name": "Chinese Yuan",
                "symbol": "¥",
                "flag": "https://www.xe.com/svgs/flags/cny.static.svg"
            },
            {
                "code": "COP",
                "name": "COP",
                "symbol": "COP",
                "flag": "https://www.xe.com/svgs/flags/cop.static.svg"
            },
            {
                "code": "CRC",
                "name": "CRC",
                "symbol": "CRC",
                "flag": "https://www.xe.com/svgs/flags/crc.static.svg"
            },
            {
                "code": "CZK",
                "name": "CZK",
                "symbol": "CZK",
                "flag": "https://www.xe.com/svgs/flags/czk.static.svg"
            },
            {
                "code": "DJF",
                "name": "DJF",
                "symbol": "DJF",
                "flag": "https://www.xe.com/svgs/flags/djf.static.svg"
            },
            {
                "code": "DOP",
                "name": "Dominican Peso",
                "symbol": "RD$",
                "flag": "https://www.xe.com/svgs/flags/dop.static.svg"
            },
            {
                "code": "DZD",
                "name": "DZD",
                "symbol": "DZD",
                "flag": "https://www.xe.com/svgs/flags/dzd.static.svg"
            },
            {
                "code": "EGP",
                "name": "EGP",
                "symbol": "EGP",
                "flag": "https://www.xe.com/svgs/flags/egp.static.svg"
            },
            {
                "code": "ETB",
                "name": "ETB",
                "symbol": "ETB",
                "flag": "https://www.xe.com/svgs/flags/etb.static.svg"
            },
            {
                "code": "FJD",
                "name": "FJD",
                "symbol": "FJD",
                "flag": "https://www.xe.com/svgs/flags/fjd.static.svg"
            },
            {
                "code": "GEL",
                "name": "GEL",
                "symbol": "GEL",
                "flag": "https://www.xe.com/svgs/flags/gel.static.svg"
            },
            {
                "code": "GTQ",
                "name": "GTQ",
                "symbol": "GTQ",
                "flag": "https://www.xe.com/svgs/flags/gtq.static.svg"
            },
            {
                "code": "GYD",
                "name": "GYD",
                "symbol": "GYD",
                "flag": "https://www.xe.com/svgs/flags/gyd.static.svg"
            },
            {
                "code": "HKD",
                "name": "Hong Kong Dollar",
                "symbol": "HK$",
                "flag": "https://www.xe.com/svgs/flags/hkd.static.svg"
            },
            {
                "code": "HNL",
                "name": "HNL",
                "symbol": "HNL",
                "flag": "https://www.xe.com/svgs/flags/hnl.static.svg"
            },
            {
                "code": "HRK",
                "name": "HRK",
                "symbol": "HRK",
                "flag": "https://www.xe.com/svgs/flags/hrk.static.svg"
            },
            {
                "code": "HUF",
                "name": "HUF",
                "symbol": "HUF",
                "flag": "https://www.xe.com/svgs/flags/huf.static.svg"
            },
            {
                "code": "IDR",
                "name": "IDR",
                "symbol": "IDR",
                "flag": "https://www.xe.com/svgs/flags/idr.static.svg"
            },
            {
                "code": "ILS",
                "name": "ILS",
                "symbol": "ILS",
                "flag": "https://www.xe.com/svgs/flags/ils.static.svg"
            },
            {
                "code": "INR",
                "name": "Indian Rupee",
                "symbol": "₹",
                "flag": "https://www.xe.com/svgs/flags/inr.static.svg"
            },
            {
                "code": "IQD",
                "name": "IQD",
                "symbol": "IQD",
                "flag": "https://www.xe.com/svgs/flags/iqd.static.svg"
            },
            {
                "code": "IRR",
                "name": "IRR",
                "symbol": "IRR",
                "flag": "https://www.xe.com/svgs/flags/irr.static.svg"
            },
            {
                "code": "JMD",
                "name": "JMD",
                "symbol": "JMD",
                "flag": "https://www.xe.com/svgs/flags/jmd.static.svg"
            },
            {
                "code": "JOD",
                "name": "JOD",
                "symbol": "JOD",
                "flag": "https://www.xe.com/svgs/flags/jod.static.svg"
            },
            {
                "code": "JPY",
                "name": "Japanese Yen",
                "symbol": "¥",
                "flag": "https://www.xe.com/svgs/flags/jpy.static.svg"
            },
            {
                "code": "KES",
                "name": "KES",
                "symbol": "KES",
                "flag": "https://www.xe.com/svgs/flags/kes.static.svg"
            },
            {
                "code": "KGS",
                "name": "KGS",
                "symbol": "KGS",
                "flag": "https://www.xe.com/svgs/flags/kgs.static.svg"
            },
            {
                "code": "KHR",
                "name": "KHR",
                "symbol": "KHR",
                "flag": "https://www.xe.com/svgs/flags/khr.static.svg"
            },
            {
                "code": "KMF",
                "name": "KMF",
                "symbol": "KMF",
                "flag": "https://www.xe.com/svgs/flags/kmf.static.svg"
            },
            {
                "code": "KRW",
                "name": "South Korean Won",
                "symbol": "₩",
                "flag": "https://www.xe.com/svgs/flags/krw.static.svg"
            },
            {
                "code": "KWD",
                "name": "KWD",
                "symbol": "KWD",
                "flag": "https://www.xe.com/svgs/flags/kwd.static.svg"
            },
            {
                "code": "KYD",
                "name": "KYD",
                "symbol": "KYD",
                "flag": "https://www.xe.com/svgs/flags/kyd.static.svg"
            },
            {
                "code": "KZT",
                "name": "KZT",
                "symbol": "KZT",
                "flag": "https://www.xe.com/svgs/flags/kzt.static.svg"
            },
            {
                "code": "LAK",
                "name": "LAK",
                "symbol": "LAK",
                "flag": "https://www.xe.com/svgs/flags/lak.static.svg"
            },
            {
                "code": "LBP",
                "name": "LBP",
                "symbol": "LBP",
                "flag": "https://www.xe.com/svgs/flags/lbp.static.svg"
            },
            {
                "code": "LKR",
                "name": "LKR",
                "symbol": "LKR",
                "flag": "https://www.xe.com/svgs/flags/lkr.static.svg"
            },
            {
                "code": "LSL",
                "name": "LSL",
                "symbol": "LSL",
                "flag": "https://www.xe.com/svgs/flags/lsl.static.svg"
            },
            {
                "code": "LYD",
                "name": "LYD",
                "symbol": "LYD",
                "flag": "https://www.xe.com/svgs/flags/lyd.static.svg"
            },
            {
                "code": "MAD",
                "name": "MAD",
                "symbol": "MAD",
                "flag": "https://www.xe.com/svgs/flags/mad.static.svg"
            },
            {
                "code": "MDL",
                "name": "MDL",
                "symbol": "MDL",
                "flag": "https://www.xe.com/svgs/flags/mdl.static.svg"
            },
            {
                "code": "MGA",
                "name": "MGA",
                "symbol": "MGA",
                "flag": "https://www.xe.com/svgs/flags/mga.static.svg"
            },
            {
                "code": "MKD",
                "name": "MKD",
                "symbol": "MKD",
                "flag": "https://www.xe.com/svgs/flags/mkd.static.svg"
            },
            {
                "code": "MNT",
                "name": "MNT",
                "symbol": "MNT",
                "flag": "https://www.xe.com/svgs/flags/mnt.static.svg"
            },
            {
                "code": "MOP",
                "name": "MOP",
                "symbol": "MOP",
                "flag": "https://www.xe.com/svgs/flags/mop.static.svg"
            },
            {
                "code": "MUR",
                "name": "MUR",
                "symbol": "MUR",
                "flag": "https://www.xe.com/svgs/flags/mur.static.svg"
            },
            {
                "code": "MVR",
                "name": "MVR",
                "symbol": "MVR",
                "flag": "https://www.xe.com/svgs/flags/mvr.static.svg"
            },
            {
                "code": "MXN",
                "name": "Mexican Peso",
                "symbol": "$",
                "flag": "https://www.xe.com/svgs/flags/mxn.static.svg"
            },
            {
                "code": "MYR",
                "name": "MYR",
                "symbol": "MYR",
                "flag": "https://www.xe.com/svgs/flags/myr.static.svg"
            },
            {
                "code": "MZN",
                "name": "MZN",
                "symbol": "MZN",
                "flag": "https://www.xe.com/svgs/flags/mzn.static.svg"
            },
            {
                "code": "NIO",
                "name": "NIO",
                "symbol": "NIO",
                "flag": "https://www.xe.com/svgs/flags/nio.static.svg"
            },
            {
                "code": "NOK",
                "name": "Norwegian Krone",
                "symbol": "kr",
                "flag": "https://www.xe.com/svgs/flags/nok.static.svg"
            },
            {
                "code": "NPR",
                "name": "NPR",
                "symbol": "NPR",
                "flag": "https://www.xe.com/svgs/flags/npr.static.svg"
            },
            {
                "code": "NZD",
                "name": "NZD",
                "symbol": "NZD",
                "flag": "https://www.xe.com/svgs/flags/nzd.static.svg"
            },
            {
                "code": "OMR",
                "name": "OMR",
                "symbol": "OMR",
                "flag": "https://www.xe.com/svgs/flags/omr.static.svg"
            },
            {
                "code": "PAB",
                "name": "PAB",
                "symbol": "PAB",
                "flag": "https://www.xe.com/svgs/flags/pab.static.svg"
            },
            {
                "code": "PEN",
                "name": "PEN",
                "symbol": "PEN",
                "flag": "https://www.xe.com/svgs/flags/pen.static.svg"
            },
            {
                "code": "PGK",
                "name": "PGK",
                "symbol": "PGK",
                "flag": "https://www.xe.com/svgs/flags/pgk.static.svg"
            },
            {
                "code": "PHP",
                "name": "PHP",
                "symbol": "PHP",
                "flag": "https://www.xe.com/svgs/flags/php.static.svg"
            },
            {
                "code": "PKR",
                "name": "PKR",
                "symbol": "PKR",
                "flag": "https://www.xe.com/svgs/flags/pkr.static.svg"
            },
            {
                "code": "PLN",
                "name": "PLN",
                "symbol": "PLN",
                "flag": "https://www.xe.com/svgs/flags/pln.static.svg"
            },
            {
                "code": "QAR",
                "name": "QAR",
                "symbol": "QAR",
                "flag": "https://www.xe.com/svgs/flags/qar.static.svg"
            },
            {
                "code": "RON",
                "name": "RON",
                "symbol": "RON",
                "flag": "https://www.xe.com/svgs/flags/ron.static.svg"
            },
            {
                "code": "RSD",
                "name": "RSD",
                "symbol": "RSD",
                "flag": "https://www.xe.com/svgs/flags/rsd.static.svg"
            },
            {
                "code": "RUB",
                "name": "Russian Ruble",
                "symbol": "₽",
                "flag": "https://www.xe.com/svgs/flags/rub.static.svg"
            },
            {
                "code": "RWF",
                "name": "RWF",
                "symbol": "RWF",
                "flag": "https://www.xe.com/svgs/flags/rwf.static.svg"
            },
            {
                "code": "SAR",
                "name": "SAR",
                "symbol": "SAR",
                "flag": "https://www.xe.com/svgs/flags/sar.static.svg"
            },
            {
                "code": "SBD",
                "name": "SBD",
                "symbol": "SBD",
                "flag": "https://www.xe.com/svgs/flags/sbd.static.svg"
            },
            {
                "code": "SCR",
                "name": "SCR",
                "symbol": "SCR",
                "flag": "https://www.xe.com/svgs/flags/scr.static.svg"
            },
            {
                "code": "SDG",
                "name": "SDG",
                "symbol": "SDG",
                "flag": "https://www.xe.com/svgs/flags/sdg.static.svg"
            },
            {
                "code": "SEK",
                "name": "Swedish Krona",
                "symbol": "kr",
                "flag": "https://www.xe.com/svgs/flags/sek.static.svg"
            },
            {
                "code": "SGD",
                "name": "Singapore Dollar",
                "symbol": "S$",
                "flag": "https://www.xe.com/svgs/flags/sgd.static.svg"
            },
            {
                "code": "SRD",
                "name": "SRD",
                "symbol": "SRD",
                "flag": "https://www.xe.com/svgs/flags/srd.static.svg"
            },
            {
                "code": "SYP",
                "name": "SYP",
                "symbol": "SYP",
                "flag": "https://www.xe.com/svgs/flags/syp.static.svg"
            },
            {
                "code": "SZL",
                "name": "SZL",
                "symbol": "SZL",
                "flag": "https://www.xe.com/svgs/flags/szl.static.svg"
            },
            {
                "code": "THB",
                "name": "THB",
                "symbol": "THB",
                "flag": "https://www.xe.com/svgs/flags/thb.static.svg"
            },
            {
                "code": "TJS",
                "name": "TJS",
                "symbol": "TJS",
                "flag": "https://www.xe.com/svgs/flags/tjs.static.svg"
            },
            {
                "code": "TMT",
                "name": "TMT",
                "symbol": "TMT",
                "flag": "https://www.xe.com/svgs/flags/tmt.static.svg"
            },
            {
                "code": "TND",
                "name": "TND",
                "symbol": "TND",
                "flag": "https://www.xe.com/svgs/flags/tnd.static.svg"
            },
            {
                "code": "TOP",
                "name": "TOP",
                "symbol": "TOP",
                "flag": "https://www.xe.com/svgs/flags/top.static.svg"
            },
            {
                "code": "TRY",
                "name": "Turkish Lira",
                "symbol": "₺",
                "flag": "https://www.xe.com/svgs/flags/try.static.svg"
            },
            {
                "code": "TTD",
                "name": "TTD",
                "symbol": "TTD",
                "flag": "https://www.xe.com/svgs/flags/ttd.static.svg"
            },
            {
                "code": "TWD",
                "name": "TWD",
                "symbol": "TWD",
                "flag": "https://www.xe.com/svgs/flags/twd.static.svg"
            },
            {
                "code": "TZS",
                "name": "TZS",
                "symbol": "TZS",
                "flag": "https://www.xe.com/svgs/flags/tzs.static.svg"
            },
            {
                "code": "UAH",
                "name": "UAH",
                "symbol": "UAH",
                "flag": "https://www.xe.com/svgs/flags/uah.static.svg"
            },
            {
                "code": "UGX",
                "name": "UGX",
                "symbol": "UGX",
                "flag": "https://www.xe.com/svgs/flags/ugx.static.svg"
            },
            {
                "code": "UYU",
                "name": "UYU",
                "symbol": "UYU",
                "flag": "https://www.xe.com/svgs/flags/uyu.static.svg"
            },
            {
                "code": "VES",
                "name": "VES",
                "symbol": "VES",
                "flag": "https://www.xe.com/svgs/flags/ves.static.svg"
            },
            {
                "code": "VND",
                "name": "VND",
                "symbol": "VND",
                "flag": "https://www.xe.com/svgs/flags/vnd.static.svg"
            },
            {
                "code": "VUV",
                "name": "VUV",
                "symbol": "VUV",
                "flag": "https://www.xe.com/svgs/flags/vuv.static.svg"
            },
            {
                "code": "WST",
                "name": "WST",
                "symbol": "WST",
                "flag": "https://www.xe.com/svgs/flags/wst.static.svg"
            },
            {
                "code": "XAF",
                "name": "XAF",
                "symbol": "XAF",
                "flag": "https://www.xe.com/svgs/flags/xaf.static.svg"
            },
            {
                "code": "XCD",
                "name": "XCD",
                "symbol": "XCD",
                "flag": "https://www.xe.com/svgs/flags/xcd.static.svg"
            },
            {
                "code": "XOF",
                "name": "XOF",
                "symbol": "XOF",
                "flag": "https://www.xe.com/svgs/flags/xof.static.svg"
            },
            {
                "code": "XPF",
                "name": "XPF",
                "symbol": "XPF",
                "flag": "https://www.xe.com/svgs/flags/xpf.static.svg"
            },
            {
                "code": "ZMW",
                "name": "ZMW",
                "symbol": "ZMW",
                "flag": "https://www.xe.com/svgs/flags/zmw.static.svg"
            }
        ];

        // Get currency codes for scraping
        const allCurrencyCodes = currencies.map(c => c.code);
        console.log(`📊 Found ${allCurrencyCodes.length} currencies:`, allCurrencyCodes);

        // Generate USD-{CURRENCY} pairs for scraping (all currencies)
        const usdPairs = allCurrencyCodes
            .filter(code => code !== 'USD')
            .map(code => `USD-${code}`);

        console.log(`🔄 Scraping ${usdPairs.length} USD pairs from XE.com...`);
        const scrapedRates = await scrapeSpecificXERates(usdPairs);
        console.log('📊 Scraped rates:', scrapedRates);

        // Generate currency rates from scraped data
        const currencyRates: Record<string, number> = {};
        allCurrencyCodes.forEach(code => {
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

        return NextResponse.json({
            success: true,
            count: currencies.length,
            currencies: currencies,
            rates: currencyRates,
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