"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConverter } from "@/contexts/ConverterContext";
import { translations } from "@/lib/translations";
import SwapButton from "./SwapButton";
import LastUpdated from "./LastUpdated";
import CurrencyInput from "./CurrencyInput";
import { useRouter } from "next/navigation";

export default function CurrencyConverter() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];
    const {
        fromCurrency,
        toCurrency,
        setFromCurrency: setContextFromCurrency,
        setToCurrency: setContextToCurrency,
        setPair
    } = useConverter();
    const router = useRouter();

    // Dynamic currency rates and currencies state
    const [currencyRates, setCurrencyRates] = useState<Record<string, number>>({});
    const [currencies, setCurrencies] = useState<Array<{ code: string, name: string, symbol: string, flag: string }>>([]);
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

    // Generate dynamic title based on current currencies
    const dynamicTitle = t.dynamicTitleFull
        .replace('{fromName}', t.currencyNames[fromCurrency as keyof typeof t.currencyNames] || fromCurrency)
        .replace('{toName}', t.currencyNames[toCurrency as keyof typeof t.currencyNames] || toCurrency);

    // Update dynamic title directly in the DOM when currencies change
    useEffect(() => {
        if (mounted) {
            // Find and update the h1 element in the page
            const h1Element = document.querySelector('h1.text-flare-primary');
            if (h1Element) {
                h1Element.textContent = dynamicTitle;
            }
        }
    }, [dynamicTitle, mounted]);

    // Load dynamic rates and currencies on component mount
    useEffect(() => {
        const loadRates = async () => {
            // Only use Supabase/Netlify in production
            // const isProduction = process.env.NODE_ENV === 'production';

            // if (!isProduction) {
            //     // Development: Use hardcoded rates (as before)
            //     setCurrencyRates(getHardcodedRates());
            //     setCurrencies(getHardcodedCurrencies());
            //     setIsLoadingCurrencies(false);
            //     return;
            // }

            try {
                // Production: Fetch cached payload first
                const payloadResponse = await fetch('/api/payload');
                const payloadData = await payloadResponse.json();

                if (payloadData.success && payloadData.data?.rates && payloadData.data?.currencies) {
                    const currenciesList = payloadData.data.currencies.map((item: {
                        code: string;
                        name: string;
                        symbol: string;
                        flag?: string;
                    }) => ({
                        code: item.code,
                        name: item.name,
                        symbol: item.symbol || item.code,
                        flag: item.flag || `https://www.xe.com/svgs/flags/${item.code.toLowerCase()}.static.svg`
                    }));

                    setCurrencyRates(payloadData.data.rates as Record<string, number>);
                    setCurrencies(currenciesList);
                    setIsLoadingCurrencies(false);
                    return;
                } else {
                    // Supabase API failed, try Netlify Blobs as fallback
                    try {
                        const netlifyResponse = await fetch('/.netlify/functions/currency-rates');

                        if (netlifyResponse.ok) {
                            const netlifyData = await netlifyResponse.json();

                            if (netlifyData.success && netlifyData.data) {
                                // Netlify Blobs format: data contains rates (object) and currencies (array)
                                const blobData = netlifyData.data;

                                // Transform rates from Netlify Blobs format (rates is already an object)
                                if (blobData.rates && typeof blobData.rates === 'object' && !Array.isArray(blobData.rates)) {
                                    setCurrencyRates(blobData.rates as Record<string, number>);
                                }

                                // Transform currencies from Netlify Blobs format
                                if (blobData.currencies && Array.isArray(blobData.currencies)) {
                                    const currenciesList = blobData.currencies.map((item: {
                                        code: string;
                                        name: string;
                                        symbol?: string | null;
                                        flag?: string;
                                    }) => ({
                                        code: item.code,
                                        name: item.name,
                                        symbol: item.symbol || item.code,
                                        flag: item.flag || `https://www.xe.com/svgs/flags/${item.code.toLowerCase()}.static.svg`
                                    }));
                                    setCurrencies(currenciesList);
                                    setIsLoadingCurrencies(false);
                                    return;
                                }
                            }
                        }
                    } catch {
                        // Silent fallback to Netlify Blobs failed
                    }

                    // If Netlify Blobs also fails, use hardcoded rates and currencies
                    setCurrencyRates(getHardcodedRates());
                    setCurrencies(getHardcodedCurrencies());
                    setIsLoadingCurrencies(false);
                }
            } catch {
                // Try Netlify Blobs as fallback when Supabase API throws error
                try {
                    const netlifyResponse = await fetch('/.netlify/functions/currency-rates');

                    if (netlifyResponse.ok) {
                        const netlifyData = await netlifyResponse.json();

                        if (netlifyData.success && netlifyData.data) {
                            const blobData = netlifyData.data;

                            // Transform rates from Netlify Blobs format (rates is already an object)
                            if (blobData.rates && typeof blobData.rates === 'object' && !Array.isArray(blobData.rates)) {
                                setCurrencyRates(blobData.rates as Record<string, number>);
                            }

                            // Transform currencies from Netlify Blobs format
                            if (blobData.currencies && Array.isArray(blobData.currencies)) {
                                const currenciesList = blobData.currencies.map((item: {
                                    code: string;
                                    name: string;
                                    symbol?: string | null;
                                    flag?: string;
                                }) => ({
                                    code: item.code,
                                    name: item.name,
                                    symbol: item.symbol || item.code,
                                    flag: item.flag || `https://www.xe.com/svgs/flags/${item.code.toLowerCase()}.static.svg`
                                }));
                                setCurrencies(currenciesList);
                                setIsLoadingCurrencies(false);
                                return;
                            }
                        }
                    }
                } catch {
                    // Silent fallback to Netlify Blobs failed
                }

                // Final fallback to hardcoded rates and currencies
                setCurrencyRates(getHardcodedRates());
                setCurrencies(getHardcodedCurrencies());
                setIsLoadingCurrencies(false);
            }
        };

        loadRates();
    }, []);

    useEffect(() => {
        if (isLoadingCurrencies || typeof window === "undefined") {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        const to = params.get('to');
        let updated = false;

        if (from && currencies.some(currency => currency.code === from.toUpperCase())) {
            setContextFromCurrency(from);
            updated = true;
        }

        if (to && currencies.some(currency => currency.code === to.toUpperCase())) {
            setContextToCurrency(to);
            updated = true;
        }

        if (updated && window.location.search) {
            router.replace(window.location.pathname, { scroll: false });
        }
    }, [currencies, isLoadingCurrencies, router, setContextFromCurrency, setContextToCurrency]);

    // Function to get hardcoded rates as fallback
    const getHardcodedRates = (): Record<string, number> => {
        return {
            "USD": 1,
            "EUR": 0.8608,      // 1/1.16169 (inversa)
            "CAD": 1.3987,      // 1/0.714945 (inversa)
            "CHF": 0.7953,      // 1/1.25743 (inversa)
            "GBP": 0.7482,      // 1/1.3365 (inversa)
            "AED": 3.6725,      // 1/0.272294 (inversa)
            "AFN": 66.35,       // 1/0.0150714 (inversa)
            "ALL": 83.22,       // 1/0.0120158 (inversa)
            "AMD": 381.85,      // 1/0.00261875 (inversa)
            "ANG": 1.8001,      // 1/0.555521 (inversa)
            "AOA": 917.68,      // 1/0.0010897 (inversa)
            "ARS": 1486.12,     // 1/0.00067287 (inversa)
            "AUD": 1.5417,      // 1/0.648644 (inversa)
            "AWG": 1.7900,      // 1/0.558659 (inversa)
            "AZN": 1.7000,      // 1/0.588235 (inversa)
            "BAM": 1.6837,      // 1/0.593943 (inversa)
            "BBD": 2.0000,      // 1/0.5 (inversa)
            "BDT": 122.08,      // 1/0.00819097 (inversa)
            "BGN": 1.6837,      // 1/0.593943 (inversa)
            "BHD": 0.3760,      // 1/2.65957 (inversa)
            "BIF": 2942.26,     // 1/0.000339876 (inversa)
            "BMD": 1,
            "BND": 1.2975,      // 1/0.770689 (inversa)
            "BOB": 6.9008,      // 1/0.144897 (inversa)
            "BRL": 5.4102,      // 1/0.184842 (inversa)
            "BTN": 87.73,       // 1/0.0113982 (inversa)
            "BWP": 14.21,       // 1/0.0703893 (inversa)
            "BYN": 3.4014,      // 1/0.294006 (inversa)
            "BZD": 2.0121,      // 1/0.496984 (inversa)
            "CDF": 2272.27,     // 1/0.000440093 (inversa)
            "CLP": 950.52,      // 1/0.00105206 (inversa)
            "CNY": 7.1250,      // 1/0.140351 (inversa)
            "COP": 3909.45,     // 1/0.000255789 (inversa)
            "CRC": 502.30,      // 1/0.00199085 (inversa)
            "CZK": 20.92,       // 1/0.0478036 (inversa)
            "DJF": 178.07,      // 1/0.00561568 (inversa)
            "DOP": 63.60,       // 1/0.0157237 (inversa)
            "DZD": 130.48,      // 1/0.00766403 (inversa)
            "EGP": 47.57,       // 1/0.0210232 (inversa)
            "ETB": 150.02,      // 1/0.00666569 (inversa)
            "FJD": 2.2988,      // 1/0.435017 (inversa)
            "GEL": 2.7116,      // 1/0.368797 (inversa)
            "GTQ": 7.6575,      // 1/0.130586 (inversa)
            "GYD": 208.69,      // 1/0.00479183 (inversa)
            "HKD": 7.7719,      // 1/0.128669 (inversa)
            "HNL": 26.26,       // 1/0.0380752 (inversa)
            "HRK": 6.4866,      // 1/0.154164 (inversa)
            "HUF": 334.90,      // 1/0.00298598 (inversa)
            "IDR": 16608.33,    // 1/0.0000602097 (inversa)
            "ILS": 3.3014,      // 1/0.30289 (inversa)
            "INR": 87.73,       // 1/0.0113981 (inversa)
            "IQD": 1307.82,     // 1/0.000764634 (inversa)
            "IRR": 42035.21,    // 1/0.0000237886 (inversa)
            "JMD": 160.52,      // 1/0.00623014 (inversa)
            "JOD": 0.7090,      // 1/1.41044 (inversa)
            "JPY": 151.69,      // 1/0.00659235 (inversa)
            "KES": 128.94,      // 1/0.00775537 (inversa)
            "KGS": 87.46,       // 1/0.0114334 (inversa)
            "KHR": 4034.19,     // 1/0.000247881 (inversa)
            "KMF": 423.55,      // 1/0.00236103 (inversa)
            "KRW": 1431.58,     // 1/0.000698532 (inversa)
            "KWD": 0.3065,      // 1/3.26299 (inversa)
            "KYD": 0.8307,      // 1/1.20377 (inversa)
            "KZT": 538.15,      // 1/0.00185815 (inversa)
            "LAK": 21699.28,    // 1/0.0000460867 (inversa)
            "LBP": 89322.22,    // 1/0.0000111952 (inversa)
            "LKR": 302.72,      // 1/0.00330334 (inversa)
            "LSL": 17.45,       // 1/0.0572981 (inversa)
            "LYD": 5.4259,      // 1/0.184297 (inversa)
            "MAD": 9.2483,      // 1/0.108129 (inversa)
            "MDL": 16.99,       // 1/0.0588652 (inversa)
            "MGA": 4476.92,     // 1/0.000223366 (inversa)
            "MKD": 53.08,       // 1/0.0188401 (inversa)
            "MNT": 3608.44,     // 1/0.000277125 (inversa)
            "MOP": 8.0050,      // 1/0.124922 (inversa)
            "MUR": 45.45,       // 1/0.0220043 (inversa)
            "MVR": 15.40,       // 1/0.0649263 (inversa)
            "MXN": 18.46,       // 1/0.0541764 (inversa)
            "MYR": 4.2300,      // 1/0.236418 (inversa)
            "MZN": 63.90,       // 1/0.0156495 (inversa)
            "NIO": 36.73,       // 1/0.027224 (inversa)
            "NOK": 10.03,       // 1/0.0997461 (inversa)
            "NPR": 140.44,      // 1/0.00712029 (inversa)
            "NZD": 1.7420,      // 1/0.574064 (inversa)
            "OMR": 0.3848,      // 1/2.59837 (inversa)
            "PAB": 1,
            "PEN": 3.3994,      // 1/0.29414 (inversa)
            "PGK": 4.2008,      // 1/0.238064 (inversa)
            "PHP": 58.44,       // 1/0.0171113 (inversa)
            "PKR": 282.13,      // 1/0.00354431 (inversa)
            "PLN": 3.6429,      // 1/0.2745 (inversa)
            "QAR": 3.6400,      // 1/0.274725 (inversa)
            "RON": 4.3752,      // 1/0.228557 (inversa)
            "RSD": 100.92,      // 1/0.00990909 (inversa)
            "RUB": 81.48,       // 1/0.0122733 (inversa)
            "RWF": 1448.68,    // 1/0.000690317 (inversa)
            "SAR": 3.7500,      // 1/0.266667 (inversa)
            "SBD": 8.4978,      // 1/0.117669 (inversa)
            "SCR": 14.26,       // 1/0.0701129 (inversa)
            "SDG": 601.48,      // 1/0.00166255 (inversa)
            "SEK": 9.4009,      // 1/0.106372 (inversa)
            "SGD": 1.2976,      // 1/0.770658 (inversa)
            "SRD": 39.75,       // 1/0.0251565 (inversa)
            "SYP": 11057.89,    // 1/0.0000904396 (inversa)
            "SZL": 17.45,       // 1/0.0572992 (inversa)
            "THB": 32.82,       // 1/0.0304671 (inversa)
            "TJS": 9.22,        // 1/0.108417 (inversa)
            "TMT": 3.4988,      // 1/0.285819 (inversa)
            "TND": 2.9348,      // 1/0.340744 (inversa)
            "TOP": 2.4078,      // 1/0.415315 (inversa)
            "TRY": 41.98,       // 1/0.0238233 (inversa)
            "TTD": 6.7826,      // 1/0.147452 (inversa)
            "TWD": 30.75,       // 1/0.0325199 (inversa)
            "TZS": 2481.18,     // 1/0.000403034 (inversa)
            "UAH": 41.83,       // 1/0.0239088 (inversa)
            "UGX": 3484.85,     // 1/0.000286979 (inversa)
            "UYU": 39.72,       // 1/0.0251777 (inversa)
            "VES": 208.75,      // 1/0.00479048 (inversa)
            "VND": 26348.68,    // 1/0.000037953 (inversa)
            "VUV": 121.83,      // 1/0.00820828 (inversa)
            "WST": 2.8050,      // 1/0.356503 (inversa)
            "XAF": 564.70,      // 1/0.00177095 (inversa)
            "XCD": 2.7074,      // 1/0.369363 (inversa)
            "XOF": 564.70,      // 1/0.00177095 (inversa)
            "XPF": 102.72,      // 1/0.00973477 (inversa)
            "ZMW": 22.39        // 1/0.0446666 (inversa)
        };
    };

    // Function to get hardcoded currencies as fallback
    const getHardcodedCurrencies = () => {
        return [
            { code: 'USD', name: 'US Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/usd.static.svg' },
            { code: 'EUR', name: 'Euro', symbol: '€', flag: 'https://www.xe.com/svgs/flags/eur.static.svg' },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: 'https://www.xe.com/svgs/flags/cad.static.svg' },
            { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: 'https://www.xe.com/svgs/flags/chf.static.svg' },
            { code: 'GBP', name: 'British Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/gbp.static.svg' },
            { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: 'https://www.xe.com/svgs/flags/aed.static.svg' },
            { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', flag: 'https://www.xe.com/svgs/flags/afn.static.svg' },
            { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: 'https://www.xe.com/svgs/flags/all.static.svg' },
            { code: 'AMD', name: 'Armenian Dram', symbol: '֏', flag: 'https://www.xe.com/svgs/flags/amd.static.svg' },
            { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ', flag: 'https://www.xe.com/svgs/flags/ang.static.svg' },
            { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', flag: 'https://www.xe.com/svgs/flags/aoa.static.svg' },
            { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/ars.static.svg' },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: 'https://www.xe.com/svgs/flags/aud.static.svg' },
            { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', flag: 'https://www.xe.com/svgs/flags/awg.static.svg' },
            { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: 'https://www.xe.com/svgs/flags/azn.static.svg' },
            { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'КМ', flag: 'https://www.xe.com/svgs/flags/bam.static.svg' },
            { code: 'BBD', name: 'Barbadian Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/bbd.static.svg' },
            { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: 'https://www.xe.com/svgs/flags/bdt.static.svg' },
            { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: 'https://www.xe.com/svgs/flags/bgn.static.svg' },
            { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', flag: 'https://www.xe.com/svgs/flags/bhd.static.svg' },
            { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', flag: 'https://www.xe.com/svgs/flags/bif.static.svg' },
            { code: 'BMD', name: 'Bermudian Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/bmd.static.svg' },
            { code: 'BND', name: 'Brunei Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/bnd.static.svg' },
            { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', flag: 'https://www.xe.com/svgs/flags/bob.static.svg' },
            { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: 'https://www.xe.com/svgs/flags/brl.static.svg' },
            { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', flag: 'https://www.xe.com/svgs/flags/btn.static.svg' },
            { code: 'BWP', name: 'Botswana Pula', symbol: 'P', flag: 'https://www.xe.com/svgs/flags/bwp.static.svg' },
            { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', flag: 'https://www.xe.com/svgs/flags/byn.static.svg' },
            { code: 'BZD', name: 'Belize Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/bzd.static.svg' },
            { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', flag: 'https://www.xe.com/svgs/flags/cdf.static.svg' },
            { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/clp.static.svg' },
            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/cny.static.svg' },
            { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/cop.static.svg' },
            { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', flag: 'https://www.xe.com/svgs/flags/crc.static.svg' },
            { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: 'https://www.xe.com/svgs/flags/czk.static.svg' },
            { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', flag: 'https://www.xe.com/svgs/flags/djf.static.svg' },
            { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: 'https://www.xe.com/svgs/flags/dop.static.svg' },
            { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', flag: 'https://www.xe.com/svgs/flags/dzd.static.svg' },
            { code: 'EGP', name: 'Egyptian Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/egp.static.svg' },
            { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: 'https://www.xe.com/svgs/flags/etb.static.svg' },
            { code: 'FJD', name: 'Fijian Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/fjd.static.svg' },
            { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: 'https://www.xe.com/svgs/flags/gel.static.svg' },
            { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: 'https://www.xe.com/svgs/flags/gtq.static.svg' },
            { code: 'GYD', name: 'Guyanese Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/gyd.static.svg' },
            { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: 'https://www.xe.com/svgs/flags/hkd.static.svg' },
            { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: 'https://www.xe.com/svgs/flags/hnl.static.svg' },
            { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: 'https://www.xe.com/svgs/flags/hrk.static.svg' },
            { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: 'https://www.xe.com/svgs/flags/huf.static.svg' },
            { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: 'https://www.xe.com/svgs/flags/idr.static.svg' },
            { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: 'https://www.xe.com/svgs/flags/ils.static.svg' },
            { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: 'https://www.xe.com/svgs/flags/inr.static.svg' },
            { code: 'IQD', name: 'Iraqi Dinar', symbol: 'د.ع', flag: 'https://www.xe.com/svgs/flags/iqd.static.svg' },
            { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', flag: 'https://www.xe.com/svgs/flags/irr.static.svg' },
            { code: 'JMD', name: 'Jamaican Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/jmd.static.svg' },
            { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', flag: 'https://www.xe.com/svgs/flags/jod.static.svg' },
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/jpy.static.svg' },
            { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: 'https://www.xe.com/svgs/flags/kes.static.svg' },
            { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', flag: 'https://www.xe.com/svgs/flags/kgs.static.svg' },
            { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: 'https://www.xe.com/svgs/flags/khr.static.svg' },
            { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', flag: 'https://www.xe.com/svgs/flags/kmf.static.svg' },
            { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: 'https://www.xe.com/svgs/flags/krw.static.svg' },
            { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: 'https://www.xe.com/svgs/flags/kwd.static.svg' },
            { code: 'KYD', name: 'Cayman Islands Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/kyd.static.svg' },
            { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', flag: 'https://www.xe.com/svgs/flags/kzt.static.svg' },
            { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: 'https://www.xe.com/svgs/flags/lak.static.svg' },
            { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', flag: 'https://www.xe.com/svgs/flags/lbp.static.svg' },
            { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', flag: 'https://www.xe.com/svgs/flags/lkr.static.svg' },
            { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', flag: 'https://www.xe.com/svgs/flags/lsl.static.svg' },
            { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', flag: 'https://www.xe.com/svgs/flags/lyd.static.svg' },
            { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', flag: 'https://www.xe.com/svgs/flags/mad.static.svg' },
            { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', flag: 'https://www.xe.com/svgs/flags/mdl.static.svg' },
            { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', flag: 'https://www.xe.com/svgs/flags/mga.static.svg' },
            { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', flag: 'https://www.xe.com/svgs/flags/mkd.static.svg' },
            { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', flag: 'https://www.xe.com/svgs/flags/mnt.static.svg' },
            { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', flag: 'https://www.xe.com/svgs/flags/mop.static.svg' },
            { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: 'https://www.xe.com/svgs/flags/mur.static.svg' },
            { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', flag: 'https://www.xe.com/svgs/flags/mvr.static.svg' },
            { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/mxn.static.svg' },
            { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: 'https://www.xe.com/svgs/flags/myr.static.svg' },
            { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: 'https://www.xe.com/svgs/flags/mzn.static.svg' },
            { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', flag: 'https://www.xe.com/svgs/flags/nio.static.svg' },
            { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: 'https://www.xe.com/svgs/flags/nok.static.svg' },
            { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', flag: 'https://www.xe.com/svgs/flags/npr.static.svg' },
            { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: 'https://www.xe.com/svgs/flags/nzd.static.svg' },
            { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: 'https://www.xe.com/svgs/flags/omr.static.svg' },
            { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', flag: 'https://www.xe.com/svgs/flags/pab.static.svg' },
            { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: 'https://www.xe.com/svgs/flags/pen.static.svg' },
            { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', flag: 'https://www.xe.com/svgs/flags/pgk.static.svg' },
            { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: 'https://www.xe.com/svgs/flags/php.static.svg' },
            { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: 'https://www.xe.com/svgs/flags/pkr.static.svg' },
            { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: 'https://www.xe.com/svgs/flags/pln.static.svg' },
            { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: 'https://www.xe.com/svgs/flags/qar.static.svg' },
            { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: 'https://www.xe.com/svgs/flags/ron.static.svg' },
            { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', flag: 'https://www.xe.com/svgs/flags/rsd.static.svg' },
            { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: 'https://www.xe.com/svgs/flags/rub.static.svg' },
            { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', flag: 'https://www.xe.com/svgs/flags/rwf.static.svg' },
            { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: 'https://www.xe.com/svgs/flags/sar.static.svg' },
            { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', flag: 'https://www.xe.com/svgs/flags/sbd.static.svg' },
            { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', flag: 'https://www.xe.com/svgs/flags/scr.static.svg' },
            { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', flag: 'https://www.xe.com/svgs/flags/sdg.static.svg' },
            { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: 'https://www.xe.com/svgs/flags/sek.static.svg' },
            { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: 'https://www.xe.com/svgs/flags/sgd.static.svg' },
            { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/srd.static.svg' },
            { code: 'SYP', name: 'Syrian Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/syp.static.svg' },
            { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E', flag: 'https://www.xe.com/svgs/flags/szl.static.svg' },
            { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: 'https://www.xe.com/svgs/flags/thb.static.svg' },
            { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM', flag: 'https://www.xe.com/svgs/flags/tjs.static.svg' },
            { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T', flag: 'https://www.xe.com/svgs/flags/tmt.static.svg' },
            { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', flag: 'https://www.xe.com/svgs/flags/tnd.static.svg' },
            { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', flag: 'https://www.xe.com/svgs/flags/top.static.svg' },
            { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: 'https://www.xe.com/svgs/flags/try.static.svg' },
            { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', flag: 'https://www.xe.com/svgs/flags/ttd.static.svg' },
            { code: 'TWD', name: 'Taiwan New Dollar', symbol: 'NT$', flag: 'https://www.xe.com/svgs/flags/twd.static.svg' },
            { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: 'https://www.xe.com/svgs/flags/tzs.static.svg' },
            { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: 'https://www.xe.com/svgs/flags/uah.static.svg' },
            { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: 'https://www.xe.com/svgs/flags/ugx.static.svg' },
            { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', flag: 'https://www.xe.com/svgs/flags/uyu.static.svg' },
            { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S', flag: 'https://www.xe.com/svgs/flags/ves.static.svg' },
            { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: 'https://www.xe.com/svgs/flags/vnd.static.svg' },
            { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', flag: 'https://www.xe.com/svgs/flags/vuv.static.svg' },
            { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', flag: 'https://www.xe.com/svgs/flags/wst.static.svg' },
            { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: 'https://www.xe.com/svgs/flags/xaf.static.svg' },
            { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', flag: 'https://www.xe.com/svgs/flags/xcd.static.svg' },
            { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: 'https://www.xe.com/svgs/flags/xof.static.svg' },
            { code: 'XPF', name: 'CFP Franc', symbol: '₣', flag: 'https://www.xe.com/svgs/flags/xpf.static.svg' },
            { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: 'https://www.xe.com/svgs/flags/zmw.static.svg' },
            { code: 'BSD', name: 'Bahamian Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/bsd.static.svg' },
            { code: 'CUP', name: 'Cuban Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/cup.static.svg' },
            { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$', flag: 'https://www.xe.com/svgs/flags/cve.static.svg' },
            { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: 'https://www.xe.com/svgs/flags/dkk.static.svg' },
            { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', flag: 'https://www.xe.com/svgs/flags/ern.static.svg' },
            { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/fkp.static.svg' },
            { code: 'GGP', name: 'Guernsey Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/ggp.static.svg' },
            { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: 'https://www.xe.com/svgs/flags/ghs.static.svg' },
            { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/gip.static.svg' },
            { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', flag: 'https://www.xe.com/svgs/flags/gmd.static.svg' },
            { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', flag: 'https://www.xe.com/svgs/flags/gnf.static.svg' },
            { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', flag: 'https://www.xe.com/svgs/flags/htg.static.svg' },
            { code: 'IMP', name: 'Isle of Man Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/imp.static.svg' },
            { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', flag: 'https://www.xe.com/svgs/flags/isk.static.svg' },
            { code: 'JEP', name: 'Jersey Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/jep.static.svg' },
            { code: 'LRD', name: 'Liberian Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/lrd.static.svg' },
            { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: 'https://www.xe.com/svgs/flags/mmk.static.svg' },
            { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', flag: 'https://www.xe.com/svgs/flags/mru.static.svg' },
            { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', flag: 'https://www.xe.com/svgs/flags/mwk.static.svg' },
            { code: 'NAD', name: 'Namibian Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/nad.static.svg' },
            { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: 'https://www.xe.com/svgs/flags/ngn.static.svg' },
            { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', flag: 'https://www.xe.com/svgs/flags/pyg.static.svg' },
            { code: 'SHP', name: 'Saint Helena Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/shp.static.svg' },
            { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', flag: 'https://www.xe.com/svgs/flags/sle.static.svg' },
            { code: 'SLL', name: 'Sierra Leonean Leone (Old)', symbol: 'Le', flag: 'https://www.xe.com/svgs/flags/sll.static.svg' },
            { code: 'SOS', name: 'Somali Shilling', symbol: 'S', flag: 'https://www.xe.com/svgs/flags/sos.static.svg' },
            { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db', flag: 'https://www.xe.com/svgs/flags/stn.static.svg' },
            { code: 'TVD', name: 'Tuvaluan Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/tvd.static.svg' },
            { code: 'UZS', name: 'Uzbekistani Som', symbol: 'лв', flag: 'https://www.xe.com/svgs/flags/uzs.static.svg' },
            { code: 'XCG', name: 'East Caribbean Dollar (Old)', symbol: 'EC$', flag: 'https://www.xe.com/svgs/flags/xcg.static.svg' },
            { code: 'XDR', name: 'Special Drawing Rights', symbol: 'SDR', flag: 'https://www.xe.com/svgs/flags/xdr.static.svg' },
            { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', flag: 'https://www.xe.com/svgs/flags/yer.static.svg' },
            { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: 'https://www.xe.com/svgs/flags/zar.static.svg' },
            { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/zwl.static.svg' }
        ];
    };

    const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
    const [toDropdownOpen, setToDropdownOpen] = useState(false);
    const fromAmountRef = useRef<HTMLInputElement>(null);
    const toAmountRef = useRef<HTMLInputElement>(null);
    const fromDropdownRef = useRef<HTMLDivElement>(null);
    const toDropdownRef = useRef<HTMLDivElement>(null);

    const [fromAmountDisplay, setFromAmountDisplay] = useState("1.00");

    // Debouncing refs
    const fromDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const toDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate initial rate from global rates
    const [toAmountDisplay, setToAmountDisplay] = useState("1.00");

    // Unified conversion system - single source of truth
    const performConversion = useCallback((fromValue: number, fromCurr: string, toCurr: string): number => {
        // Use dynamic rates instead of hardcoded ones
        const rates = currencyRates;

        if (Object.keys(rates).length === 0) {
            console.warn("Currency rates not loaded yet, using default conversion.");
            return fromValue; // Or handle as an error / loading state
        }

        if (fromCurr === 'USD') {
            // USD to other currency: use rate directly (now rates are already inversa)
            const rate = rates[toCurr] || 1;
            return fromValue * rate;
        } else if (toCurr === 'USD') {
            // Other currency to USD: use inverse rate (1 / rate)
            const rate = rates[fromCurr] || 1;
            return fromValue / rate;
        } else {
            // Cross-currency conversion: fromCurr -> USD -> toCurr
            // Step 1: Convert fromCurr to USD
            const fromRate = rates[fromCurr] || 1;
            const usdValue = fromValue / fromRate;
            // Step 2: Convert USD to toCurr
            const toRate = rates[toCurr] || 1;
            return usdValue * toRate;
        }
    }, [currencyRates]); // Depend on currencyRates

    // Calculate initial rate on mount (only when component first loads)
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current && fromCurrency !== toCurrency && Object.keys(currencyRates).length > 0) {
            const rate = performConversion(1, fromCurrency, toCurrency);
            setToAmountDisplay(rate.toFixed(2));
            hasInitialized.current = true;
        }
    }, [fromCurrency, toCurrency, performConversion, currencyRates]);

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

        setPair(newFromCurrency, newToCurrency);
        setFromAmountDisplay(newFromAmount);
        setToAmountDisplay(newToAmount);

        // Use requestAnimationFrame to ensure DOM is updated before selecting
        requestAnimationFrame(() => {
            if (fromAmountRef.current) {
                fromAmountRef.current.focus();
                fromAmountRef.current.select();
            }
        });
    }, [fromCurrency, toCurrency, fromAmountDisplay, toAmountDisplay, setPair]);

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
        setContextFromCurrency(newCurrency);

        // Recalculate conversion when from currency changes
        const fromValue = parseFloat(fromAmountDisplay.replace(/,/g, ''));
        if (!isNaN(fromValue) && fromValue >= 0) {
            const toValue = performConversion(fromValue, newCurrency, toCurrency);
            setToAmountDisplay(formatCurrencyValue(toValue.toFixed(2)));
        }
    }, [fromAmountDisplay, toCurrency, performConversion, formatCurrencyValue, setContextFromCurrency]);

    const handleToCurrencyChange = useCallback((newCurrency: string) => {
        setContextToCurrency(newCurrency);

        // Recalculate conversion when to currency changes
        const fromValue = parseFloat(fromAmountDisplay.replace(/,/g, ''));
        if (!isNaN(fromValue) && fromValue >= 0) {
            const toValue = performConversion(fromValue, fromCurrency, newCurrency);
            setToAmountDisplay(formatCurrencyValue(toValue.toFixed(2)));
        }
    }, [fromAmountDisplay, fromCurrency, performConversion, formatCurrencyValue, setContextToCurrency]);

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
                        isLoadingCurrencies={isLoadingCurrencies}
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
                        isLoadingCurrencies={isLoadingCurrencies}
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
