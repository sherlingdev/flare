"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { getHardcodedCurrencies } from "@/../scripts/currencies.cjs";
import { useConverter } from "@/contexts/ConverterContext";
import CurrencySelector from "@/components/CurrencySelector";

interface CurrencyInfo {
    country_codes: string[];
    major_unit: {
        name: string | null;
    };
    minor_unit: {
        name: string | null;
        value: number | null;
    };
    banknotes: {
        frequently: number[];
        rarely: number[];
    };
    coins: {
        frequently: number[];
        rarely: number[];
    };
    overview: string | null;
    central_bank: string | null;
}

interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag: string;
    info?: CurrencyInfo | null;
}

const DEFAULT_SELECTED_CODE = "DOP";

// Helper functions
const formatDenominations = (group?: { frequently: number[]; rarely: number[] }): string[] => {
    if (!group) return [];
    const combined = [
        ...(Array.isArray(group.frequently) ? group.frequently : []),
        ...(Array.isArray(group.rarely) ? group.rarely : [])
    ];
    if (combined.length === 0) {
        return [];
    }
    return combined
        .map(value => {
            if (typeof value !== 'number') {
                const trimmed = String(value).trim();
                return trimmed ? trimmed.replace(/,/g, ' ') : undefined;
            }
            return Number.isFinite(value)
                ? value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                : undefined;
        })
        .filter((value): value is string => Boolean(value));
};

