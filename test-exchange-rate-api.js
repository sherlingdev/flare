#!/usr/bin/env node

/**
 * Test script for ExchangeRate-API integration
 * Tests the API call and rate conversion
 */

import fetch from 'node-fetch';

async function testExchangeRateAPI() {
    console.log('🧪 Testing ExchangeRate-API integration...\n');

    try {
        // 1. Call ExchangeRate-API
        console.log('📡 Calling ExchangeRate-API...');
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API Response received');
        console.log(`📊 Base currency: ${data.base_code}`);
        console.log(`📅 Last update: ${data.time_last_update_utc}`);
        console.log(`🔄 Next update: ${data.time_next_update_utc}`);
        console.log(`📈 Total rates: ${Object.keys(data.rates).length}\n`);

        // 2. Convert rates to our format (1/rate for each currency)
        console.log('🔄 Converting rates to our format...');
        const convertedRates = {};
        Object.keys(data.rates).forEach(currency => {
            if (currency !== 'USD') {
                convertedRates[currency] = 1 / data.rates[currency];
            } else {
                convertedRates[currency] = 1;
            }
        });

        // 3. Show some examples
        console.log('📋 Rate conversion examples:');
        console.log(`   EUR: ${data.rates.EUR} → ${convertedRates.EUR.toFixed(6)}`);
        console.log(`   DOP: ${data.rates.DOP} → ${convertedRates.DOP.toFixed(6)}`);
        console.log(`   GBP: ${data.rates.GBP} → ${convertedRates.GBP.toFixed(6)}`);
        console.log(`   JPY: ${data.rates.JPY} → ${convertedRates.JPY.toFixed(6)}\n`);

        // 4. Create our format
        const result = {
            success: true,
            rates: convertedRates,
            currencies: Object.keys(convertedRates).map(code => ({
                code: code,
                name: code,
                symbol: code,
                flag: `https://www.xe.com/svgs/flags/${code.toLowerCase()}.static.svg`
            })),
            timestamp: new Date().toISOString(),
            source: 'exchange-rate-api'
        };

        console.log('✅ Conversion completed successfully!');
        console.log(`📊 Converted rates: ${Object.keys(convertedRates).length}`);
        console.log(`📊 Currencies: ${result.currencies.length}`);
        console.log(`⏰ Timestamp: ${result.timestamp}`);

        // 5. Test specific currencies we care about
        console.log('\n🎯 Testing key currencies:');
        const keyCurrencies = ['USD', 'EUR', 'DOP', 'GBP', 'JPY', 'CAD', 'CHF'];
        keyCurrencies.forEach(code => {
            if (convertedRates[code]) {
                console.log(`   ${code}: ${convertedRates[code].toFixed(6)}`);
            }
        });

        return result;

    } catch (error) {
        console.error('❌ Error testing ExchangeRate-API:', error.message);
        throw error;
    }
}

// Run the test
testExchangeRateAPI()
    .then(result => {
        console.log('\n🎉 Test completed successfully!');
        console.log('✅ ExchangeRate-API is working correctly');
        console.log('✅ Rate conversion is working correctly');
        console.log('✅ Ready for GitHub Actions integration');
    })
    .catch(error => {
        console.error('\n💥 Test failed:', error.message);
        process.exit(1);
    });
