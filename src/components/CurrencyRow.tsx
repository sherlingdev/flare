'use client';

import { ReactNode } from 'react';

/** Outer shell shared with chart toolbar/legend so DOP rows and chart controls look identical. */
export const CURRENCY_ROW_SHELL_CLASS =
    'rounded-lg sm:rounded-xl px-4 py-3.5 min-w-0 w-full max-w-full border-2 border-gray-200/60 dark:border-slate-600/50 bg-gray-50 dark:bg-gray-700 transition-[background-color,border-color,opacity,box-shadow] duration-200 hover:bg-gray-100/95 dark:hover:bg-gray-600/90 hover:border-gray-300/80 dark:hover:border-slate-500/70';

export interface CurrencyRowProps {
    /** Left slot: drag handle (target rows) or spacer (base row). Omit on static pickers (e.g. Information). */
    left?: ReactNode;
    /** Middle: flag + currency selector + dropdown */
    children: ReactNode;
    /** Right slot: value input box + divider + delete button (omit on chart-only currency picker) */
    right?: ReactNode;
    /** Extra container class (e.g. overflow-visible, border when drag over) */
    className?: string;
    /** Container element props (e.g. onDragOver, onDrop for target rows) */
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
    /** If true, use overflow-visible so right slot (e.g. delete) is never clipped (base row) */
    noScroll?: boolean;
}

/**
 * Shared row layout for base currency (USD) and target currency cards (DOP, AED, etc.).
 * Same structure and pattern for design harmony.
 */
export default function CurrencyRow({ left, children, right, className = '', containerProps = {}, noScroll = false }: CurrencyRowProps) {
    return (
        <div
            className={`flex items-center justify-between gap-2 sm:gap-3 ${CURRENCY_ROW_SHELL_CLASS} ${noScroll ? 'overflow-visible' : 'overflow-x-auto'} ${className}`}
            {...containerProps}
        >
            {left != null ? left : null}
            <div className="flex w-full min-w-0 flex-1 basis-0 items-center gap-1 sm:gap-2 py-0 relative z-[1]">
                {children}
            </div>
            {right != null ? right : null}
        </div>
    );
}