const capitalizeSentence = (text?: string | null): string | undefined => {
    if (!text) return undefined;
    const trimmed = text.trim();
    if (!trimmed) return undefined;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const titleCaseText = (text?: string | null): string | undefined => {
    if (!text) return undefined;
    return text
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getAllowedCurrencyCodes = (): Set<string> => {
    return new Set(Object.keys(translations.en.currencyOverview ?? {}));
};

export default function Information() {
    const { language, mounted } = useLanguage();
    const { setPair } = useConverter();
    const t = translations[mounted ? language : "en"];
    const allowedCurrencyCodes = useMemo(() => getAllowedCurrencyCodes(), []);

    const [currencies, setCurrencies] = useState<Currency[]>(() => {
        const fallback = getHardcodedCurrencies();
        const defaultAllowed = getAllowedCurrencyCodes();
        return fallback
            .filter((currency: Currency) => defaultAllowed.has(currency.code))
            .map((currency: Currency) => ({
                ...currency,
                symbol: currency.symbol || currency.code,
                flag: currency.flag || `https://www.xe.com/svgs/flags/${currency.code.toLowerCase()}.static.svg`,
                info: null
            }));
    });

    // Initialize selectedCode with default
    const [selectedCode, setSelectedCode] = useState<string>(DEFAULT_SELECTED_CODE);

    useEffect(() => {
        const controller = new AbortController();

        const loadCurrencies = async () => {
            try {
                const response = await fetch('/api/information/payload', { signal: controller.signal });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();

                if (payload.success && payload.data?.insights) {
                    const mappedCurrencies: Currency[] = payload.data.insights.map((currency: {
                        code: string;
                        name: string;
                        symbol: string | null;
                        info: CurrencyInfo | null;
                    }) => ({
                        code: currency.code,
                        name: currency.name,
                        symbol: currency.symbol || currency.code,
                        flag: `https://www.xe.com/svgs/flags/${currency.code.toLowerCase()}.static.svg`,
                        info: currency.info
                    }));

                    const filteredCurrencies = mappedCurrencies.filter(currency => allowedCurrencyCodes.has(currency.code));

                    setCurrencies(filteredCurrencies);

                    // Update selectedCode if current selection is not in filtered list
                    const hasSelected = filteredCurrencies.some(c => c.code === selectedCode);
                    if (!hasSelected && filteredCurrencies.length > 0) {
                        setSelectedCode(filteredCurrencies[0].code);
                    }
                }
            } catch (error) {
                if ((error as Error).name === 'AbortError') {
                    return;
                }
                console.error('Failed to load currencies for information page:', error);
            }
        };

        loadCurrencies();

        return () => {
            controller.abort();
        };
    }, [allowedCurrencyCodes, selectedCode]);


    // Scroll to top on mount and prevent scroll restoration
    useEffect(() => {
        // Force scroll to top immediately
        window.scrollTo(0, 0);

        // Disable scroll restoration temporarily
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // Additional scroll to top after a brief delay to override any restoration
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);

        // Force scroll again after a longer delay to ensure it sticks
        const timer2 = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
            // Re-enable scroll restoration when component unmounts
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        };
    }, []);

    const selectedCurrency = useMemo(() =>
        currencies.find(currency => currency.code === selectedCode) ?? currencies[0],
        [currencies, selectedCode]
    );

    const info = selectedCurrency?.info ?? null;

    const isUsdSelected = selectedCode === "USD";

    const overviewMap = useMemo(() =>
        t.currencyOverview as Record<string, string> | undefined,
        [t.currencyOverview]
    );

    const centralBankMap = useMemo(() =>
        t.centralBankNames as Record<string, string> | undefined,
        [t.centralBankNames]
    );

    const currencyNamesMap = useMemo(() =>
        t.currencyNames as Record<string, string> | undefined,
        [t.currencyNames]
    );

    const localizedCurrencyName = useMemo(() =>
        currencyNamesMap?.[selectedCode] ||
        selectedCurrency?.name ||
        translations.en.currencyNames?.[selectedCode as keyof typeof translations.en.currencyNames] ||
        selectedCode,
        [currencyNamesMap, selectedCode, selectedCurrency?.name]
    );

    const conversionText = useMemo(() =>
        isUsdSelected ? "USD → EUR" : `${selectedCode} → USD`,
        [isUsdSelected, selectedCode]
    );

    const conversionTarget = useMemo(() =>
        isUsdSelected
        ? { from: "USD", to: "EUR" }
            : { from: selectedCurrency?.code || selectedCode, to: "USD" },
        [isUsdSelected, selectedCurrency?.code, selectedCode]
    );

    const overviewText = useMemo(() =>
        overviewMap?.[selectedCode] ||
        capitalizeSentence(info?.overview) ||
        t.ourMissionText,
        [overviewMap, selectedCode, info?.overview, t.ourMissionText]
    );

    const centralBankText = useMemo(() =>
        centralBankMap?.[selectedCode] ||
        titleCaseText(info?.central_bank) ||
        t.centralBankDescription,
        [centralBankMap, selectedCode, info?.central_bank, t.centralBankDescription]
    );

    const coinsList = useMemo(() =>
        formatDenominations(info?.coins),
        [info?.coins]
    );

    const banknotesList = useMemo(() =>
        formatDenominations(info?.banknotes),
        [info?.banknotes]
    );

    const renderDenominationBadges = (items: string[], fallback: string) => {
        if (!items.length) {
            return <span className="flex-1 text-right">{fallback}</span>;
        }
        return (
            <div className="flex flex-wrap justify-end gap-2">
                {items.map((item, index) => (
                    <span
                        key={`${item}-${index}`}
                        className="inline-flex min-w-[44px] h-10 px-3 items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-700/80 border border-slate-200/50 dark:border-slate-600/50 text-sm font-semibold text-[#475569] dark:text-[#CBD5E1] backdrop-blur-sm"
                        style={{ flexGrow: 0, flexShrink: 0 }}
                    >
                        {item}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-16 pb-16">
            <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full max-w-6xl">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 lg:px-10 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-[#CBD5E1]">
                        <h1 className="text-2xl sm:text-3xl font-bold text-flare-primary mb-4 text-center dark:text-[#CBD5E1]">
                            {t.info}
                        </h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-base">
                            <section className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="order-1 w-full md:order-1 rounded-lg p-6 flex flex-col items-center justify-center bg-[#F9FAFB] dark:bg-[#374151]">
                                        <div className="w-full max-w-xl">
                                            <CurrencySelector
                                                currencies={currencies}
                                                selectedCode={selectedCurrency?.code || selectedCode}
                                                onSelect={setSelectedCode}
                                            />
                                        </div>
                                    </div>
                                    <div className="order-2 w-full">
                                        <h2 className="text-xl font-semibold text-flare-primary mb-4 dark:text-[#CBD5E1]">
                                            {t.overview}
                                        </h2>
                                        <p className="mb-4 text-base">
                                            {overviewText}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4 dark:text-[#CBD5E1]">
                                    {t.currencyInsights}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="rounded-lg p-6 bg-[#F9FAFB] dark:bg-[#374151]">
                                        <h3 className="text-lg font-semibold text-flare-primary mb-3 text-center">
                                            {t.stats}
                                        </h3>
                                        <ul className="list-none text-base space-y-2">
                                            <li className="flex items-start justify-between gap-4">
                                                <strong>{t.nameLabel}:</strong>
                                                <span className="flex-1 text-right">{localizedCurrencyName || t.nameDescription}</span>
                                            </li>
                                            <li className="flex items-start justify-between gap-4">
                                                <strong>{t.symbolLabel}:</strong>
                                                <span className="flex-1 text-right">{selectedCurrency?.symbol || t.symbolDescription}</span>
                                            </li>
                                            <li className="flex items-start justify-between gap-4">
                                                <strong>{t.conversionLabel}:</strong>
                                                <span className="flex-1 text-right">
                                                    <Link
                                                        href="/"
                                                        onClick={() => setPair(conversionTarget.from, conversionTarget.to)}
                                                        prefetch
                                                        className="text-flare-primary hover:underline transition-colors"
                                                    >
                                                        {conversionText}
                                                    </Link>
                                                </span>
                                            </li>
                                            <li className="flex items-start justify-between gap-4">
                                                <strong>{t.chartLabel}:</strong>
                                                <span className="flex-1 text-right">
                                                    <Link
                                                        href="/chart"
                                                        onClick={() => setPair(selectedCode, isUsdSelected ? "EUR" : "USD")}
                                                        prefetch
                                                        className="text-flare-primary hover:underline transition-colors"
                                                    >
                                                        {selectedCode} → {isUsdSelected ? "EUR" : "USD"}
                                                    </Link>
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="rounded-lg p-6 bg-[#F9FAFB] dark:bg-[#374151]">
                                        <h3 className="text-lg font-semibold text-flare-primary mb-3 text-center">
                                            {t.profile}
                                        </h3>
                                        <ul className="list-none text-base space-y-2">
                                            <li className="flex items-start justify-between gap-4">
                                                <strong className="whitespace-nowrap">{t.coinsLabel}:</strong>
                                                {renderDenominationBadges(coinsList, t.coinsDescription)}
                                            </li>
                                            <li className="flex items-start justify-between gap-4">
                                                <strong className="whitespace-nowrap">{t.bankNotesLabel}:</strong>
                                                {renderDenominationBadges(banknotesList, t.bankNotesDescription)}
                                            </li>
                                            <li className="flex items-start justify-between gap-4">
                                                <strong className="whitespace-nowrap">{t.centralBankLabel}:</strong>
                                                <span className="flex-1 text-right">{centralBankText}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

