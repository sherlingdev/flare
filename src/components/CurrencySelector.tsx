"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import Image from 'next/image';

interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag: string;
}

interface CurrencySelectorProps {
    currencies: Currency[];
    selectedCode: string;
    onSelect: (code: string) => void;
    variant?: 'default' | 'chart';
}

export default function CurrencySelector({
    currencies,
    selectedCode,
    onSelect,
    variant = 'default'
}: CurrencySelectorProps) {
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
            <div
                className={`flex items-center ${variant === 'chart' ? 'bg-[#F9FAFB] dark:bg-[#374151]' : 'bg-[#FFFFFFF2] dark:bg-[#1E293BF2]'} rounded-xl px-6 sm:px-8 py-4 sm:py-5 w-full shadow-sm relative z-[100] ${variant === 'chart' ? 'chart-currency-selector' : ''
                    }`}
            >
                <div className="w-full">
                    <div className="relative z-[100]" ref={dropdownRef}>
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
                            <div className="dropdown-options absolute top-full z-[99999] mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg w-full left-0 right-0 max-h-60 overflow-y-auto" style={{ zIndex: 99999 }}>
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

