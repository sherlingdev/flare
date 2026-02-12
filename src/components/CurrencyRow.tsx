'use client';

import { ReactNode } from 'react';

export interface CurrencyRowProps {
    /** Left slot: drag handle (target rows) or spacer (base row) */
    left: ReactNode;
    /** Middle: flag + currency selector + dropdown */
    children: ReactNode;
    /** Right slot: value input box + divider + delete button */
    right: ReactNode;
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
            className={`flex items-center justify-between gap-2 sm:gap-3 rounded-lg sm:rounded-xl px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200/60 dark:border-slate-600/50 transition-[border-color,opacity] duration-200 min-w-0 w-full max-w-full ${noScroll ? 'overflow-visible' : 'overflow-x-auto'} ${className}`}
            {...containerProps}
        >
            {left}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 basis-0 py-0 relative z-[1] shrink">
                {children}
            </div>
            {right}
        </div>
    );
}
