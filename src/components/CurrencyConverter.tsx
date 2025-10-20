"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { getCurrentLocalRates } from "../lib/scraper";
import { translations } from "../lib/translations";
import SwapButton from "./SwapButton";
import LastUpdated from "./LastUpdated";
import CurrencyInput from "./CurrencyInput";

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
        if (from === 'USD' && to === 'DOP') defaultRate = 63.38;
        else if (from === 'DOP' && to === 'USD') defaultRate = 0.0158;
        else if (from === 'USD' && to === 'EUR') defaultRate = 0.857;
        else if (from === 'EUR' && to === 'USD') defaultRate = 1.167;
        else if (from === 'EUR' && to === 'DOP') defaultRate = 73.94;
        else if (from === 'DOP' && to === 'EUR') defaultRate = 0.0135;
        // CAD rates
        else if (from === 'CAD' && to === 'DOP') defaultRate = 45.24;
        else if (from === 'DOP' && to === 'CAD') defaultRate = 0.022;
        else if (from === 'CAD' && to === 'USD') defaultRate = 0.72;
        else if (from === 'USD' && to === 'CAD') defaultRate = 1.39;
        else if (from === 'CAD' && to === 'EUR') defaultRate = 0.61;
        else if (from === 'EUR' && to === 'CAD') defaultRate = 1.63;
        // GBP rates
        else if (from === 'GBP' && to === 'DOP') defaultRate = 85.15;
        else if (from === 'DOP' && to === 'GBP') defaultRate = 0.0117;
        else if (from === 'GBP' && to === 'USD') defaultRate = 1.34;
        else if (from === 'USD' && to === 'GBP') defaultRate = 0.74;
        else if (from === 'GBP' && to === 'EUR') defaultRate = 1.15;
        else if (from === 'EUR' && to === 'GBP') defaultRate = 0.87;
        // MXN rates
        else if (from === 'MXN' && to === 'DOP') defaultRate = 3.45;
        else if (from === 'DOP' && to === 'MXN') defaultRate = 0.29;
        else if (from === 'MXN' && to === 'USD') defaultRate = 0.054;
        else if (from === 'USD' && to === 'MXN') defaultRate = 18.37;
        else if (from === 'MXN' && to === 'EUR') defaultRate = 0.047;
        else if (from === 'EUR' && to === 'MXN') defaultRate = 21.43;
        // Cross rates between existing currencies
        else if (from === 'GBP' && to === 'CAD') defaultRate = 1.88;
        else if (from === 'CAD' && to === 'GBP') defaultRate = 0.53;
        else if (from === 'GBP' && to === 'MXN') defaultRate = 24.68;
        else if (from === 'MXN' && to === 'GBP') defaultRate = 0.041;
        else if (from === 'CAD' && to === 'MXN') defaultRate = 13.11;
        else if (from === 'MXN' && to === 'CAD') defaultRate = 0.076;
        // JPY rates
        else if (from === 'JPY' && to === 'DOP') defaultRate = 0.42;
        else if (from === 'DOP' && to === 'JPY') defaultRate = 2.37;
        else if (from === 'JPY' && to === 'USD') defaultRate = 0.0067;
        else if (from === 'USD' && to === 'JPY') defaultRate = 149.25;
        else if (from === 'JPY' && to === 'EUR') defaultRate = 0.0057;
        else if (from === 'EUR' && to === 'JPY') defaultRate = 175.44;
        // AUD rates
        else if (from === 'AUD' && to === 'DOP') defaultRate = 41.28;
        else if (from === 'DOP' && to === 'AUD') defaultRate = 0.024;
        else if (from === 'AUD' && to === 'USD') defaultRate = 0.65;
        else if (from === 'USD' && to === 'AUD') defaultRate = 1.54;
        else if (from === 'AUD' && to === 'EUR') defaultRate = 0.56;
        else if (from === 'EUR' && to === 'AUD') defaultRate = 1.79;
        // CHF rates
        else if (from === 'CHF' && to === 'DOP') defaultRate = 80.12;
        else if (from === 'DOP' && to === 'CHF') defaultRate = 0.012;
        else if (from === 'CHF' && to === 'USD') defaultRate = 1.26;
        else if (from === 'USD' && to === 'CHF') defaultRate = 0.79;
        else if (from === 'CHF' && to === 'EUR') defaultRate = 1.08;
        else if (from === 'EUR' && to === 'CHF') defaultRate = 0.93;
        // CNY rates
        else if (from === 'CNY' && to === 'DOP') defaultRate = 8.90;
        else if (from === 'DOP' && to === 'CNY') defaultRate = 0.11;
        else if (from === 'CNY' && to === 'USD') defaultRate = 0.14;
        else if (from === 'USD' && to === 'CNY') defaultRate = 7.14;
        else if (from === 'CNY' && to === 'EUR') defaultRate = 0.12;
        else if (from === 'EUR' && to === 'CNY') defaultRate = 8.33;
        // Cross rates between new currencies
        else if (from === 'JPY' && to === 'CAD') defaultRate = 0.009;
        else if (from === 'CAD' && to === 'JPY') defaultRate = 111.11;
        else if (from === 'JPY' && to === 'GBP') defaultRate = 0.004;
        else if (from === 'GBP' && to === 'JPY') defaultRate = 250.00;
        else if (from === 'JPY' && to === 'MXN') defaultRate = 0.12;
        else if (from === 'MXN' && to === 'JPY') defaultRate = 8.33;
        else if (from === 'AUD' && to === 'CAD') defaultRate = 0.90;
        else if (from === 'CAD' && to === 'AUD') defaultRate = 1.11;
        else if (from === 'AUD' && to === 'GBP') defaultRate = 0.52;
        else if (from === 'GBP' && to === 'AUD') defaultRate = 1.92;
        else if (from === 'AUD' && to === 'MXN') defaultRate = 11.95;
        else if (from === 'MXN' && to === 'AUD') defaultRate = 0.084;
        else if (from === 'CHF' && to === 'CAD') defaultRate = 1.55;
        else if (from === 'CAD' && to === 'CHF') defaultRate = 0.65;
        else if (from === 'CHF' && to === 'GBP') defaultRate = 0.89;
        else if (from === 'GBP' && to === 'CHF') defaultRate = 1.12;
        else if (from === 'CHF' && to === 'MXN') defaultRate = 22.22;
        else if (from === 'MXN' && to === 'CHF') defaultRate = 0.045;
        else if (from === 'CNY' && to === 'CAD') defaultRate = 0.19;
        else if (from === 'CAD' && to === 'CNY') defaultRate = 5.26;
        else if (from === 'CNY' && to === 'GBP') defaultRate = 0.11;
        else if (from === 'GBP' && to === 'CNY') defaultRate = 9.09;
        else if (from === 'CNY' && to === 'MXN') defaultRate = 2.58;
        else if (from === 'MXN' && to === 'CNY') defaultRate = 0.39;
        else if (from === 'JPY' && to === 'AUD') defaultRate = 0.010;
        else if (from === 'AUD' && to === 'JPY') defaultRate = 100.00;
        else if (from === 'JPY' && to === 'CHF') defaultRate = 0.008;
        else if (from === 'CHF' && to === 'JPY') defaultRate = 125.00;
        else if (from === 'JPY' && to === 'CNY') defaultRate = 0.045;
        else if (from === 'CNY' && to === 'JPY') defaultRate = 22.22;
        else if (from === 'AUD' && to === 'CHF') defaultRate = 0.78;
        else if (from === 'CHF' && to === 'AUD') defaultRate = 1.28;
        else if (from === 'AUD' && to === 'CNY') defaultRate = 4.55;
        else if (from === 'CNY' && to === 'AUD') defaultRate = 0.22;
        else if (from === 'CHF' && to === 'CNY') defaultRate = 7.14;
        else if (from === 'CNY' && to === 'CHF') defaultRate = 0.14;

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
        { code: 'USD', name: 'US Dollar', symbol: '$', flag: 'https://www.xe.com/svgs/flags/usd.static.svg' },
        { code: 'EUR', name: 'Euro', symbol: '€', flag: 'https://www.xe.com/svgs/flags/eur.static.svg' },
        { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: 'https://www.xe.com/svgs/flags/dop.static.svg' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: 'https://www.xe.com/svgs/flags/cad.static.svg' },
        { code: 'GBP', name: 'British Pound', symbol: '£', flag: 'https://www.xe.com/svgs/flags/gbp.static.svg' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: 'https://www.xe.com/svgs/flags/mxn.static.svg' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/jpy.static.svg' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: 'https://www.xe.com/svgs/flags/aud.static.svg' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: 'https://www.xe.com/svgs/flags/chf.static.svg' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: 'https://www.xe.com/svgs/flags/cny.static.svg' }
    ], []);

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
                                const fromValue = performReverseConversion(1, fromCurrency, toCurrency);
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
