'use client';

import React, { RefObject, ReactNode } from 'react';
import Image from 'next/image';

export interface CurrencyRowSelectorProps {
    flag: string | undefined;
    code: string;
    symbol: string;
    name: string;
    isOpen: boolean;
    onToggle: () => void;
    ariaLabel: string;
    dropdownRef?: RefObject<HTMLDivElement | null>;
    /** Class for the dropdown panel (e.g. 'currency-input-dropdown' or 'card-currency-dropdown') */
    dropdownClassName?: string;
    children: ReactNode;
}

/**
 * Shared middle section for currency rows: flag + selector button (code, symbol, name, chevron) + dropdown slot.
 * Used by both base row (USD) and list rows (DOP, etc.) so they look identical.
 */
export default function CurrencyRowSelector({
    flag,
    code,
    symbol,
    name,
    isOpen,
    onToggle,
    ariaLabel,
    dropdownRef,
    dropdownClassName = '',
    children,
}: CurrencyRowSelectorProps) {
    return (
        <>
            <div className="flex-shrink-0 w-5 h-3.5 sm:w-8 sm:h-6 rounded-sm sm:rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                {flag && (
                    <Image
                        src={flag}
                        alt={`${code} flag`}
                        width={32}
                        height={24}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                )}
            </div>
            <div
                className="flex items-center gap-0 sm:gap-2 flex-1 min-w-0 basis-[4rem] sm:basis-[5rem] relative shrink p-0 m-0"
                ref={dropdownRef}
            >
                <button
                    type="button"
                    onClick={onToggle}
                    className={`flex items-center gap-0.5 sm:gap-2 w-full min-w-0 max-w-full text-left rounded-md py-0 sm:py-1.5 p-0 sm:px-0 sm:pr-1 ${isOpen ? 'dropdown-open' : ''}`}
                    aria-label={ariaLabel}
                    aria-expanded={isOpen}
                >
                    <div className="min-w-0 flex-initial overflow-visible">
                        <p className="font-medium text-flare-primary text-sm whitespace-nowrap min-w-0">
                            {code} <span className="font-normal">({symbol})</span>
                        </p>
                        <p className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                            {name}
                        </p>
                    </div>
                    <svg
                        className={`flex-shrink-0 w-4 h-4 text-flare-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isOpen && children != null && (
                    <div className={`dropdown-options ${dropdownClassName}`.trim()}>
                        {children}
                    </div>
                )}
            </div>
        </>
    );
}
