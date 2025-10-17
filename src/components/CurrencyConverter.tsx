"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { getCurrentLocalRates } from "../lib/scraper";
import { translations } from "../lib/translations";
import SwapButton from "./SwapButton";
import LastUpdated from "./LastUpdated";

export default function CurrencyConverter() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];

    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("DOP");
    const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
    const [toDropdownOpen, setToDropdownOpen] = useState(false);
    const fromAmountRef = useRef<HTMLInputElement>(null);
    const toAmountRef = useRef<HTMLInputElement>(null);
    const fromDropdownRef = useRef<HTMLDivElement>(null);
    const toDropdownRef = useRef<HTMLDivElement>(null);

    // Simple function to get rate from global rates
    const getRate = (from: string, to: string): number => {
        // If same currency, return 1
        if (from === to) {
            return 1;
        }

        const currentRates = getCurrentLocalRates();

        const directRate = currentRates[`${from}-${to}`];
        if (directRate) {
            return directRate;
        }

        // If no direct rate, try reverse
        const reverseRate = currentRates[`${to}-${from}`];
        if (reverseRate) {
            const calculatedRate = 1 / reverseRate;
            return calculatedRate;
        }

        // If no rate found, return a default rate based on currency
        let defaultRate = 1;
        if (from === 'USD' && to === 'DOP') defaultRate = 62.67;
        else if (from === 'DOP' && to === 'USD') defaultRate = 0.016;
        else if (from === 'USD' && to === 'EUR') defaultRate = 0.87;
        else if (from === 'EUR' && to === 'USD') defaultRate = 1.15;
        else if (from === 'EUR' && to === 'DOP') defaultRate = 72.03;
        else if (from === 'DOP' && to === 'EUR') defaultRate = 0.014;

        return defaultRate;
    };

    const [fromAmountDisplay, setFromAmountDisplay] = useState("1.00");

    // Debouncing refs
    const fromDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const toDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate initial rate from global rates
    const initialRate = getRate(fromCurrency, toCurrency);
    const [toAmountDisplay, setToAmountDisplay] = useState(
        fromCurrency === toCurrency ? "1.00" : initialRate.toFixed(2)
    );

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

    // Unified conversion system - single source of truth
    const performConversion = useCallback((fromValue: number, fromCurr: string, toCurr: string): number => {
        const rate = getRate(fromCurr, toCurr);
        if (rate > 0 && !isNaN(fromValue) && fromValue >= 0) {
            return fromValue * rate;
        }
        return 0;
    }, []);

    const performReverseConversion = useCallback((toValue: number, fromCurr: string, toCurr: string): number => {
        const rate = getRate(fromCurr, toCurr);
        if (rate > 0 && !isNaN(toValue) && toValue >= 0) {
            return toValue / rate;
        }
        return 0;
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
                const fromValue = performReverseConversion(toValue, fromCurrency, toCurrency);
                setFromAmountDisplay(formatCurrencyValue(fromValue.toFixed(2)));
            }
        }, 300);
    }, [fromCurrency, toCurrency, formatCurrencyValue, performReverseConversion]);

    // Currency configuration
    const currencies = useMemo(() => [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' }
    ], []);

    // Get available currencies for dropdown (exclude the other currency to prevent same selection)
    const getAvailableCurrencies = useCallback((excludeCurrency: string) => {
        return currencies.filter(c => c.code !== excludeCurrency);
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

        // Swap currencies and amounts directly without recalculation
        setFromCurrency(newFromCurrency);
        setToCurrency(newToCurrency);
        setFromAmountDisplay(newFromAmount);
        setToAmountDisplay(newToAmount);

        setTimeout(() => {
            if (fromAmountRef.current) {
                fromAmountRef.current.focus();
                fromAmountRef.current.select();
            }
        }, 100);
    }, [fromCurrency, toCurrency, toAmountDisplay, fromAmountDisplay]);

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
                <div className="w-full lg:flex-1 lg:max-w-xs order-1 lg:order-1">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
                        <div className="flex-1 pr-2">
                            <input
                                ref={fromAmountRef}
                                type="text"
                                value={fromAmountDisplay}
                                onChange={(e) => {
                                    const sanitizedValue = sanitizeInputValue(e.target.value);
                                    setFromAmountDisplay(sanitizedValue);

                                    // Debounced conversion
                                    debouncedFromConversion(sanitizedValue);
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                        setFromAmountDisplay("1.00");
                                        // Trigger conversion with default value
                                        const toValue = performConversion(1, fromCurrency, toCurrency);
                                        setToAmountDisplay(formatCurrencyValue(toValue.toFixed(2)));
                                    } else {
                                        const formattedValue = formatCurrencyValue(value);
                                        setFromAmountDisplay(formattedValue);
                                    }
                                }}
                                onClick={(e) => e.currentTarget.select()}
                                onFocus={(e) => e.currentTarget.select()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.currentTarget.blur();
                                    // Allow backspace, delete, tab, escape, enter
                                    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) return;
                                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                                    // Allow numbers, decimal point, and comma
                                    if (!/^[0-9.,]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                className="currency-input w-full border-none outline-none bg-transparent"
                                placeholder={t.enterAmount}
                                aria-label={t.fromCurrency}
                            />
                        </div>
                        <div className="flex-1 pl-2">
                            <div className="relative" ref={fromDropdownRef}>
                                <div
                                    onClick={handleFromDropdownClick}
                                    className={`currency-label currency-select ${fromDropdownOpen ? 'dropdown-open' : ''}`}
                                    aria-label="From Currency"
                                >
                                    {fromCurrency}
                                </div>
                                {fromDropdownOpen && (
                                    <div className="dropdown-options absolute top-full z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                                        {getAvailableCurrencies(toCurrency).map((currency) => (
                                            <div
                                                key={currency.code}
                                                onClick={() => {
                                                    handleFromCurrencyChange(currency.code);
                                                    setFromDropdownOpen(false);
                                                }}
                                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-normal ${currency.code === fromCurrency ? 'selected' : ''
                                                    }`}
                                            >
                                                {currency.code}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Swap Button - Centered on Mobile, Between inputs on Desktop */}
                <div className="flex-shrink-0 order-2 lg:order-2 flex justify-center lg:justify-center">
                    <SwapButton
                        onClick={handleSwapCurrencies}
                        size="md"
                        variant="default"
                    />
                </div>

                {/* To Currency Section */}
                <div className="w-full lg:flex-1 lg:max-w-xs order-3 lg:order-3">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
                        <div className="flex-1 pr-2">
                            <input
                                ref={toAmountRef}
                                type="text"
                                value={toAmountDisplay}
                                onChange={(e) => {
                                    const sanitizedValue = sanitizeInputValue(e.target.value);
                                    setToAmountDisplay(sanitizedValue);

                                    // Debounced conversion
                                    debouncedToConversion(sanitizedValue);
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || value === "0" || value === "0." || value === "0.0" || value === "0.00") {
                                        setToAmountDisplay("1.00");
                                        // Trigger reverse conversion with default value
                                        const fromValue = performReverseConversion(1, fromCurrency, toCurrency);
                                        setFromAmountDisplay(formatCurrencyValue(fromValue.toFixed(2)));
                                    } else {
                                        const formattedValue = formatCurrencyValue(value);
                                        setToAmountDisplay(formattedValue);
                                    }
                                }}
                                onClick={(e) => e.currentTarget.select()}
                                onFocus={(e) => e.currentTarget.select()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.currentTarget.blur();
                                    // Allow backspace, delete, tab, escape, enter
                                    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) return;
                                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                                    // Allow numbers, decimal point, and comma
                                    if (!/^[0-9.,]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                className="currency-input w-full border-none outline-none bg-transparent"
                                placeholder={t.enterAmount}
                                aria-label={t.toCurrency}
                            />
                        </div>
                        <div className="flex-1 pl-2">
                            <div className="relative" ref={toDropdownRef}>
                                <div
                                    onClick={handleToDropdownClick}
                                    className={`currency-label currency-select ${toDropdownOpen ? 'dropdown-open' : ''}`}
                                    aria-label="To Currency"
                                >
                                    {toCurrency}
                                </div>
                                {toDropdownOpen && (
                                    <div className="dropdown-options absolute top-full z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                                        {getAvailableCurrencies(fromCurrency).map((currency) => (
                                            <div
                                                key={currency.code}
                                                onClick={() => {
                                                    handleToCurrencyChange(currency.code);
                                                    setToDropdownOpen(false);
                                                }}
                                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-normal ${currency.code === toCurrency ? 'selected' : ''
                                                    }`}
                                            >
                                                {currency.code}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Last Updated below the converter */}
            <div className="mt-6">
                <LastUpdated />
            </div>
        </>
    );
}
