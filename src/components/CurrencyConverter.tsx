"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import SwapButton from "./SwapButton";
import LastUpdated from "./LastUpdated";
import CurrencyInput from "./CurrencyInput";

interface CurrencyConverterProps {
    onTitleChange?: (title: string) => void;
}

export default function CurrencyConverter({ onTitleChange }: CurrencyConverterProps) {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];

    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("DOP");

    // Generate dynamic title based on current currencies
    const dynamicTitle = t.dynamicTitleFull
        .replace('{fromName}', t.currencyNames[fromCurrency as keyof typeof t.currencyNames] || fromCurrency)
        .replace('{toName}', t.currencyNames[toCurrency as keyof typeof t.currencyNames] || toCurrency);


    // Update dynamic title when currencies change
    useEffect(() => {
        if (onTitleChange) {
            onTitleChange(dynamicTitle);
        }
    }, [dynamicTitle, onTitleChange]);

    const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
    const [toDropdownOpen, setToDropdownOpen] = useState(false);
    const fromAmountRef = useRef<HTMLInputElement>(null);
    const toAmountRef = useRef<HTMLInputElement>(null);
    const fromDropdownRef = useRef<HTMLDivElement>(null);
    const toDropdownRef = useRef<HTMLDivElement>(null);

    // Function to get rate using hardcoded currency rates for fast loading
    // DEPRECATED: This function is no longer used - replaced by performConversion
    // const getRate = useCallback((from: string, to: string): number => {
    //     // If same currency, return 1
    //     if (from === to) {
    //         return 1;
    //     }

    //     // Hardcoded currency rates (how many units = 1 USD) - for fast loading
    //     const currencyRates: Record<string, number> = {
    //         "USD": 1,
    //         "EUR": 1.16118,
    //         "CAD": 0.712406,
    //         "CHF": 1.25789,
    //         "GBP": 1.33633,
    //         "AED": 0.272294,
    //         "AFN": 0.0150597,
    //         "ALL": 0.0120378,
    //         "AMD": 0.00261114,
    //         "ANG": 0.555057,
    //         "AOA": 0.00108948,
    //         "ARS": 0.000673563,
    //         "AUD": 0.648904,
    //         "AWG": 0.558659,
    //         "AZN": 0.588234,
    //         "BAM": 0.594031,
    //         "BBD": 0.5,
    //         "BDT": 0.00819718,
    //         "BGN": 0.594031,
    //         "BHD": 2.65957,
    //         "BIF": 0.000339322,
    //         "BMD": 1,
    //         "BND": 0.770681,
    //         "BOB": 0.144712,
    //         "BRL": 0.185449,
    //         "BTN": 0.0113657,
    //         "BWP": 0.0725932,
    //         "BYN": 0.293656,
    //         "BZD": 0.496753,
    //         "CDF": 0.000456081,
    //         "CLP": 0.00105012,
    //         "CNY": 0.140444,
    //         "COP": 0.000257135,
    //         "CRC": 0.00199106,
    //         "CZK": 0.0478058,
    //         "DJF": 0.00561932,
    //         "DOP": 0.0157394,
    //         "DZD": 0.00766698,
    //         "EGP": 0.0210383,
    //         "ETB": 0.0066702,
    //         "FJD": 0.435387,
    //         "GEL": 0.369322,
    //         "GTQ": 0.13056,
    //         "GYD": 0.00478237,
    //         "HKD": 0.128689,
    //         "HNL": 0.0380466,
    //         "HRK": 0.154147,
    //         "HUF": 0.00298446,
    //         "IDR": 0.0000602486,
    //         "ILS": 0.303689,
    //         "INR": 0.0113651,
    //         "IQD": 0.00076315,
    //         "IRR": 0.00002377,
    //         "JMD": 0.00622253,
    //         "JOD": 1.41044,
    //         "JPY": 0.00659396,
    //         "KES": 0.00773983,
    //         "KGS": 0.0114338,
    //         "KHR": 0.000248028,
    //         "KMF": 0.00236094,
    //         "KRW": 0.000698907,
    //         "KWD": 3.26455,
    //         "KYD": 1.20337,
    //         "KZT": 0.00185658,
    //         "LAK": 0.0000460366,
    //         "LBP": 0.0000111542,
    //         "LKR": 0.00329979,
    //         "LSL": 0.0575102,
    //         "LYD": 0.184159,
    //         "MAD": 0.108296,
    //         "MDL": 0.0589756,
    //         "MGA": 0.000223389,
    //         "MKD": 0.0188483,
    //         "MNT": 0.000278196,
    //         "MOP": 0.124932,
    //         "MUR": 0.0220887,
    //         "MVR": 0.0649261,
    //         "MXN": 0.0542803,
    //         "MYR": 0.23647,
    //         "MZN": 0.0156493,
    //         "NIO": 0.0272099,
    //         "NOK": 0.0994481,
    //         "NPR": 0.00710107,
    //         "NZD": 0.574514,
    //         "OMR": 2.5993,
    //         "PAB": 1,
    //         "PEN": 0.295268,
    //         "PGK": 0.235214,
    //         "PHP": 0.0171673,
    //         "PKR": 0.00354251,
    //         "PLN": 0.27407,
    //         "QAR": 0.274725,
    //         "RON": 0.228532,
    //         "RSD": 0.00991139,
    //         "RUB": 0.0122895,
    //         "RWF": 0.000689531,
    //         "SAR": 0.266667,
    //         "SBD": 0.117652,
    //         "SCR": 0.0669145,
    //         "SDG": 0.00166322,
    //         "SEK": 0.106124,
    //         "SGD": 0.770766,
    //         "SRD": 0.0251251,
    //         "SYP": 0.0000894989,
    //         "SZL": 0.0575103,
    //         "THB": 0.0304271,
    //         "TJS": 0.10905,
    //         "TMT": 0.28582,
    //         "TND": 0.340804,
    //         "TOP": 0.415818,
    //         "TRY": 0.023832,
    //         "TTD": 0.147376,
    //         "TWD": 0.0326181,
    //         "TZS": 0.000405285,
    //         "UAH": 0.023953,
    //         "UGX": 0.000287394,
    //         "UYU": 0.025115,
    //         "VES": 0.00484169,
    //         "VND": 0.000037923,
    //         "VUV": 0.00821405,
    //         "WST": 0.356298,
    //         "XAF": 0.0017708,
    //         "XCD": 0.369369,
    //         "XOF": 0.0017708,
    //         "XPF": 0.00973394,
    //         "ZMW": 0.0442472
    //     };

    //     // Get rates for both currencies
    //     const fromRate = currencyRates[from];
    //     const toRate = currencyRates[to];

    //     if (fromRate && toRate) {
    //         // Calculate rate: fromRate / toRate
    //         // This gives us how many units of 'to' currency = 1 unit of 'from' currency
    //         const rate = fromRate / toRate;
    //         const roundedRate = Math.round(rate * 100) / 100;

    //         return roundedRate;
    //     }

    //     // Fallback if currency not found
    //     return 1;
    // }, []);

    const [fromAmountDisplay, setFromAmountDisplay] = useState("1.00");

    // Debouncing refs
    const fromDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const toDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate initial rate from global rates
    const [toAmountDisplay, setToAmountDisplay] = useState("1.00");

    // Unified conversion system - single source of truth
    const performConversion = useCallback((fromValue: number, fromCurr: string, toCurr: string): number => {
        // Get the rate directly from the currency rates
        const currencyRates: Record<string, number> = {
            "USD": 1,
            "EUR": 1.16118,
            "CAD": 0.712406,
            "CHF": 1.25789,
            "GBP": 1.33633,
            "AED": 0.272294,
            "AFN": 0.0150597,
            "ALL": 0.0120378,
            "AMD": 0.00261114,
            "ANG": 0.555057,
            "AOA": 0.00108948,
            "ARS": 0.000673563,
            "AUD": 0.648904,
            "AWG": 0.558659,
            "AZN": 0.588234,
            "BAM": 0.594031,
            "BBD": 0.5,
            "BDT": 0.00819718,
            "BGN": 0.594031,
            "BHD": 2.65957,
            "BIF": 0.000339322,
            "BMD": 1,
            "BND": 0.770681,
            "BOB": 0.144712,
            "BRL": 0.185449,
            "BTN": 0.0113657,
            "BWP": 0.0725932,
            "BYN": 0.293656,
            "BZD": 0.496753,
            "CDF": 0.000456081,
            "CLP": 0.00105012,
            "CNY": 0.140444,
            "COP": 0.000257135,
            "CRC": 0.00199106,
            "CZK": 0.0478058,
            "DJF": 0.00561932,
            "DOP": 0.0157394,
            "DZD": 0.00766698,
            "EGP": 0.0210383,
            "ETB": 0.0066702,
            "FJD": 0.435387,
            "GEL": 0.369322,
            "GTQ": 0.13056,
            "GYD": 0.00478237,
            "HKD": 0.128689,
            "HNL": 0.0380466,
            "HRK": 0.154147,
            "HUF": 0.00298446,
            "IDR": 0.0000602486,
            "ILS": 0.303689,
            "INR": 0.0113651,
            "IQD": 0.00076315,
            "IRR": 0.00002377,
            "JMD": 0.00622253,
            "JOD": 1.41044,
            "JPY": 0.00659396,
            "KES": 0.00773983,
            "KGS": 0.0114338,
            "KHR": 0.000248028,
            "KMF": 0.00236094,
            "KRW": 0.000698907,
            "KWD": 3.26455,
            "KYD": 1.20337,
            "KZT": 0.00185658,
            "LAK": 0.0000460366,
            "LBP": 0.0000111542,
            "LKR": 0.00329979,
            "LSL": 0.0575102,
            "LYD": 0.184159,
            "MAD": 0.108296,
            "MDL": 0.0589756,
            "MGA": 0.000223389,
            "MKD": 0.0188483,
            "MNT": 0.000278196,
            "MOP": 0.124932,
            "MUR": 0.0220887,
            "MVR": 0.0649261,
            "MXN": 0.0542803,
            "MYR": 0.23647,
            "MZN": 0.0156493,
            "NIO": 0.0272099,
            "NOK": 0.0994481,
            "NPR": 0.00710107,
            "NZD": 0.574514,
            "OMR": 2.5993,
            "PAB": 1,
            "PEN": 0.295268,
            "PGK": 0.235214,
            "PHP": 0.0171673,
            "PKR": 0.00354251,
            "PLN": 0.27407,
            "QAR": 0.274725,
            "RON": 0.228532,
            "RSD": 0.00991139,
            "RUB": 0.0122895,
            "RWF": 0.000689531,
            "SAR": 0.266667,
            "SBD": 0.117652,
            "SCR": 0.0669145,
            "SDG": 0.00166322,
            "SEK": 0.106124,
            "SGD": 0.770766,
            "SRD": 0.0251251,
            "SYP": 0.0000894989,
            "SZL": 0.0575103,
            "THB": 0.0304271,
            "TJS": 0.10905,
            "TMT": 0.28582,
            "TND": 0.340804,
            "TOP": 0.415818,
            "TRY": 0.023832,
            "TTD": 0.147376,
            "TWD": 0.0326181,
            "TZS": 0.000405285,
            "UAH": 0.023953,
            "UGX": 0.000287394,
            "UYU": 0.025115,
            "VES": 0.00484169,
            "VND": 0.000037923,
            "VUV": 0.00821405,
            "WST": 0.356298,
            "XAF": 0.0017708,
            "XCD": 0.369369,
            "XOF": 0.0017708,
            "XPF": 0.00973394,
            "ZMW": 0.0442472
        };

        if (fromCurr === 'USD') {
            // USD to other currency: use inverse rate (1 / rate)
            const rate = currencyRates[toCurr] || 1;
            return fromValue / rate;
        } else if (toCurr === 'USD') {
            // Other currency to USD: use rate directly
            const rate = currencyRates[fromCurr] || 1;
            return fromValue * rate;
        } else {
            // Cross-currency conversion: USD -> fromCurr -> toCurr
            const fromRate = currencyRates[fromCurr] || 1;
            const toRate = currencyRates[toCurr] || 1;
            return fromValue * (toRate / fromRate);
        }
    }, []);

    // Load initial rate on mount (only when component first loads)
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current && fromCurrency !== toCurrency) {
            const rate = performConversion(1, fromCurrency, toCurrency);
            setToAmountDisplay(rate.toFixed(2));
            hasInitialized.current = true;
        }
    }, [fromCurrency, toCurrency, performConversion]);

    // Helper function to format currency values
    const formatCurrencyValue = useCallback((value: string): string => {
        if (value === "" || value === "0") return "0.00";
        const num = parseFloat(value.replace(/,/g, ''));
        if (isNaN(num)) return "0.00";
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, []);

    // Helper function to sanitize input value
    const sanitizeInputValue = useCallback((value: string): string => {
        // Allow only numbers, decimal point, and commas
        let sanitizedValue = value.replace(/[^0-9.,]/g, '');

        // Handle leading zeros
        if (sanitizedValue.length > 1 && sanitizedValue.startsWith('0') && !sanitizedValue.startsWith('0.')) {
            // If it's "00", "000", etc., make it "0"
            if (sanitizedValue.match(/^0+$/)) {
                sanitizedValue = '0';
            } else {
                // If it's "01", "005", etc., remove leading zeros
                sanitizedValue = sanitizedValue.replace(/^0+/, '');
            }
        }

        // Prevent multiple decimal points
        const dotCount = (sanitizedValue.match(/\./g) || []).length;
        if (dotCount > 1) {
            // Keep only the first decimal point
            const firstDotIndex = sanitizedValue.indexOf('.');
            sanitizedValue = sanitizedValue.substring(0, firstDotIndex + 1) +
                sanitizedValue.substring(firstDotIndex + 1).replace(/\./g, '');
        }

        // Limit decimal places to 2
        if (sanitizedValue.includes('.')) {
            const parts = sanitizedValue.split('.');
            if (parts[1] && parts[1].length > 2) {
                sanitizedValue = parts[0] + '.' + parts[1].substring(0, 2);
            }
        }

        // Validate comma positions (thousands separators)
        const isValidCommaFormat = /^\d{1,3}(,\d{3})*(\.\d{0,2})?$/;
        if (sanitizedValue && !isValidCommaFormat.test(sanitizedValue)) {
            // If invalid comma format, remove commas and let blur handle formatting
            sanitizedValue = sanitizedValue.replace(/,/g, '');
        }

        // Check maximum value (10 million)
        const numericValue = parseFloat(sanitizedValue.replace(/,/g, ''));
        if (!isNaN(numericValue) && numericValue > 10000000) {
            sanitizedValue = "10000000";
        }

        return sanitizedValue;
    }, []);



    // Debounced conversion functions using unified system
    const debouncedFromConversion = useCallback((value: string) => {
        if (fromDebounceRef.current) {
            clearTimeout(fromDebounceRef.current);
        }

        fromDebounceRef.current = setTimeout(() => {
            const fromValue = parseFloat(value.replace(/,/g, ''));
            if (!isNaN(fromValue) && fromValue >= 0) {
                const toValue = performConversion(fromValue, fromCurrency, toCurrency);
                setToAmountDisplay(formatCurrencyValue(toValue.toFixed(2)));
            }
        }, 300);
    }, [fromCurrency, toCurrency, formatCurrencyValue, performConversion]);

    const debouncedToConversion = useCallback((value: string) => {
        if (toDebounceRef.current) {
            clearTimeout(toDebounceRef.current);
        }

        toDebounceRef.current = setTimeout(() => {
            const toValue = parseFloat(value.replace(/,/g, ''));
            if (!isNaN(toValue) && toValue >= 0) {
                // For reverse conversion: use performConversion with swapped currencies
                const fromValue = performConversion(toValue, toCurrency, fromCurrency);
                setFromAmountDisplay(formatCurrencyValue(fromValue.toFixed(2)));
            }
        }, 300);
    }, [fromCurrency, toCurrency, formatCurrencyValue, performConversion]);

    // Currency configuration
    const currencies = useMemo(() => [
        { code: 'USD', name: 'US Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/usd.static.svg' },
        { code: 'EUR', name: 'Euro', symbol: '€', flag: 'https://www.xe.com/svgs/flags/eur.static.svg' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: 'https://www.xe.com/svgs/flags/cad.static.svg' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: 'https://www.xe.com/svgs/flags/chf.static.svg' },
        { code: 'GBP', name: 'British Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/gbp.static.svg' },
        { code: 'AED', name: 'AED', symbol: 'AED', flag: 'https://www.xe.com/svgs/flags/aed.static.svg' },
        { code: 'AFN', name: 'AFN', symbol: 'AFN', flag: 'https://www.xe.com/svgs/flags/afn.static.svg' },
        { code: 'ALL', name: 'ALL', symbol: 'ALL', flag: 'https://www.xe.com/svgs/flags/all.static.svg' },
        { code: 'AMD', name: 'AMD', symbol: 'AMD', flag: 'https://www.xe.com/svgs/flags/amd.static.svg' },
        { code: 'ANG', name: 'ANG', symbol: 'ANG', flag: 'https://www.xe.com/svgs/flags/ang.static.svg' },
        { code: 'AOA', name: 'AOA', symbol: 'AOA', flag: 'https://www.xe.com/svgs/flags/aoa.static.svg' },
        { code: 'ARS', name: 'ARS', symbol: 'ARS', flag: 'https://www.xe.com/svgs/flags/ars.static.svg' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: 'https://www.xe.com/svgs/flags/aud.static.svg' },
        { code: 'AWG', name: 'AWG', symbol: 'AWG', flag: 'https://www.xe.com/svgs/flags/awg.static.svg' },
        { code: 'AZN', name: 'AZN', symbol: 'AZN', flag: 'https://www.xe.com/svgs/flags/azn.static.svg' },
        { code: 'BAM', name: 'BAM', symbol: 'BAM', flag: 'https://www.xe.com/svgs/flags/bam.static.svg' },
        { code: 'BBD', name: 'BBD', symbol: 'BBD', flag: 'https://www.xe.com/svgs/flags/bbd.static.svg' },
        { code: 'BDT', name: 'BDT', symbol: 'BDT', flag: 'https://www.xe.com/svgs/flags/bdt.static.svg' },
        { code: 'BGN', name: 'BGN', symbol: 'BGN', flag: 'https://www.xe.com/svgs/flags/bgn.static.svg' },
        { code: 'BHD', name: 'BHD', symbol: 'BHD', flag: 'https://www.xe.com/svgs/flags/bhd.static.svg' },
        { code: 'BIF', name: 'BIF', symbol: 'BIF', flag: 'https://www.xe.com/svgs/flags/bif.static.svg' },
        { code: 'BMD', name: 'BMD', symbol: 'BMD', flag: 'https://www.xe.com/svgs/flags/bmd.static.svg' },
        { code: 'BND', name: 'BND', symbol: 'BND', flag: 'https://www.xe.com/svgs/flags/bnd.static.svg' },
        { code: 'BOB', name: 'BOB', symbol: 'BOB', flag: 'https://www.xe.com/svgs/flags/bob.static.svg' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: 'https://www.xe.com/svgs/flags/brl.static.svg' },
        { code: 'BTN', name: 'BTN', symbol: 'BTN', flag: 'https://www.xe.com/svgs/flags/btn.static.svg' },
        { code: 'BWP', name: 'BWP', symbol: 'BWP', flag: 'https://www.xe.com/svgs/flags/bwp.static.svg' },
        { code: 'BYN', name: 'BYN', symbol: 'BYN', flag: 'https://www.xe.com/svgs/flags/byn.static.svg' },
        { code: 'BZD', name: 'BZD', symbol: 'BZD', flag: 'https://www.xe.com/svgs/flags/bzd.static.svg' },
        { code: 'CDF', name: 'CDF', symbol: 'CDF', flag: 'https://www.xe.com/svgs/flags/cdf.static.svg' },
        { code: 'CLP', name: 'CLP', symbol: 'CLP', flag: 'https://www.xe.com/svgs/flags/clp.static.svg' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/cny.static.svg' },
        { code: 'COP', name: 'COP', symbol: 'COP', flag: 'https://www.xe.com/svgs/flags/cop.static.svg' },
        { code: 'CRC', name: 'CRC', symbol: 'CRC', flag: 'https://www.xe.com/svgs/flags/crc.static.svg' },
        { code: 'CZK', name: 'CZK', symbol: 'CZK', flag: 'https://www.xe.com/svgs/flags/czk.static.svg' },
        { code: 'DJF', name: 'DJF', symbol: 'DJF', flag: 'https://www.xe.com/svgs/flags/djf.static.svg' },
        { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: 'https://www.xe.com/svgs/flags/dop.static.svg' },
        { code: 'DZD', name: 'DZD', symbol: 'DZD', flag: 'https://www.xe.com/svgs/flags/dzd.static.svg' },
        { code: 'EGP', name: 'EGP', symbol: 'EGP', flag: 'https://www.xe.com/svgs/flags/egp.static.svg' },
        { code: 'ETB', name: 'ETB', symbol: 'ETB', flag: 'https://www.xe.com/svgs/flags/etb.static.svg' },
        { code: 'FJD', name: 'FJD', symbol: 'FJD', flag: 'https://www.xe.com/svgs/flags/fjd.static.svg' },
        { code: 'GEL', name: 'GEL', symbol: 'GEL', flag: 'https://www.xe.com/svgs/flags/gel.static.svg' },
        { code: 'GTQ', name: 'GTQ', symbol: 'GTQ', flag: 'https://www.xe.com/svgs/flags/gtq.static.svg' },
        { code: 'GYD', name: 'GYD', symbol: 'GYD', flag: 'https://www.xe.com/svgs/flags/gyd.static.svg' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: 'https://www.xe.com/svgs/flags/hkd.static.svg' },
        { code: 'HNL', name: 'HNL', symbol: 'HNL', flag: 'https://www.xe.com/svgs/flags/hnl.static.svg' },
        { code: 'HRK', name: 'HRK', symbol: 'HRK', flag: 'https://www.xe.com/svgs/flags/hrk.static.svg' },
        { code: 'HUF', name: 'HUF', symbol: 'HUF', flag: 'https://www.xe.com/svgs/flags/huf.static.svg' },
        { code: 'IDR', name: 'IDR', symbol: 'IDR', flag: 'https://www.xe.com/svgs/flags/idr.static.svg' },
        { code: 'ILS', name: 'ILS', symbol: 'ILS', flag: 'https://www.xe.com/svgs/flags/ils.static.svg' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: 'https://www.xe.com/svgs/flags/inr.static.svg' },
        { code: 'IQD', name: 'IQD', symbol: 'IQD', flag: 'https://www.xe.com/svgs/flags/iqd.static.svg' },
        { code: 'IRR', name: 'IRR', symbol: 'IRR', flag: 'https://www.xe.com/svgs/flags/irr.static.svg' },
        { code: 'JMD', name: 'JMD', symbol: 'JMD', flag: 'https://www.xe.com/svgs/flags/jmd.static.svg' },
        { code: 'JOD', name: 'JOD', symbol: 'JOD', flag: 'https://www.xe.com/svgs/flags/jod.static.svg' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/jpy.static.svg' },
        { code: 'KES', name: 'KES', symbol: 'KES', flag: 'https://www.xe.com/svgs/flags/kes.static.svg' },
        { code: 'KGS', name: 'KGS', symbol: 'KGS', flag: 'https://www.xe.com/svgs/flags/kgs.static.svg' },
        { code: 'KHR', name: 'KHR', symbol: 'KHR', flag: 'https://www.xe.com/svgs/flags/khr.static.svg' },
        { code: 'KMF', name: 'KMF', symbol: 'KMF', flag: 'https://www.xe.com/svgs/flags/kmf.static.svg' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: 'https://www.xe.com/svgs/flags/krw.static.svg' },
        { code: 'KWD', name: 'KWD', symbol: 'KWD', flag: 'https://www.xe.com/svgs/flags/kwd.static.svg' },
        { code: 'KYD', name: 'KYD', symbol: 'KYD', flag: 'https://www.xe.com/svgs/flags/kyd.static.svg' },
        { code: 'KZT', name: 'KZT', symbol: 'KZT', flag: 'https://www.xe.com/svgs/flags/kzt.static.svg' },
        { code: 'LAK', name: 'LAK', symbol: 'LAK', flag: 'https://www.xe.com/svgs/flags/lak.static.svg' },
        { code: 'LBP', name: 'LBP', symbol: 'LBP', flag: 'https://www.xe.com/svgs/flags/lbp.static.svg' },
        { code: 'LKR', name: 'LKR', symbol: 'LKR', flag: 'https://www.xe.com/svgs/flags/lkr.static.svg' },
        { code: 'LSL', name: 'LSL', symbol: 'LSL', flag: 'https://www.xe.com/svgs/flags/lsl.static.svg' },
        { code: 'LYD', name: 'LYD', symbol: 'LYD', flag: 'https://www.xe.com/svgs/flags/lyd.static.svg' },
        { code: 'MAD', name: 'MAD', symbol: 'MAD', flag: 'https://www.xe.com/svgs/flags/mad.static.svg' },
        { code: 'MDL', name: 'MDL', symbol: 'MDL', flag: 'https://www.xe.com/svgs/flags/mdl.static.svg' },
        { code: 'MGA', name: 'MGA', symbol: 'MGA', flag: 'https://www.xe.com/svgs/flags/mga.static.svg' },
        { code: 'MKD', name: 'MKD', symbol: 'MKD', flag: 'https://www.xe.com/svgs/flags/mkd.static.svg' },
        { code: 'MNT', name: 'MNT', symbol: 'MNT', flag: 'https://www.xe.com/svgs/flags/mnt.static.svg' },
        { code: 'MOP', name: 'MOP', symbol: 'MOP', flag: 'https://www.xe.com/svgs/flags/mop.static.svg' },
        { code: 'MUR', name: 'MUR', symbol: 'MUR', flag: 'https://www.xe.com/svgs/flags/mur.static.svg' },
        { code: 'MVR', name: 'MVR', symbol: 'MVR', flag: 'https://www.xe.com/svgs/flags/mvr.static.svg' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/mxn.static.svg' },
        { code: 'MYR', name: 'MYR', symbol: 'MYR', flag: 'https://www.xe.com/svgs/flags/myr.static.svg' },
        { code: 'MZN', name: 'MZN', symbol: 'MZN', flag: 'https://www.xe.com/svgs/flags/mzn.static.svg' },
        { code: 'NIO', name: 'NIO', symbol: 'NIO', flag: 'https://www.xe.com/svgs/flags/nio.static.svg' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: 'https://www.xe.com/svgs/flags/nok.static.svg' },
        { code: 'NPR', name: 'NPR', symbol: 'NPR', flag: 'https://www.xe.com/svgs/flags/npr.static.svg' },
        { code: 'NZD', name: 'NZD', symbol: 'NZD', flag: 'https://www.xe.com/svgs/flags/nzd.static.svg' },
        { code: 'OMR', name: 'OMR', symbol: 'OMR', flag: 'https://www.xe.com/svgs/flags/omr.static.svg' },
        { code: 'PAB', name: 'PAB', symbol: 'PAB', flag: 'https://www.xe.com/svgs/flags/pab.static.svg' },
        { code: 'PEN', name: 'PEN', symbol: 'PEN', flag: 'https://www.xe.com/svgs/flags/pen.static.svg' },
        { code: 'PGK', name: 'PGK', symbol: 'PGK', flag: 'https://www.xe.com/svgs/flags/pgk.static.svg' },
        { code: 'PHP', name: 'PHP', symbol: 'PHP', flag: 'https://www.xe.com/svgs/flags/php.static.svg' },
        { code: 'PKR', name: 'PKR', symbol: 'PKR', flag: 'https://www.xe.com/svgs/flags/pkr.static.svg' },
        { code: 'PLN', name: 'PLN', symbol: 'PLN', flag: 'https://www.xe.com/svgs/flags/pln.static.svg' },
        { code: 'QAR', name: 'QAR', symbol: 'QAR', flag: 'https://www.xe.com/svgs/flags/qar.static.svg' },
        { code: 'RON', name: 'RON', symbol: 'RON', flag: 'https://www.xe.com/svgs/flags/ron.static.svg' },
        { code: 'RSD', name: 'RSD', symbol: 'RSD', flag: 'https://www.xe.com/svgs/flags/rsd.static.svg' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: 'https://www.xe.com/svgs/flags/rub.static.svg' },
        { code: 'RWF', name: 'RWF', symbol: 'RWF', flag: 'https://www.xe.com/svgs/flags/rwf.static.svg' },
        { code: 'SAR', name: 'SAR', symbol: 'SAR', flag: 'https://www.xe.com/svgs/flags/sar.static.svg' },
        { code: 'SBD', name: 'SBD', symbol: 'SBD', flag: 'https://www.xe.com/svgs/flags/sbd.static.svg' },
        { code: 'SCR', name: 'SCR', symbol: 'SCR', flag: 'https://www.xe.com/svgs/flags/scr.static.svg' },
        { code: 'SDG', name: 'SDG', symbol: 'SDG', flag: 'https://www.xe.com/svgs/flags/sdg.static.svg' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: 'https://www.xe.com/svgs/flags/sek.static.svg' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: 'https://www.xe.com/svgs/flags/sgd.static.svg' },
        { code: 'SRD', name: 'SRD', symbol: 'SRD', flag: 'https://www.xe.com/svgs/flags/srd.static.svg' },
        { code: 'SYP', name: 'SYP', symbol: 'SYP', flag: 'https://www.xe.com/svgs/flags/syp.static.svg' },
        { code: 'SZL', name: 'SZL', symbol: 'SZL', flag: 'https://www.xe.com/svgs/flags/szl.static.svg' },
        { code: 'THB', name: 'THB', symbol: 'THB', flag: 'https://www.xe.com/svgs/flags/thb.static.svg' },
        { code: 'TJS', name: 'TJS', symbol: 'TJS', flag: 'https://www.xe.com/svgs/flags/tjs.static.svg' },
        { code: 'TMT', name: 'TMT', symbol: 'TMT', flag: 'https://www.xe.com/svgs/flags/tmt.static.svg' },
        { code: 'TND', name: 'TND', symbol: 'TND', flag: 'https://www.xe.com/svgs/flags/tnd.static.svg' },
        { code: 'TOP', name: 'TOP', symbol: 'TOP', flag: 'https://www.xe.com/svgs/flags/top.static.svg' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: 'https://www.xe.com/svgs/flags/try.static.svg' },
        { code: 'TTD', name: 'TTD', symbol: 'TTD', flag: 'https://www.xe.com/svgs/flags/ttd.static.svg' },
        { code: 'TWD', name: 'TWD', symbol: 'TWD', flag: 'https://www.xe.com/svgs/flags/twd.static.svg' },
        { code: 'TZS', name: 'TZS', symbol: 'TZS', flag: 'https://www.xe.com/svgs/flags/tzs.static.svg' },
        { code: 'UAH', name: 'UAH', symbol: 'UAH', flag: 'https://www.xe.com/svgs/flags/uah.static.svg' },
        { code: 'UGX', name: 'UGX', symbol: 'UGX', flag: 'https://www.xe.com/svgs/flags/ugx.static.svg' },
        { code: 'UYU', name: 'UYU', symbol: 'UYU', flag: 'https://www.xe.com/svgs/flags/uyu.static.svg' },
        { code: 'VES', name: 'VES', symbol: 'VES', flag: 'https://www.xe.com/svgs/flags/ves.static.svg' },
        { code: 'VND', name: 'VND', symbol: 'VND', flag: 'https://www.xe.com/svgs/flags/vnd.static.svg' },
        { code: 'VUV', name: 'VUV', symbol: 'VUV', flag: 'https://www.xe.com/svgs/flags/vuv.static.svg' },
        { code: 'WST', name: 'WST', symbol: 'WST', flag: 'https://www.xe.com/svgs/flags/wst.static.svg' },
        { code: 'XAF', name: 'XAF', symbol: 'XAF', flag: 'https://www.xe.com/svgs/flags/xaf.static.svg' },
        { code: 'XCD', name: 'XCD', symbol: 'XCD', flag: 'https://www.xe.com/svgs/flags/xcd.static.svg' },
        { code: 'XOF', name: 'XOF', symbol: 'XOF', flag: 'https://www.xe.com/svgs/flags/xof.static.svg' },
        { code: 'XPF', name: 'XPF', symbol: 'XPF', flag: 'https://www.xe.com/svgs/flags/xpf.static.svg' },
        { code: 'ZMW', name: 'ZMW', symbol: 'ZMW', flag: 'https://www.xe.com/svgs/flags/zmw.static.svg' }
    ], []);

    // Get available currencies for dropdown (exclude the other currency to prevent same selection)
    // Put the currently selected currency at the top of the list
    const getAvailableCurrencies = useCallback((excludeCurrency: string, selectedCurrency?: string) => {
        const availableCurrencies = currencies.filter(c => c.code !== excludeCurrency);

        if (selectedCurrency) {
            // Find the selected currency and move it to the top
            const selectedIndex = availableCurrencies.findIndex(c => c.code === selectedCurrency);
            if (selectedIndex > 0) {
                const selected = availableCurrencies[selectedIndex];
                const others = availableCurrencies.filter(c => c.code !== selectedCurrency);
                return [selected, ...others];
            }
        }

        return availableCurrencies;
    }, [currencies]);

    // Handle currency swap
    const handleSwapCurrencies = useCallback(() => {
        const newFromCurrency = toCurrency;
        const newToCurrency = fromCurrency;
        const newFromAmount = toAmountDisplay;
        const newToAmount = fromAmountDisplay;

        // Clear any pending debounced conversions
        if (fromDebounceRef.current) {
            clearTimeout(fromDebounceRef.current);
        }
        if (toDebounceRef.current) {
            clearTimeout(toDebounceRef.current);
        }

        // Swap currencies and values directly
        setFromCurrency(newFromCurrency);
        setToCurrency(newToCurrency);
        setFromAmountDisplay(newFromAmount);
        setToAmountDisplay(newToAmount);

        // Trigger conversion after swap
        setTimeout(() => {
            const fromValue = parseFloat(newFromAmount.replace(/,/g, ''));
            if (!isNaN(fromValue) && fromValue >= 0) {
                const toValue = performConversion(fromValue, newFromCurrency, newToCurrency);
                setToAmountDisplay(formatCurrencyValue(toValue.toFixed(2)));
            }

            if (fromAmountRef.current) {
                fromAmountRef.current.focus();
                fromAmountRef.current.select();
            }
        }, 100);
    }, [fromCurrency, toCurrency, fromAmountDisplay, toAmountDisplay, formatCurrencyValue, performConversion]);

    // Auto-focus and select all text on left input when component mounts
    useEffect(() => {
        if (mounted && fromAmountRef.current) {
            fromAmountRef.current.focus();
            fromAmountRef.current.select();
        }
    }, [mounted]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (fromDebounceRef.current) {
                clearTimeout(fromDebounceRef.current);
            }
            if (toDebounceRef.current) {
                clearTimeout(toDebounceRef.current);
            }
        };
    }, []);

    // Handle currency changes with unified conversion
    const handleFromCurrencyChange = useCallback((newCurrency: string) => {
        setFromCurrency(newCurrency);

        // Recalculate conversion when from currency changes
        const fromValue = parseFloat(fromAmountDisplay.replace(/,/g, ''));
        if (!isNaN(fromValue) && fromValue >= 0) {
            const toValue = performConversion(fromValue, newCurrency, toCurrency);
            setToAmountDisplay(formatCurrencyValue(toValue.toFixed(2)));
        }
    }, [fromAmountDisplay, toCurrency, performConversion, formatCurrencyValue]);

    const handleToCurrencyChange = useCallback((newCurrency: string) => {
        setToCurrency(newCurrency);

        // Recalculate conversion when to currency changes
        const fromValue = parseFloat(fromAmountDisplay.replace(/,/g, ''));
        if (!isNaN(fromValue) && fromValue >= 0) {
            const toValue = performConversion(fromValue, fromCurrency, newCurrency);
            setToAmountDisplay(formatCurrencyValue(toValue.toFixed(2)));
        }
    }, [fromAmountDisplay, fromCurrency, performConversion, formatCurrencyValue]);

    // Dropdown handlers
    const handleFromDropdownClick = useCallback(() => {
        setFromDropdownOpen(!fromDropdownOpen);
        setToDropdownOpen(false);
    }, [fromDropdownOpen]);

    const handleToDropdownClick = useCallback(() => {
        setToDropdownOpen(!toDropdownOpen);
        setFromDropdownOpen(false);
    }, [toDropdownOpen]);

    // Handle clicks outside dropdowns to close them
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Check if click is outside from dropdown
            if (fromDropdownRef.current && !fromDropdownRef.current.contains(target)) {
                setFromDropdownOpen(false);
            }

            // Check if click is outside to dropdown
            if (toDropdownRef.current && !toDropdownRef.current.contains(target)) {
                setToDropdownOpen(false);
            }
        };

        // Add event listener when any dropdown is open
        if (fromDropdownOpen || toDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [fromDropdownOpen, toDropdownOpen]);

    return (
        <>
            <div className="currency-input-group flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8 relative">
                {/* From Currency Section */}
                <div className="w-full lg:flex-1 order-1 lg:order-1">
                    <CurrencyInput
                        value={fromAmountDisplay}
                        onChange={(value) => {
                            const sanitizedValue = sanitizeInputValue(value);
                            setFromAmountDisplay(sanitizedValue);
                            debouncedFromConversion(sanitizedValue);
                        }}
                        onFocus={() => { }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            if (value === "") {
                                setFromAmountDisplay("1.00");
                                const toValue = performConversion(1, fromCurrency, toCurrency);
                                setToAmountDisplay(formatCurrencyValue(toValue.toFixed(2)));
                            } else {
                                const formattedValue = formatCurrencyValue(value);
                                setFromAmountDisplay(formattedValue);
                            }
                        }}
                        placeholder={t.enterAmount}
                        currency={fromCurrency}
                        onCurrencyChange={handleFromCurrencyChange}
                        availableCurrencies={getAvailableCurrencies(toCurrency, fromCurrency)}
                        isDropdownOpen={fromDropdownOpen}
                        onDropdownToggle={handleFromDropdownClick}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) return;
                            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                            if (!/^[0-9.,]$/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        onClick={(e) => e.currentTarget.select()}
                        currencyNames={t.currencyNames}
                        ariaLabel={t.fromCurrency}
                        inputRef={fromAmountRef}
                        dropdownRef={fromDropdownRef}
                        t={{
                            searchCurrency: t.searchCurrency,
                            noCurrenciesFound: t.noCurrenciesFound
                        }}
                    />
                </div>

                {/* Swap Button - Centered on Mobile, Between inputs on Desktop */}
                <div className="flex-shrink-0 order-2 lg:order-2 flex justify-center lg:justify-center my-2 lg:my-0">
                    <SwapButton
                        onClick={handleSwapCurrencies}
                        size="md"
                        variant="default"
                    />
                </div>

                {/* To Currency Section */}
                <div className="w-full lg:flex-1 order-3 lg:order-3">
                    <CurrencyInput
                        value={toAmountDisplay}
                        onChange={(value) => {
                            const sanitizedValue = sanitizeInputValue(value);
                            setToAmountDisplay(sanitizedValue);
                            debouncedToConversion(sanitizedValue);
                        }}
                        onFocus={() => { }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            if (value === "" || value === "0" || value === "0." || value === "0.0" || value === "0.00") {
                                setToAmountDisplay("1.00");
                                const fromValue = performConversion(1, toCurrency, fromCurrency);
                                setFromAmountDisplay(formatCurrencyValue(fromValue.toFixed(2)));
                            } else {
                                const formattedValue = formatCurrencyValue(value);
                                setToAmountDisplay(formattedValue);
                            }
                        }}
                        placeholder={t.enterAmount}
                        currency={toCurrency}
                        onCurrencyChange={handleToCurrencyChange}
                        availableCurrencies={getAvailableCurrencies(fromCurrency, toCurrency)}
                        isDropdownOpen={toDropdownOpen}
                        onDropdownToggle={handleToDropdownClick}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) return;
                            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                            if (!/^[0-9.,]$/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        onClick={(e) => e.currentTarget.select()}
                        currencyNames={t.currencyNames}
                        ariaLabel={t.toCurrency}
                        inputRef={toAmountRef}
                        dropdownRef={toDropdownRef}
                        t={{
                            searchCurrency: t.searchCurrency,
                            noCurrenciesFound: t.noCurrenciesFound
                        }}
                    />
                </div>
            </div>


            {/* Last Updated below the converter */}
            <div className="mt-6">
                <LastUpdated />
            </div>
        </>
    );
}
