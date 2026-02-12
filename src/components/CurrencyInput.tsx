'use client';

import React from 'react';
import CurrencyRow from './CurrencyRow';
import CurrencyRowValueSlot from './CurrencyRowValueSlot';
import CurrencyRowSelector from './CurrencyRowSelector';
import CurrencySelectModal from './CurrencySelectModal';

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
        removeCurrency: string;
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
    const leftSlot = (
            <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 p-0 sm:p-1 cursor-pointer" aria-hidden title="">
                <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
                </svg>
            </div>
        );
    const rightSlot = (
        <CurrencyRowValueSlot
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onClick={onClick}
            placeholder={placeholder}
            ariaLabel={ariaLabel}
            inputRef={inputRef}
            deleteDisabled
            onDelete={() => {}}
            removeAriaLabel={`${t.removeCurrency} ${currency}`}
        />
    );

    /* Middle: same structure as list row — flag + selector wrapper (basis so name stays left) */
    const current = availableCurrencies.find(c => c.code === currency);
    const flagUrl = !isLoadingCurrencies && current?.flag ? current.flag : undefined;

    return (
        <>
            <CurrencyRow left={leftSlot} right={rightSlot} noScroll className={`currency-base-row ${isDropdownOpen ? 'dropdown-open' : ''}`}>
                <CurrencyRowSelector
                    flag={flagUrl}
                    code={currency}
                    symbol={current?.symbol ?? currency}
                    name={currencyNames[currency as keyof typeof currencyNames] || current?.name || currency}
                    isOpen={isDropdownOpen}
                    onToggle={onDropdownToggle}
                    ariaLabel={ariaLabel}
                    dropdownRef={dropdownRef}
                >
                    {null}
                </CurrencyRowSelector>
            </CurrencyRow>
            <CurrencySelectModal
                isOpen={isDropdownOpen}
                onClose={onDropdownToggle}
                currencies={availableCurrencies}
                currencyNames={currencyNames}
                selectedCode={currency}
                onSelect={(code) => {
                    onCurrencyChange(code);
                    onDropdownToggle();
                }}
                searchPlaceholder={t.searchCurrency}
                noResultsText={t.noCurrenciesFound}
            />
        </>
    );
}
