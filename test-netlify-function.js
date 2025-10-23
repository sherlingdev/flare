#!/usr/bin/env node

/**
 * Test Netlify Function for currency rates
 * Tests the function locally and in production
 */

import fetch from 'node-fetch';

async function testNetlifyFunction() {
    console.log('🧪 Testing Netlify Function for currency rates...\n');

    try {
        // Test data
        const testData = {
            rates: {
                "USD": 1,
                "EUR": 1.160557,
                "DOP": 0.015725,
                "GBP": 1.335361,
                "JPY": 0.006587
            },
            currencies: [
                { code: "USD", name: "US Dollar", symbol: "$", flag: "https://www.xe.com/svgs/flags/usd.static.svg" },
                { code: "EUR", name: "Euro", symbol: "€", flag: "https://www.xe.com/svgs/flags/eur.static.svg" },
                { code: "DOP", name: "Dominican Peso", symbol: "RD$", flag: "https://www.xe.com/svgs/flags/dop.static.svg" }
            ],
            timestamp: new Date().toISOString(),
            source: 'test'
        };

        // Test local development
        console.log('🔧 Testing local development...');
        try {
            const localResponse = await fetch('http://localhost:8888/.netlify/functions/currency-rates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            if (localResponse.ok) {
                const localResult = await localResponse.json();
                console.log('✅ Local PUT successful:', localResult.message);
            } else {
                console.log('⚠️ Local development not running (expected)');
            }
        } catch (error) {
            console.log('⚠️ Local development not running (expected)');
        }

        // Test production
        console.log('\n🌐 Testing production...');
        const prodResponse = await fetch('https://flarexrate.com/.netlify/functions/currency-rates', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        if (prodResponse.ok) {
            const prodResult = await prodResponse.json();
            console.log('✅ Production PUT successful:', prodResult.message);
        } else {
            console.log('❌ Production PUT failed:', prodResponse.status, prodResponse.statusText);
        }

        // Test GET
        console.log('\n📥 Testing GET...');
        const getResponse = await fetch('https://flarexrate.com/.netlify/functions/currency-rates');

        if (getResponse.ok) {
            const getResult = await getResponse.json();
            console.log('✅ GET successful:', getResult.success);
            if (getResult.data) {
                console.log('📊 Data retrieved:', Object.keys(getResult.data.rates).length, 'rates');
                console.log('📊 Currencies:', getResult.data.currencies.length);
            }
        } else {
            console.log('❌ GET failed:', getResponse.status, getResponse.statusText);
        }

    } catch (error) {
        console.error('❌ Error testing Netlify Function:', error.message);
    }
}

// Run the test
testNetlifyFunction()
    .then(() => {
        console.log('\n🎉 Test completed!');
        console.log('📋 Next steps:');
        console.log('   1. Deploy to Netlify');
        console.log('   2. Configure GitHub secrets');
        console.log('   3. Test GitHub Actions workflow');
    })
    .catch(error => {
        console.error('\n💥 Test failed:', error.message);
        process.exit(1);
    });
