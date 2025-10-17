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

        setToAmountDisplay("1.00");
        setFromCurrency(newFromCurrency);
        setToCurrency(newToCurrency);
        setFromAmountDisplay(newFromAmount);

        setTimeout(() => {
            if (fromAmountRef.current) {
                fromAmountRef.current.focus();
                fromAmountRef.current.select();
            }
        }, 100);
    }, [fromCurrency, toCurrency, toAmountDisplay]);

    // Handle currency changes without automatic switching
    const handleFromCurrencyChange = useCallback((newCurrency: string) => {
        setFromCurrency(newCurrency);
    }, []);

    const handleToCurrencyChange = useCallback((newCurrency: string) => {
        setToCurrency(newCurrency);
    }, []);

    // Dropdown handlers
    const handleFromDropdownClick = useCallback(() => {
        setFromDropdownOpen(!fromDropdownOpen);
        setToDropdownOpen(false);
    }, [fromDropdownOpen]);

    const handleToDropdownClick = useCallback(() => {
        setToDropdownOpen(!toDropdownOpen);
        setFromDropdownOpen(false);
    }, [toDropdownOpen]);

    // Simple conversion calculation
    const conversionResult = useMemo(() => {
        const currentRate = getRate(fromCurrency, toCurrency);
        const fromValue = parseFloat(fromAmountDisplay.replace(/,/g, ''));

        if (!isNaN(fromValue) && fromValue >= 0 && currentRate > 0) {
            const result = fromValue * currentRate;
            return result.toFixed(2);
        }

        return "0.00";
    }, [fromAmountDisplay, fromCurrency, toCurrency]);

    // Update conversion result
    useEffect(() => {
        setToAmountDisplay(conversionResult);
    }, [conversionResult]);

    // Update when currencies change
    useEffect(() => {
        const rate = getRate(fromCurrency, toCurrency);
        const calculatedAmount = (parseFloat(fromAmountDisplay.replace(/,/g, '')) * rate).toFixed(2);
        setToAmountDisplay(calculatedAmount);
    }, [fromCurrency, toCurrency, fromAmountDisplay]);

    return (
        <>
            <div className="currency-input-group flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8 relative">
                {/* From Currency Section */}
                <div className="w-full lg:flex-1 lg:max-w-xs order-1 lg:order-1">
                    <div className="flex items-center space-x-2 sm:space-x-4 bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
                        <input
                            ref={fromAmountRef}
                            type="text"
                            value={fromAmountDisplay}
                            onChange={(e) => {
                                const sanitizedValue = sanitizeInputValue(e.target.value);
                                setFromAmountDisplay(sanitizedValue);
                            }}
                            onBlur={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    setFromAmountDisplay("1.00");
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
                            className="currency-input flex-1 border-none outline-none bg-transparent"
                            placeholder={t.enterAmount}
                            aria-label={t.fromCurrency}
                        />
                        <div className="relative">
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
                    <div className="flex items-center space-x-2 sm:space-x-4 bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
                        <input
                            ref={toAmountRef}
                            type="text"
                            value={toAmountDisplay}
                            onChange={(e) => {
                                const sanitizedValue = sanitizeInputValue(e.target.value);
                                setToAmountDisplay(sanitizedValue);
                            }}
                            onBlur={(e) => {
                                const value = e.target.value;
                                if (value === "" || value === "0" || value === "0." || value === "0.0" || value === "0.00") {
                                    setToAmountDisplay("0.00");
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
                            className="currency-input flex-1 border-none outline-none bg-transparent"
                            placeholder={t.enterAmount}
                            aria-label={t.toCurrency}
                        />
                        <div className="relative">
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

            {/* Last Updated below the converter */}
            <div className="mt-6">
                <LastUpdated />
            </div>
        </>
    );
}
