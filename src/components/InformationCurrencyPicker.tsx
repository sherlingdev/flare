"use client";

import React, { useState, useRef } from "react";
import CurrencyRow from "./CurrencyRow";
import CurrencyRowSelector from "./CurrencyRowSelector";
import CurrencySelectModal from "./CurrencySelectModal";

export interface InformationCurrencyOption {
    code: string;
    name: string;
    symbol: string;
    flag: string;
}

export interface InformationCurrencyPickerProps {
    currencies: InformationCurrencyOption[];
    selectedCode: string;
    onSelect: (code: string) => void;
    currencyNames: Record<string, string>;
    searchPlaceholder: string;
    noResultsText: string;
    /** Modal title (e.g. translated "Currency") */
    modalTitle: string;
    /** Accessible name for the selector button */
    ariaLabel: string;
    isLoadingCurrencies?: boolean;
}

/**
 * Row pattern aligned with converter/chart (flag + code/symbol + name + coins icon + modal).
 * No reorder handle, no amount, no trash — Information page only.
 */
export default function InformationCurrencyPicker({
    currencies,
    selectedCode,
    onSelect,
    currencyNames,
    searchPlaceholder,
    noResultsText,
    modalTitle,
    ariaLabel,
    isLoadingCurrencies = false,
}: InformationCurrencyPickerProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const current = currencies.find((c) => c.code === selectedCode);
    const flagUrl = !isLoadingCurrencies && current?.flag ? current.flag : undefined;
    const displayName =
        currencyNames[selectedCode as keyof typeof currencyNames] || current?.name || selectedCode;
    const symbol = current?.symbol ?? selectedCode;

    /** Row shell is transparent; inset fill + ring live on `CurrencyRowSelector` embedded surface only. */
    const rowEmbeddedClass =
        "currency-base-row w-full max-w-full !border-0 !bg-transparent !shadow-none hover:!bg-transparent dark:hover:!bg-transparent hover:!border-transparent !px-0 !py-0 [&>div:first-child]:w-full [&>div:first-child]:min-w-0 [&>div:first-child]:items-stretch";

    return (
        <>
            <div className="w-full">
                <CurrencyRow noScroll className={rowEmbeddedClass}>
                    <CurrencyRowSelector
                        variant="embedded"
                        flag={flagUrl}
                        code={selectedCode}
                        symbol={symbol}
                        name={displayName}
                        isOpen={modalOpen}
                        onToggle={() => setModalOpen((o) => !o)}
                        ariaLabel={ariaLabel}
                        dropdownRef={dropdownRef}
                    >
                        {null}
                    </CurrencyRowSelector>
                </CurrencyRow>
            </div>

            <CurrencySelectModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                currencies={currencies}
                currencyNames={currencyNames}
                selectedCode={selectedCode}
                onSelect={(code) => {
                    onSelect(code);
                    setModalOpen(false);
                }}
                title={modalTitle}
                searchPlaceholder={searchPlaceholder}
                noResultsText={noResultsText}
            />
        </>
    );
}
