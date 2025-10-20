'use client';

import React from 'react';
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
    dropdownRef
}: CurrencyInputProps) {
    return (
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
            <div className="flex-1 pr-2 sm:pr-3">
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
            <div className="flex-1 pl-2 sm:pl-3">
                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={onDropdownToggle}
                        className={`currency-label currency-select text-sm sm:text-base ${isDropdownOpen ? 'dropdown-open' : ''}`}
                        aria-label={ariaLabel}
                    >
                        {currency}
                    </div>
                    {isDropdownOpen && (
                        <div className="dropdown-options absolute top-full z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg w-full left-0 right-0 max-h-60 overflow-y-auto">
                            {availableCurrencies.map((currencyOption) => (
                                <div
                                    key={currencyOption.code}
                                    onClick={() => {
                                        onCurrencyChange(currencyOption.code);
                                        onDropdownToggle();
                                    }}
                                    className={`${currencyOption.code === currency ? 'selected' : ''}`}
                                >
                                    <div className="flex items-center space-x-2 min-w-0">
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
                                        <div className="flex-1 min-w-0">
                                            <span className="truncate uppercase text-sm">{currencyOption.code} - {currencyNames[currencyOption.code as keyof typeof currencyNames]}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
