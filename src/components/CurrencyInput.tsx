'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag: string;
}

interface CurrencyInputProps {
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    placeholder: string;
    currency: string;
    onCurrencyChange: (currency: string) => void;
    availableCurrencies: Currency[];
    isDropdownOpen: boolean;
    onDropdownToggle: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    currencyNames: Record<string, string>;
    ariaLabel: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    dropdownRef?: React.RefObject<HTMLDivElement | null>;
    isLoadingCurrencies?: boolean;
    t: {
        searchCurrency: string;
        noCurrenciesFound: string;
    };
}

export default function CurrencyInput({
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder,
    currency,
    onCurrencyChange,
    availableCurrencies,
    isDropdownOpen,
    onDropdownToggle,
    onKeyDown,
    onClick,
    currencyNames,
    ariaLabel,
    inputRef,
    dropdownRef,
    isLoadingCurrencies = false,
    t
}: CurrencyInputProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCurrencies, setFilteredCurrencies] = useState(availableCurrencies);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [showClearButton, setShowClearButton] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Filter currencies based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCurrencies(availableCurrencies);
            setShowClearButton(false);
        } else {
            setShowClearButton(true);
            const filtered = availableCurrencies.filter(currency => {
                const searchLower = searchTerm.toLowerCase();
                const codeMatch = currency.code.toLowerCase().includes(searchLower);
                const nameMatch = currency.name.toLowerCase().includes(searchLower);
                const currencyNameMatch = currencyNames[currency.code as keyof typeof currencyNames]?.toLowerCase().includes(searchLower);
                return codeMatch || nameMatch || currencyNameMatch;
            });
            setFilteredCurrencies(filtered);
        }
        setSelectedIndex(0); // Select first item when search changes
    }, [searchTerm, availableCurrencies, currencyNames]);

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
            // Small delay to ensure dropdown is fully rendered
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
            onDropdownToggle();
            setSearchTerm('');
            setShowClearButton(false);
            setSelectedIndex(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => {
                const newIndex = prev < filteredCurrencies.length - 1 ? prev + 1 : 0;
                return newIndex;
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => {
                const newIndex = prev > 0 ? prev - 1 : filteredCurrencies.length - 1;
                return newIndex;
            });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCurrencies.length > 0) {
                // If there's a keyboard-selected item, use it; otherwise use the first item
                const indexToUse = selectedIndex >= 0 ? selectedIndex : 0;
                const selectedCurrency = filteredCurrencies[indexToUse];
                onCurrencyChange(selectedCurrency.code);
                onDropdownToggle();
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

    return (
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
            <div className="flex-1 pr-2 sm:pr-3">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                        onClick={onClick}
                        className="currency-input w-full border-none outline-none bg-transparent text-sm sm:text-base"
                        placeholder={placeholder}
                        aria-label={ariaLabel}
                    />
                </div>
            </div>
            <div className="flex-1 pl-2 sm:pl-3">
                <div className="relative" ref={dropdownRef}>
                    <div
                        className={`currency-label currency-select text-sm sm:text-base ${isDropdownOpen ? 'dropdown-open' : ''}`}
                        aria-label={ariaLabel}
                        style={{ cursor: 'default' }}
                    >
                        <div className="flex items-center space-x-2 flex-nowrap">
                            <div
                                onClick={onDropdownToggle}
                                className="flex-shrink-0 w-5 h-3.5 rounded-sm overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer"
                            >
                                {!isLoadingCurrencies && availableCurrencies.find(c => c.code === currency)?.flag && (
                                    <Image
                                        src={availableCurrencies.find(c => c.code === currency)?.flag || ''}
                                        alt={`${currency} flag`}
                                        width={20}
                                        height={14}
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                )}
                            </div>
                            <span
                                onClick={onDropdownToggle}
                                className="cursor-pointer whitespace-nowrap text-flare-primary"
                            >
                                {currency}
                            </span>
                            <div
                                onClick={onDropdownToggle}
                                className="cursor-pointer"
                            >
                                <svg className={`w-4 h-4 text-flare-primary transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {isDropdownOpen && (
                        <div className="dropdown-options absolute top-full z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg w-full left-0 right-0 max-h-60 overflow-y-auto">
                            {/* Search Input - Added at the top */}
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

                            {/* Original currency options - unchanged structure */}
                            {filteredCurrencies.length > 0 ? (
                                filteredCurrencies.map((currencyOption, index) => (
                                    <div
                                        key={currencyOption.code}
                                        onClick={() => {
                                            onCurrencyChange(currencyOption.code);
                                            onDropdownToggle();
                                        }}
                                        className={`${currencyOption.code === currency ? 'selected' : ''} ${index === selectedIndex ? 'keyboard-selected' : ''}`}
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
                                                <span className="truncate uppercase text-sm block">{currencyOption.code} - {currencyNames[currencyOption.code as keyof typeof currencyNames]}</span>
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
    );
}
