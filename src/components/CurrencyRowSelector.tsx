'use client';

import React, { RefObject, ReactNode } from 'react';
import Image from 'next/image';
import { Coins } from 'lucide-react';

export interface CurrencyRowSelectorProps {
    flag: string | undefined;
    code: string;
    symbol: string;
    name: string;
    /** Replaces flag area (e.g. Globe for language picker); with `headline`, renders inline without a bordered chip */
    leading?: ReactNode;
    /** When set, replaces `code` / `symbol` / `name` label lines (e.g. language display) */
    headline?: string;
    subline?: string;
    isOpen: boolean;
    onToggle: () => void;
    ariaLabel: string;
    dropdownRef?: RefObject<HTMLDivElement | null>;
    /** Class for the dropdown panel (e.g. 'currency-input-dropdown' or 'card-currency-dropdown') */
    dropdownClassName?: string;
    children: ReactNode;
    /**
     * `default`: row/card provides hover; button stays visually flat (matches converter + chart list).
     * `embedded`: row is transparent inside an inset surface — subtle button hover + open highlight (also when modal is open).
     */
    variant?: 'default' | 'embedded';
}

/**
 * Shared middle section for currency rows: flag + selector button (code, symbol, name, chevron) + optional dropdown slot.
 * Used by both base row (USD) and list rows (DOP, etc.) so they look identical.
 */
