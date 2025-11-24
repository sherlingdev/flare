"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConverter } from "@/contexts/ConverterContext";
import { translations } from "@/lib/translations";
import SwapButton from "./SwapButton";
import CurrencySelector from "./CurrencySelector";

interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag: string;
}

export default function CurrencyPairSelector() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];
    const {
        fromCurrency,
        toCurrency,
        setPair
    } = useConverter();

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load currencies
    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                const response = await fetch('/api/payload');
                const data = await response.json();

                if (data.success && data.data?.currencies) {
                    const currenciesList = data.data.currencies.map((item: {
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

                    setCurrencies(currenciesList);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load currencies:', error);
                setIsLoading(false);
            }
        };

        loadCurrencies();
    }, []);

    const handleSwap = () => {
        setPair(toCurrency, fromCurrency);
    };

    const handleFromSelect = (code: string) => {
        setPair(code, toCurrency);
    };

    const handleToSelect = (code: string) => {
        setPair(fromCurrency, code);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-flare-primary">{t.loading}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 relative w-full">
            {/* From Currency */}
            <div className="w-full lg:flex-1 order-1 lg:order-1 relative z-[100]">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {'from' in t ? (t as { from: string }).from : 'FROM'}
                </label>
                <CurrencySelector
                    currencies={currencies}
                    selectedCode={fromCurrency}
                    onSelect={handleFromSelect}
                    variant="chart"
                />
            </div>

            {/* Swap Button - Centered vertically with input fields, horizontally between them */}
            <div className="flex-shrink-0 order-2 lg:order-2 flex items-center justify-center my-2 lg:my-0">
                <div className="lg:pt-[28px] flex items-center justify-center">
                    <SwapButton
                        onClick={handleSwap}
                        size="md"
                        variant="default"
                    />
                </div>
            </div>

            {/* To Currency */}
            <div className="w-full lg:flex-1 order-3 lg:order-3 relative z-[100]">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {'to' in t ? (t as { to: string }).to : 'TO'}
                </label>
                <CurrencySelector
                    currencies={currencies}
                    selectedCode={toCurrency}
                    onSelect={handleToSelect}
                    variant="chart"
                />
            </div>
        </div>
    );
}
