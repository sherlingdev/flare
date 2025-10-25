import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Excluded currencies that cause issues in production
const excludedCurrencies = ['clf', 'cnh', 'fok', 'kid', 'ssp'];

// Currency code to country code mapping
const currencyToCountryCode = {
    // Common currencies
    'USD': 'us',
    'EUR': 'eu',
    'GBP': 'gb',
    'JPY': 'jp',
    'CNY': 'cn',
    'INR': 'in',
    'AUD': 'au',
    'CAD': 'ca',
    'CHF': 'ch',
    'DOP': 'do',
    'MXN': 'mx',
    'BRL': 'br',
    'ARS': 'ar',
    'CLP': 'cl',
    'COP': 'co',
    'PEN': 'pe',
    'VES': 've',
    'UYU': 'uy',
    'PYG': 'py',
    'BOB': 'bo',
    'AED': 'ae',
    'SAR': 'sa',
    'QAR': 'qa',
    'KWD': 'kw',
    'OMR': 'om',
    'BHD': 'bh',
    'ILS': 'il',
    'JOD': 'jo',
    'LBP': 'lb',
    'HKD': 'hk',
    'SGD': 'sg',
    'MYR': 'my',
    'THB': 'th',
    'IDR': 'id',
    'PHP': 'ph',
    'VND': 'vn',
    'KRW': 'kr',
    'TWD': 'tw',
    'NOK': 'no',
    'SEK': 'se',
    'DKK': 'dk',
    'PLN': 'pl',
    'CZK': 'cz',
    'HUF': 'hu',
    'RON': 'ro',
    'BGN': 'bg',
    'HRK': 'hr',
    'RSD': 'rs',
    'BAM': 'ba',
    'ZAR': 'za',
    'EGP': 'eg',
    'NGN': 'ng',
    'KES': 'ke',
    'ETB': 'et',
    'GHS': 'gh',
    'UGX': 'ug',
    'TZS': 'tz',
    'NZD': 'nz',
    'FJD': 'fj',
    'PKR': 'pk',
    'BDT': 'bd',
    'LKR': 'lk',
    'MMK': 'mm',
    'KHR': 'kh',
    'LAK': 'la',
    'JMD': 'jm',
    'TTD': 'tt',
    'BBD': 'bb',
    'BSD': 'bs',
    'BZD': 'bz',
    'XAF': 'cf',
    'XOF': 'sn',
    'ANG': 'cw',
    'AWG': 'aw',
    'AFN': 'af',
    'ALL': 'al',
    'AMD': 'am',
    'AOA': 'ao',
    'AZN': 'az',
    'BIF': 'bi',
    'BMD': 'bm',
    'BND': 'bn',
    'BTN': 'bt',
    'BWP': 'bw',
    'BYN': 'by',
    'CDF': 'cd',
    'CRC': 'cr',
    'CUP': 'cu',
    'CVE': 'cv',
    'DZD': 'dz',
    'ERN': 'er',
    'FKP': 'fk',
    'GEL': 'ge',
    'GGP': 'gg',
    'GIP': 'gi',
    'GMD': 'gm',
    'GNF': 'gn',
    'GTQ': 'gt',
    'GYD': 'gy',
    'HNL': 'hn',
    'HTG': 'ht',
    'IMP': 'im',
    'IQD': 'iq',
    'IRR': 'ir',
    'ISK': 'is',
    'JEP': 'je',
    'KGS': 'kg',
    'KMF': 'km',
    'KPW': 'kp',
    'KYD': 'ky',
    'KZT': 'kz',
    'LRD': 'lr',
    'LSL': 'ls',
    'LYD': 'ly',
    'MAD': 'ma',
    'MDL': 'md',
    'MGA': 'mg',
    'MKD': 'mk',
    'MNT': 'mn',
    'MOP': 'mo',
    'MRU': 'mr',
    'MUR': 'mu',
    'MVR': 'mv',
    'MWK': 'mw',
    'MZN': 'mz',
    'NAD': 'na',
    'NIO': 'ni',
    'NPR': 'np',
    'PGK': 'pg',
    'RUB': 'ru',
    'RWF': 'rw',
    'SBD': 'sb',
    'SCR': 'sc',
    'SDG': 'sd',
    'SHP': 'sh',
    'SLE': 'sl',
    'SLL': 'sl',
    'SOS': 'so',
    'SRD': 'sr',
    'STN': 'st',
    'SYP': 'sy',
    'SZL': 'sz',
    'TJS': 'tj',
    'TMT': 'tm',
    'TND': 'tn',
    'TOP': 'to',
    'TRY': 'tr',
    'TVD': 'tv',
    'UAH': 'ua',
    'UZS': 'uz',
    'VUV': 'vu',
    'WST': 'ws',
    'XCD': 'ag',
    'XPF': 'pf',
    'YER': 'ye',
    'ZMW': 'zm',
    'ZWL': 'zw'
};

// Create flags directory
const flagsDir = path.join(__dirname, 'public', 'flags');
if (!fs.existsSync(flagsDir)) {
    fs.mkdirSync(flagsDir, { recursive: true });
}

// Download function
function downloadFlag(countryCode, currencyCode) {
    return new Promise((resolve, reject) => {
        // Use xe.com to match what's in production
        const url = `https://www.xe.com/svgs/flags/${countryCode}.static.svg`;
        const filePath = path.join(flagsDir, `${currencyCode.toLowerCase()}.svg`);

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filePath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✓ Downloaded: ${currencyCode} -> ${countryCode}.svg`);
                    resolve();
                });
            } else {
                console.log(`✗ Failed to download ${currencyCode} (${countryCode}): ${response.statusCode}`);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            console.error(`✗ Error downloading ${currencyCode} (${countryCode}):`, err.message);
            reject(err);
        });
    });
}

// Download all flags
async function downloadAllFlags() {
    console.log('🚀 Starting flag download from xe.com...\n');
    console.log(`⚠️  Excluding currencies: ${excludedCurrencies.join(', ')}\n`);

    const entries = Object.entries(currencyToCountryCode);
    let successCount = 0;
    let failCount = 0;

    for (const [currencyCode, countryCode] of entries) {
        // Skip excluded currencies
        if (excludedCurrencies.includes(currencyCode.toLowerCase())) {
            console.log(`⊘ Skipped: ${currencyCode} (excluded)`);
            continue;
        }

        try {
            await downloadFlag(countryCode, currencyCode);
            successCount++;
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch {
            failCount++;
        }
    }

    console.log(`\n✅ Download complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Excluded: ${excludedCurrencies.length}`);
    console.log(`\n📁 Flags saved to: ${flagsDir}`);
}

downloadAllFlags().catch(console.error);
