"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import Image from 'next/image';
import { getHardcodedCurrencies } from "@/../scripts/currencies.cjs";
import { useConverter } from "@/contexts/ConverterContext";

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
export default function Information() {
    const { language, mounted } = useLanguage();
    const { setPair } = useConverter();
    const t = translations[mounted ? language : "en"];
    const allowedCurrencyCodes = useMemo(() => {
        return new Set(Object.keys(translations.en.currencyOverview ?? {}));
    }, []);

    const [currencies, setCurrencies] = useState<Currency[]>(() => {
        const fallback = getHardcodedCurrencies();
        const defaultAllowed = new Set(Object.keys(translations.en.currencyOverview ?? {}));
        return fallback
            .filter((currency: Currency) => defaultAllowed.has(currency.code))
            .map((currency: Currency) => ({
                ...currency,
                symbol: currency.symbol || currency.code,
                flag: currency.flag || `https://www.xe.com/svgs/flags/${currency.code.toLowerCase()}.static.svg`,
                info: null
            }));
    });
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

                    if (!filteredCurrencies.find(item => item.code === selectedCode) && filteredCurrencies.length > 0) {
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
    }, [selectedCode, allowedCurrencyCodes]);

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

    const selectedCurrency = currencies.find(currency => currency.code === selectedCode) ?? currencies[0];
    const info = selectedCurrency?.info ?? null;

    const formatDenominations = (group?: { frequently: number[]; rarely: number[] }) => {
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

    const capitalizeSentence = (text?: string | null) => {
        if (!text) return undefined;
        const trimmed = text.trim();
        if (!trimmed) return undefined;
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    };

    const titleCaseText = (text?: string | null) => {
        if (!text) return undefined;
        return text
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const isUsdSelected = selectedCode === "USD";
    const overviewMap = t.currencyOverview as Record<string, string> | undefined;
    const centralBankMap = t.centralBankNames as Record<string, string> | undefined;
    const currencyNamesMap = t.currencyNames as Record<string, string> | undefined;
    const localizedCurrencyName =
        currencyNamesMap?.[selectedCode] ||
        selectedCurrency?.name ||
        translations.en.currencyNames?.[selectedCode as keyof typeof translations.en.currencyNames] ||
        selectedCode;
    const conversionText = isUsdSelected ? "USD → EUR" : `${selectedCode} → USD`;
    const conversionTarget = isUsdSelected
        ? { from: "USD", to: "EUR" }
        : { from: selectedCurrency?.code || selectedCode, to: "USD" };
    const overviewText =
        overviewMap?.[selectedCode] ||
        capitalizeSentence(info?.overview) ||
        t.ourMissionText;
    const centralBankText =
        centralBankMap?.[selectedCode] ||
        titleCaseText(info?.central_bank) ||
        t.centralBankDescription;
    const coinsList = formatDenominations(info?.coins);
    const banknotesList = formatDenominations(info?.banknotes);

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
                                    <div className="order-1 w-full md:order-1 bg-slate-50 dark:bg-slate-700 rounded-lg p-6 flex flex-col items-center justify-center">
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
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
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
                                        </ul>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
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

function CurrencySelector({
    currencies,
    selectedCode,
    onSelect
}: {
    currencies: Currency[];
    selectedCode: string;
    onSelect: (code: string) => void;
}) {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];

    const currencyNamesMap = t.currencyNames as Record<string, string> | undefined;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>(currencies);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [showClearButton, setShowClearButton] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFilteredCurrencies(currencies);
    }, [currencies]);

    // Filter currencies based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            const ordered = [...currencies];
            const currentIndex = ordered.findIndex(curr => curr.code === selectedCode);
            if (currentIndex > 0) {
                const [selectedCurrency] = ordered.splice(currentIndex, 1);
                ordered.unshift(selectedCurrency);
            }
            setFilteredCurrencies(ordered);
            setShowClearButton(false);
            setSelectedIndex(0);
        } else {
            setShowClearButton(true);
            const searchLower = searchTerm.toLowerCase();
            const filtered = currencies.filter(curr => {
                const codeMatch = curr.code.toLowerCase().includes(searchLower);
                const nameMatch = curr.name.toLowerCase().includes(searchLower);
                const translatedName = t.currencyNames[curr.code as keyof typeof t.currencyNames];
                const translatedMatch = translatedName?.toLowerCase().includes(searchLower);
                return codeMatch || nameMatch || translatedMatch;
            });
            setFilteredCurrencies(filtered);
            setSelectedIndex(filtered.length ? 0 : -1);
        }
    }, [searchTerm, currencies, selectedCode, t]);

    // Reset search when dropdown closes
    useEffect(() => {
        if (!isDropdownOpen) {
            setSearchTerm('');
            setShowClearButton(false);
        }
    }, [isDropdownOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isDropdownOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
            }, 150);
        }
    }, [isDropdownOpen]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsDropdownOpen(false);
            setSearchTerm('');
            setShowClearButton(false);
            setSelectedIndex(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => {
                if (filteredCurrencies.length === 0) return -1;
                const newIndex = prev < filteredCurrencies.length - 1 ? prev + 1 : 0;
                return newIndex;
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => {
                if (filteredCurrencies.length === 0) return -1;
                const newIndex = prev > 0 ? prev - 1 : filteredCurrencies.length - 1;
                return newIndex;
            });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCurrencies.length > 0) {
                const indexToUse = selectedIndex >= 0 ? selectedIndex : 0;
                const nextCurrency = filteredCurrencies[indexToUse];
                onSelect(nextCurrency.code);
                setIsDropdownOpen(false);
                setSearchTerm('');
                setShowClearButton(false);
                setSelectedIndex(-1);
            }
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setShowClearButton(false);
        searchInputRef.current?.focus();
    };

    // Handle clicks outside dropdowns to close them
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const selectedCurrency = currencies.find(currency => currency.code === selectedCode);

    const selectedCurrencyOption = currencies.find(currency => currency.code === selectedCode);
    const selectedLocalizedName =
        currencyNamesMap?.[selectedCode] ||
        selectedCurrencyOption?.name ||
        translations.en.currencyNames?.[selectedCode as keyof typeof translations.en.currencyNames] ||
        selectedCode;

    return (
        <>
            <div className="flex items-center bg-[#FFFFFFF2] dark:bg-[#1E293BF2] rounded-xl px-6 sm:px-8 py-4 sm:py-5 w-full shadow-sm">
                <div className="w-full">
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className={`currency-label currency-select text-sm sm:text-base ${isDropdownOpen ? 'dropdown-open' : ''} information-currency-select`}
                        >
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="information-currency-inner flex items-center gap-3 flex-nowrap w-full cursor-pointer"
                            >
                                <div className="flex-shrink-0 w-5 h-3.5 rounded-sm overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600">
                                    {selectedCurrency?.flag && (
                                        <Image
                                            src={selectedCurrency.flag}
                                            alt={`${selectedCode} flag`}
                                            width={20}
                                            height={14}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="information-currency-value text-flare-primary whitespace-nowrap text-left truncate block">
                                        {selectedCode} <span className="font-normal">({selectedCurrencyOption?.symbol || selectedCode})</span> <span className="font-normal">-</span> {selectedLocalizedName.toUpperCase()}
                                    </span>
                                </div>
                                <div className="information-currency-arrow flex-shrink-0">
                                    <svg className={`w-4 h-4 text-flare-primary transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {isDropdownOpen && (
                            <div className="dropdown-options absolute top-full z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg w-full left-0 right-0 max-h-60 overflow-y-auto">
                                <div className="search-container">
                                    <div className="relative">
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            onKeyDown={handleSearchKeyDown}
                                            placeholder={t.searchCurrency}
                                            className="search-input"
                                            maxLength={30}
                                        />
                                        {showClearButton && (
                                            <button
                                                onClick={handleClearSearch}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                                                aria-label="Clear search"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {filteredCurrencies.length > 0 ? (
                                    filteredCurrencies.map((currencyOption, index) => (
                                        <div
                                            key={currencyOption.code}
                                            onClick={() => {
                                                onSelect(currencyOption.code);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`${currencyOption.code === selectedCode ? 'selected' : ''} ${index === selectedIndex ? 'keyboard-selected' : ''}`}
                                        >
                                            <div className="flex items-center space-x-2 min-w-0 overflow-hidden">
                                                <div className="flex-shrink-0 w-5 h-3.5 rounded-sm overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600">
                                                    <Image
                                                        src={currencyOption.flag}
                                                        alt={`${currencyOption.code} flag`}
                                                        width={20}
                                                        height={14}
                                                        className="object-cover w-full h-full"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                    <span className="truncate uppercase text-sm block">
                                                        {currencyOption.code} <span className="font-normal">({currencyOption.symbol})</span> - {(currencyNamesMap?.[currencyOption.code] ?? currencyOption.name)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-results">
                                        {t.noCurrenciesFound}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style jsx>{`
            .information-currency-select {
                cursor: default;
                text-align: left;
            }

            .information-currency-arrow {
                margin-left: auto;
            }

            .information-currency-inner {
                justify-content: flex-start !important;
            }

            .information-currency-value {
                text-align: left !important;
            }
        `}</style>
        </>
    );
}