export default function CurrencyRowSelector({
    flag,
    code,
    symbol,
    name,
    leading,
    headline,
    subline,
    isOpen,
    onToggle,
    ariaLabel,
    dropdownRef,
    dropdownClassName = '',
    children,
    variant = 'default',
}: CurrencyRowSelectorProps) {
    /** Inline dropdown only; modal flow passes `null` — avoid a second-tone patch on the row */
    const hasInlineDropdown = children != null;
    const embedded = variant === 'embedded';
    const showOpenFill = isOpen && (hasInlineDropdown || embedded);

    const buttonTone =
        embedded
            ? 'bg-transparent hover:bg-transparent dark:hover:bg-transparent active:bg-transparent focus-visible:ring-offset-[#FFFFFFF2] dark:focus-visible:ring-offset-[#1E293B]'
            : 'bg-transparent hover:bg-transparent dark:hover:bg-transparent active:bg-transparent focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-700';

    /**
     * Information page: inset card sits only on this strip. Whole surface is one control (pointer +
     * open modal), matching `information-currency-inner` / chart selectors.
     */
    const embeddedRowSurface =
        'flex w-full flex-1 h-full min-h-0 items-center gap-2 sm:gap-3 ' +
        'rounded-xl px-5 sm:px-7 py-3.5 sm:py-4 ' +
        'shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/40 backdrop-blur-sm ' +
        'transition-colors duration-200 ' +
        'bg-[#FFFFFFF2] dark:bg-[#1E293BF2] ' +
        'hover:bg-slate-200/65 dark:hover:bg-slate-600/45 ' +
        'focus-visible:bg-slate-200/65 dark:focus-visible:bg-slate-600/45 ' +
        'cursor-pointer ' +
        (isOpen ? 'bg-slate-200/65 dark:bg-slate-600/45 ' : '');

    const embeddedFocusRing =
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-flare-primary/40 focus-visible:ring-offset-1 ' +
        'focus-visible:ring-offset-[#FFFFFFF2] dark:focus-visible:ring-offset-[#1E293B]';

    const chipShellClass =
        'flex-shrink-0 w-5 h-3.5 sm:w-8 sm:h-6 rounded-sm sm:rounded-md overflow-hidden border border-gray-200 dark:border-gray-600';

    /** Bordered chip for flags (and any leading without headline) */
    const mediaChipClass = `${chipShellClass} flex items-center justify-center`;

    /** Settings-style rows (language/theme): icon only, no chip — same footprint as flag slot for row height */
    const useInlineLeading = Boolean(leading && headline);
    const inlineLeadingWrapClass =
        'flex h-3.5 w-5 shrink-0 items-center justify-center text-flare-primary sm:h-6 sm:w-8';

    const mediaChipBody =
        leading && !headline ? (
            leading
        ) : flag ? (
            <Image
                src={flag}
                alt={`${code} flag`}
                width={32}
                height={24}
                className="h-full w-full object-cover"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        ) : null;

    const flagEl = useInlineLeading ? (
        <div className={inlineLeadingWrapClass} aria-hidden>
            {leading}
        </div>
    ) : (
        <div className={mediaChipClass}>{mediaChipBody}</div>
    );

    const titleBlock = headline ? (
        <div className="min-w-0 flex-initial overflow-visible">
            <p className="min-w-0 whitespace-nowrap text-sm font-medium text-flare-primary">{headline}</p>
            {subline ? (
                <p className="hidden truncate text-[11px] leading-tight text-gray-500 dark:text-gray-400 sm:block">
                    {subline}
                </p>
            ) : null}
        </div>
    ) : (
        <div className="min-w-0 flex-initial overflow-visible">
            <p className="font-medium text-flare-primary text-sm whitespace-nowrap min-w-0">
                {code} <span className="font-normal">({symbol})</span>
            </p>
            <p className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                {name}
            </p>
        </div>
    );

    const labelButton = (
        <button
            type="button"
            onClick={onToggle}
            className={`flex items-center gap-0.5 sm:gap-2 min-w-0 flex-1 max-w-full text-left rounded-md py-0 sm:py-1.5 px-1 sm:px-2 sm:pr-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-flare-primary/40 focus-visible:ring-offset-1 ${buttonTone} ${!embedded && showOpenFill ? 'dropdown-open bg-gray-200/50 dark:bg-slate-600/40' : ''}`}
            aria-label={ariaLabel}
            aria-expanded={isOpen}
        >
            {titleBlock}
            <Coins
                className={`flex-shrink-0 w-4 h-4 text-flare-primary transition-opacity duration-200 ${isOpen ? 'opacity-80' : ''}`}
                strokeWidth={2}
                aria-hidden
            />
        </button>
    );

    if (embedded) {
        const flagDecorative = useInlineLeading ? (
            <div aria-hidden className={`pointer-events-none ${inlineLeadingWrapClass}`}>
                {leading}
            </div>
        ) : (
            <div aria-hidden className={`pointer-events-none ${mediaChipClass}`}>
                {leading && !headline ? (
                    leading
                ) : flag ? (
                    <Image
                        src={flag}
                        alt=""
                        width={32}
                        height={24}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : null}
            </div>
        );

        const embeddedTitle = headline ? (
            <span className="flex-initial overflow-visible text-left">
                <span className="block min-w-0 whitespace-nowrap text-sm font-medium text-flare-primary">{headline}</span>
                {subline ? (
                    <span className="hidden truncate text-[11px] leading-tight text-gray-500 dark:text-gray-400 sm:block">
                        {subline}
                    </span>
                ) : null}
            </span>
        ) : (
            <span className="flex-initial overflow-visible text-left">
                <span className="block min-w-0 font-medium text-flare-primary text-sm whitespace-nowrap">
                    {code} <span className="font-normal">({symbol})</span>
                </span>
                <span className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                    {name}
                </span>
            </span>
        );

        return (
            <div
                ref={dropdownRef}
                className="relative m-0 flex w-full min-w-0 max-w-full flex-1 flex-col self-stretch p-0 min-h-0"
            >
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={ariaLabel}
                    aria-expanded={isOpen}
                    className={`${embeddedRowSurface} ${embeddedFocusRing} text-left min-w-0`}
                >
                    {flagDecorative}
                    <span className="flex min-w-0 flex-1 max-w-full items-center gap-0.5 sm:gap-2">
                        {embeddedTitle}
                        <Coins
                            className={`flex-shrink-0 w-4 h-4 text-flare-primary transition-opacity duration-200 ${isOpen ? 'opacity-80' : ''}`}
                            strokeWidth={2}
                            aria-hidden
                        />
                    </span>
                </button>
                {isOpen && children != null && (
                    <div className={`dropdown-options ${dropdownClassName}`.trim()}>{children}</div>
                )}
            </div>
        );
    }

    return (
        <>
            {flagEl}
            <div
                className="relative m-0 flex w-full min-w-0 max-w-full min-h-0 flex-1 items-center gap-0 sm:gap-2 p-0"
                ref={dropdownRef}
            >
                {labelButton}
                {isOpen && children != null && (
                    <div className={`dropdown-options ${dropdownClassName}`.trim()}>
                        {children}
                    </div>
                )}
            </div>
        </>
    );
}
