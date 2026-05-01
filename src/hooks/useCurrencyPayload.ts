"use client";

import { useState, useEffect } from "react";
import { getHardcodedCurrencies, getHardcodedRates } from "@/lib/currencyFallback";

export type CurrencyItem = { code: string; name: string; symbol: string; flag: string };

export function useCurrencyPayload() {
    const [currencyRates, setCurrencyRates] = useState<Record<string, number>>({});
    const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

    useEffect(() => {
        const loadRates = async () => {
            try {
                const payloadResponse = await fetch("/api/payload");
                const payloadData = await payloadResponse.json();

                if (payloadData.success && payloadData.data?.rates && payloadData.data?.currencies) {
                    const currenciesList = payloadData.data.currencies.map(
                        (item: { code: string; name: string; symbol: string; flag?: string }) => ({
                            code: item.code,
                            name: item.name,
                            symbol: item.symbol || item.code,
                            flag: item.flag || `https://www.xe.com/svgs/flags/${item.code.toLowerCase()}.static.svg`,
                        })
                    );

                    setCurrencyRates(payloadData.data.rates as Record<string, number>);
                    setCurrencies(currenciesList);
                    setIsLoadingCurrencies(false);
                    return;
                }

                try {
                    const netlifyResponse = await fetch("/.netlify/functions/currency-rates");
                    if (netlifyResponse.ok) {
                        const netlifyData = await netlifyResponse.json();
                        if (netlifyData.success && netlifyData.data) {
                            const blobData = netlifyData.data;
                            if (blobData.rates && typeof blobData.rates === "object" && !Array.isArray(blobData.rates)) {
                                setCurrencyRates(blobData.rates as Record<string, number>);
                            }
                            if (blobData.currencies && Array.isArray(blobData.currencies)) {
                                const currenciesList = blobData.currencies.map(
                                    (item: { code: string; name: string; symbol?: string | null; flag?: string }) => ({
                                        code: item.code,
                                        name: item.name,
                                        symbol: item.symbol || item.code,
                                        flag: item.flag || `https://www.xe.com/svgs/flags/${item.code.toLowerCase()}.static.svg`,
                                    })
                                );
                                setCurrencies(currenciesList);
                                setIsLoadingCurrencies(false);
                                return;
                            }
                        }
                    }
                } catch {
                    /* fall through */
                }

                setCurrencyRates(getHardcodedRates());
                setCurrencies(getHardcodedCurrencies());
                setIsLoadingCurrencies(false);
            } catch {
                try {
                    const netlifyResponse = await fetch("/.netlify/functions/currency-rates");
                    if (netlifyResponse.ok) {
                        const netlifyData = await netlifyResponse.json();
                        if (netlifyData.success && netlifyData.data) {
                            const blobData = netlifyData.data;
                            if (blobData.rates && typeof blobData.rates === "object" && !Array.isArray(blobData.rates)) {
                                setCurrencyRates(blobData.rates as Record<string, number>);
                            }
                            if (blobData.currencies && Array.isArray(blobData.currencies)) {
                                const currenciesList = blobData.currencies.map(
                                    (item: { code: string; name: string; symbol?: string | null; flag?: string }) => ({
                                        code: item.code,
                                        name: item.name,
                                        symbol: item.symbol || item.code,
                                        flag: item.flag || `https://www.xe.com/svgs/flags/${item.code.toLowerCase()}.static.svg`,
                                    })
                                );
                                setCurrencies(currenciesList);
                                setIsLoadingCurrencies(false);
                                return;
                            }
                        }
                    }
                } catch {
                    /* fall through */
                }

                setCurrencyRates(getHardcodedRates());
                setCurrencies(getHardcodedCurrencies());
                setIsLoadingCurrencies(false);
            }
        };

        loadRates();
    }, []);

    return { currencyRates, currencies, isLoadingCurrencies };
}
