"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConverter } from "@/contexts/ConverterContext";
import { translations } from "@/lib/translations";
import LastUpdated from "./LastUpdated";
import CurrencyInput from "./CurrencyInput";
import CurrencyRow from "./CurrencyRow";
import CurrencyRowValueSlot from "./CurrencyRowValueSlot";
import CurrencyRowSelector from "./CurrencyRowSelector";
import CurrencySelectModal from "./CurrencySelectModal";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CurrencyConverter() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];
    const {
        fromCurrency,
        toCurrency,
        toCurrencies,
        setFromCurrency: setContextFromCurrency,
        addToCurrency,
        removeToCurrency,
        setPair,
        setPairMultiple
    } = useConverter();
    const router = useRouter();

    // Dynamic currency rates and currencies state
    const [currencyRates, setCurrencyRates] = useState<Record<string, number>>({});
    const [currencies, setCurrencies] = useState<Array<{ code: string, name: string, symbol: string, flag: string }>>([]);
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

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
        const fromCode = from?.toUpperCase();
        const toCode = to?.toUpperCase();

        if (fromCode && currencies.some((c) => c.code === fromCode)) {
            if (toCode && currencies.some((c) => c.code === toCode)) {
                setPair(fromCode, toCode);
            } else {
                setContextFromCurrency(fromCode);
            }
            updated = true;
        } else if (toCode && currencies.some((c) => c.code === toCode)) {
            setPair(fromCurrency, toCode);
            updated = true;
        }

        if (updated && window.location.search) {
            router.replace(window.location.pathname, { scroll: false });
        }
    }, [currencies, isLoadingCurrencies, router, fromCurrency, setContextFromCurrency, setPair]);

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
    const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
    const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragOverIndexRef = useRef<number | null>(null);
    const touchDragRef = useRef<{ startIndex: number; touchId: number; startY: number; activated: boolean; longPressRequired?: boolean; longPressTimerId?: ReturnType<typeof setTimeout> } | null>(null);
    const justDidDragRef = useRef(false);
    const addCurrencyDropdownRef = useRef<HTMLDivElement>(null);
    const fromAmountRef = useRef<HTMLInputElement>(null);
    const fromDropdownRef = useRef<HTMLDivElement>(null);

    // Edit-any behavior (like single pair + swap): whichever field you edit becomes the source; others calculate from it.
    const [baseAmount, setBaseAmount] = useState(1);
    const [baseCurrency, setBaseCurrency] = useState(fromCurrency);
    const [usdInputRaw, setUsdInputRaw] = useState<string | null>(null);
    const [cardInputRaw, setCardInputRaw] = useState<{ code: string; value: string } | null>(null);

    const fromDebounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => setBaseCurrency((prev) => (prev === fromCurrency ? prev : fromCurrency)), [fromCurrency]);
    useEffect(() => { if (cardInputRaw && !toCurrencies.includes(cardInputRaw.code)) setCardInputRaw(null); }, [cardInputRaw, toCurrencies]);
    useEffect(() => { dragOverIndexRef.current = dragOverIndex; }, [dragOverIndex]);

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
    }, [currencyRates]);

    useEffect(() => {
        const validBase = baseCurrency === fromCurrency || toCurrencies.includes(baseCurrency);
        if (!validBase) {
            setBaseCurrency(fromCurrency);
            setBaseAmount(performConversion(baseAmount, baseCurrency, fromCurrency));
        }
    }, [baseCurrency, fromCurrency, toCurrencies, baseAmount, performConversion]);

    // --- Format & conversion helpers ---
    const formatCurrencyValue = useCallback((value: string): string => {
        if (value === "" || value === "0") return "0.00";
        const num = parseFloat(value.replace(/,/g, ''));
        if (isNaN(num)) return "0.00";
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, []);

    const setBaseFromAmount = useCallback((amount: number, currency: string) => {
        if (!Number.isNaN(amount) && amount >= 0) {
            setBaseAmount(amount);
            setBaseCurrency(currency);
        }
    }, []);

    const handleAmountKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) return;
        if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
        if (!/^[0-9.,]$/.test(e.key)) e.preventDefault();
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



    const debouncedFromConversion = useCallback(() => {
        if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
        fromDebounceRef.current = setTimeout(() => {}, 300);
    }, []);

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


    // Auto-focus and select all text on left input when component mounts
    useEffect(() => {
        if (mounted && fromAmountRef.current) {
            fromAmountRef.current.focus();
            fromAmountRef.current.select();
        }
    }, [mounted]);

    useEffect(() => {
        return () => {
            if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
        };
    }, []);

    // Derived: "from" amount and all card amounts from current base (edit-any source of truth)
    const fromAmountNum = performConversion(baseAmount, baseCurrency, fromCurrency);
    const fromAmountDisplay = formatCurrencyValue(fromAmountNum.toFixed(2));

    const getCardConvertedValue = useCallback((code: string) => performConversion(baseAmount, baseCurrency, code), [baseAmount, baseCurrency, performConversion]);

    const currenciesToAdd = currencies.filter(
        (c) => c.code !== fromCurrency && !toCurrencies.includes(c.code)
    );

    const cardSlotCurrencies = openCardIndex !== null && toCurrencies[openCardIndex]
        ? getAvailableCurrencies(fromCurrency, toCurrencies[openCardIndex])
        : [];
    const handleFromCurrencyChange = useCallback((newCurrency: string) => {
        setContextFromCurrency(newCurrency);
    }, [setContextFromCurrency]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', index.toString());
        // Close any open dropdowns when starting drag
        setOpenCardIndex(null);
        setAddCurrencyOpen(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const applyReorder = useCallback((fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const newList = [...toCurrencies];
        const [removed] = newList.splice(fromIndex, 1);
        newList.splice(toIndex, 0, removed);
        setPairMultiple(fromCurrency, newList);
    }, [toCurrencies, fromCurrency, setPairMultiple]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }
        applyReorder(draggedIndex, dropIndex);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, []);

    // Touch drag for mobile (native DnD doesn't work on touch). Handle: drag on move. Row (long-press): drag after ~400ms hold.
    const TOUCH_DRAG_THRESHOLD_PX = 10;
    const LONG_PRESS_MS = 400;
    const handleTouchStart = useCallback((e: React.TouchEvent, index: number, fromRow = false) => {
        if (touchDragRef.current) return;
        if (fromRow) {
            const target = e.target as HTMLElement;
            if (target.closest?.('input') || target.closest?.('button')) return;
        }
        const touch = e.changedTouches[0];
        touchDragRef.current = {
            startIndex: index,
            touchId: touch.identifier,
            startY: touch.clientY,
            activated: false,
            longPressRequired: fromRow,
            longPressTimerId: fromRow ? undefined : undefined
        };

        const getTouch = (ev: TouchEvent) => {
            for (let i = 0; i < ev.changedTouches.length; i++) {
                if (ev.changedTouches[i].identifier === touchDragRef.current?.touchId) return ev.changedTouches[i];
            }
            for (let i = 0; i < ev.touches.length; i++) {
                if (ev.touches[i].identifier === touchDragRef.current?.touchId) return ev.touches[i];
            }
            return null;
        };

        const cleanup = () => {
            const t = touchDragRef.current;
            if (t?.longPressTimerId) clearTimeout(t.longPressTimerId);
            touchDragRef.current = null;
            document.removeEventListener('touchmove', onTouchMove as (ev: Event) => void, { passive: false } as EventListenerOptions);
            document.removeEventListener('touchend', onTouchEnd as (ev: Event) => void, { capture: true });
            document.removeEventListener('touchcancel', onTouchEnd as (ev: Event) => void, { capture: true });
        };

        if (fromRow) {
            touchDragRef.current.longPressTimerId = setTimeout(() => {
                const t = touchDragRef.current;
                if (!t || t.activated) return;
                t.activated = true;
                t.longPressTimerId = undefined;
                setOpenCardIndex(null);
                setAddCurrencyOpen(false);
                setDraggedIndex(t.startIndex);
            }, LONG_PRESS_MS);
        }

        const onTouchMove = (ev: TouchEvent) => {
            const t = touchDragRef.current;
            if (!t) return;
            const touch = getTouch(ev);
            if (!touch) return;
            const dy = Math.abs(touch.clientY - t.startY);
            if (!t.activated) {
                if (t.longPressRequired) {
                    if (dy > TOUCH_DRAG_THRESHOLD_PX) {
                        cleanup();
                        return;
                    }
                    return;
                }
                if (dy > TOUCH_DRAG_THRESHOLD_PX) {
                    t.activated = true;
                    setOpenCardIndex(null);
                    setAddCurrencyOpen(false);
                    setDraggedIndex(t.startIndex);
                }
            }
            if (t.activated) {
                ev.preventDefault();
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                const row = el?.closest?.('[data-drag-index]');
                const idxStr = row?.getAttribute('data-drag-index') ?? null;
                if (idxStr != null) {
                    const idx = parseInt(idxStr, 10);
                    if (!Number.isNaN(idx)) setDragOverIndex(idx);
                }
            }
        };

        const onTouchEnd = (ev: TouchEvent) => {
            const t = touchDragRef.current;
            if (!t || getTouch(ev) === null) return;
            if (t.activated) {
                const dropIdx = dragOverIndexRef.current;
                if (dropIdx !== null && dropIdx !== t.startIndex) {
                    applyReorder(t.startIndex, dropIdx);
                    justDidDragRef.current = true;
                    setTimeout(() => { justDidDragRef.current = false; }, 300);
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
            }
            cleanup();
        };

        document.addEventListener('touchmove', onTouchMove as (ev: Event) => void, { passive: false } as AddEventListenerOptions);
        document.addEventListener('touchend', onTouchEnd as (ev: Event) => void, { capture: true });
        document.addEventListener('touchcancel', onTouchEnd as (ev: Event) => void, { capture: true });
    }, [applyReorder]);

    // Reset drag state when any drag ends (e.g. drop outside list) — standard DnD pattern
    useEffect(() => {
        const onDocumentDragEnd = () => {
            setDraggedIndex(null);
            setDragOverIndex(null);
        };
        document.addEventListener('dragend', onDocumentDragEnd);
        return () => document.removeEventListener('dragend', onDocumentDragEnd);
    }, []);

    // Currency modals (base, add, list row) close via CurrencySelectModal backdrop/X only — no document click-outside, so clicks inside the modal don't close it

    return (
        <>
            <div className="currency-input-group flex flex-col w-full min-w-0 max-w-full">
                {/* Base row: same wrapper as list rows so USD and DOP have identical context and width */}
                <div className="currency-list-scroll currency-base-container w-full max-w-full min-w-0">
                    <CurrencyInput
                        value={usdInputRaw !== null ? usdInputRaw : fromAmountDisplay}
                        onChange={(value) => {
                            const sanitized = sanitizeInputValue(value);
                            setUsdInputRaw(sanitized);
                            setBaseFromAmount(parseFloat(sanitized.replace(/,/g, '')) || 0, fromCurrency);
                            debouncedFromConversion();
                        }}
                        onFocus={() => setUsdInputRaw(usdInputRaw ?? fromAmountDisplay)}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            const v = e.target.value.replace(/,/g, '');
                            const num = parseFloat(v);
                            setUsdInputRaw(null);
                            if (v === '' || Number.isNaN(num) || num < 0) {
                                setBaseFromAmount(1, fromCurrency);
                            } else {
                                setBaseFromAmount(num, fromCurrency);
                            }
                        }}
                        placeholder={t.enterAmount}
                        currency={fromCurrency}
                        onCurrencyChange={handleFromCurrencyChange}
                        availableCurrencies={getAvailableCurrencies(toCurrency, fromCurrency)}
                        isDropdownOpen={fromDropdownOpen}
                        onDropdownToggle={() => { setFromDropdownOpen(!fromDropdownOpen); setAddCurrencyOpen(false); }}
                        onKeyDown={handleAmountKeyDown}
                        onClick={(e) => e.currentTarget.select()}
                        currencyNames={t.currencyNames}
                        ariaLabel={t.fromCurrency}
                        inputRef={fromAmountRef}
                        dropdownRef={fromDropdownRef}
                        isLoadingCurrencies={isLoadingCurrencies}
                        t={{ searchCurrency: t.searchCurrency, noCurrenciesFound: t.noCurrenciesFound, removeCurrency: t.removeCurrency }}
                    />
                </div>

                {/* "+" button — right size: mobile 44px, desktop 48px; icon proportional */}
                <div className="w-full flex justify-center py-4 sm:py-5 mt-3 sm:mt-4">
                    <div className="relative inline-flex" ref={addCurrencyDropdownRef}>
                        <button
                            type="button"
                            onClick={() => { setOpenCardIndex(null); setAddCurrencyOpen(true); }}
                            aria-label={t.addCurrency}
                            className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-700/80 border border-slate-200/60 dark:border-slate-600/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/80 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:focus:ring-slate-500/30 focus:ring-offset-0 touch-manipulation p-0"
                        >
                            <Plus className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={2.5} aria-hidden />
                        </button>
                        <CurrencySelectModal
                            isOpen={addCurrencyOpen}
                            onClose={() => setAddCurrencyOpen(false)}
                            currencies={currenciesToAdd}
                            currencyNames={t.currencyNames}
                            selectedCode=""
                            onSelect={(code) => {
                                addToCurrency(code);
                                setAddCurrencyOpen(false);
                            }}
                            title={t.addCurrency}
                            searchPlaceholder={t.searchCurrency}
                            noResultsText={t.noCurrenciesFound}
                        />
                    </div>
                </div>

                {/* List: same horizontal space as arriba; compact spacing like USD row */}
                <div className="mt-2.5 sm:mt-4 w-full max-w-full min-w-0">
                    <div className={`currency-list-scroll space-y-1.5 sm:space-y-2.5 w-full max-w-full min-w-0 max-h-[10rem] sm:max-h-[21.5rem] ${openCardIndex !== null ? 'overflow-visible card-dropdown-open' : 'overflow-y-auto overflow-x-auto'}`}>
                    {toCurrencies.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">{t.addCurrency}</p>
                    ) : (
                        toCurrencies.map((code, index) => {
                            const info = currencies.find((c) => c.code === code);
                            const value = getCardConvertedValue(code);
                            const displayValue = formatCurrencyValue(value.toFixed(2));
                            const isDragging = draggedIndex === index;
                            const isDragOver = dragOverIndex === index;
                            const leftSlot = (
                                        <div
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onTouchStart={(e) => handleTouchStart(e, index)}
                                            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-flare-primary transition-colors p-0 sm:p-1 touch-none"
                                            aria-label="Drag to reorder"
                                        >
                                            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                                                <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
                                            </svg>
                                        </div>
                                    );
                            const rightSlot = (
                                <CurrencyRowValueSlot
                                    value={cardInputRaw?.code === code ? cardInputRaw.value : displayValue}
                                    onChange={(next) => {
                                        setCardInputRaw({ code, value: next });
                                        setBaseFromAmount(parseFloat(next.replace(/,/g, '')), code);
                                    }}
                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                        e.currentTarget.select();
                                        setCardInputRaw({ code, value: displayValue });
                                    }}
                                    onBlur={(e) => {
                                        const v = e.target.value.replace(/,/g, '');
                                        const num = parseFloat(v);
                                        setCardInputRaw(null);
                                        if (Number.isNaN(num) || num < 0) {
                                            setBaseFromAmount(1, fromCurrency);
                                        } else {
                                            setBaseFromAmount(num, code);
                                        }
                                    }}
                                    onClick={(e) => e.currentTarget.select()}
                                    onKeyDown={handleAmountKeyDown}
                                    ariaLabel={`${code} ${t.toCurrency}`}
                                    inputMode="decimal"
                                    deleteDisabled={toCurrencies.length === 1}
                                    onDelete={() => removeToCurrency(code)}
                                    removeAriaLabel={`${t.removeCurrency} ${code}`}
                                />
                            );
                            return (
                                <CurrencyRow
                                    key={code}
                                    left={leftSlot}
                                    right={rightSlot}
                                    className={`select-none ${openCardIndex === index ? 'overflow-visible card-row-dropdown-open' : ''} ${isDragging ? 'opacity-50' : ''} ${isDragOver ? '!border-indigo-500 dark:!border-indigo-400 shadow-md' : ''}`}
                                    containerProps={
                                        {
                                            'data-drag-index': index,
                                            onDragOver: (e) => handleDragOver(e, index),
                                            onDragLeave: handleDragLeave,
                                            onDrop: (e) => handleDrop(e, index),
                                            onTouchStart: (e) => handleTouchStart(e, index, true),
                                            onContextMenu: (e) => e.preventDefault()
                                        } as React.HTMLAttributes<HTMLDivElement>
                                    }
                                >
                                    <CurrencyRowSelector
                                        flag={info?.flag}
                                        code={code}
                                        symbol={info?.symbol ?? code}
                                        name={t.currencyNames[code as keyof typeof t.currencyNames] || info?.name || code}
                                        isOpen={openCardIndex === index}
                                        onToggle={() => {
                                            if (justDidDragRef.current) return;
                                            setAddCurrencyOpen(false);
                                            setOpenCardIndex(openCardIndex === index ? null : index);
                                        }}
                                        ariaLabel="Select currency"
                                    >
                                        {null}
                                    </CurrencyRowSelector>
                                </CurrencyRow>
                            );
                        })
                    )}
                    </div>
                </div>
            </div>

            <CurrencySelectModal
                isOpen={openCardIndex !== null}
                onClose={() => setOpenCardIndex(null)}
                currencies={cardSlotCurrencies}
                currencyNames={t.currencyNames}
                selectedCode={openCardIndex !== null ? (toCurrencies[openCardIndex] ?? '') : ''}
                onSelect={(code) => {
                    if (openCardIndex === null) return;
                    const next = [...toCurrencies];
                    next[openCardIndex] = code;
                    setPairMultiple(fromCurrency, next);
                    setOpenCardIndex(null);
                }}
                searchPlaceholder={t.searchCurrency}
                noResultsText={t.noCurrenciesFound}
            />

            <div className="mt-4 sm:mt-6">
                <LastUpdated />
            </div>
        </>
    );
}
