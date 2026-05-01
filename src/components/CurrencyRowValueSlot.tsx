'use client';

import React from 'react';

const DELETE_ICON = (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const WRAPPER_CLASS = 'flex items-stretch flex-shrink-0 rounded-lg sm:rounded-xl bg-white/95 dark:bg-gray-800/70 ring-1 ring-gray-200/70 dark:ring-slate-600/60 w-[6.5rem] min-w-[6.5rem] sm:w-auto sm:min-w-[13rem] sm:max-w-[18rem] overflow-visible transition-[background-color,box-shadow] duration-200';
const WRAPPER_DELETE_ONLY_CLASS = 'flex items-stretch flex-shrink-0 rounded-lg sm:rounded-xl bg-white/95 dark:bg-gray-800/70 ring-1 ring-gray-200/70 dark:ring-slate-600/60 w-auto min-w-0 overflow-visible transition-[background-color,box-shadow] duration-200';
const INPUT_WRAPPER_CLASS = 'flex items-stretch flex-1 min-w-[3.5rem] sm:min-w-[4rem] overflow-hidden rounded-l-lg sm:rounded-l-xl';
const INPUT_CLASS = 'w-full min-w-0 text-right font-medium text-gray-600 dark:text-gray-300 tabular-nums tracking-tight border-none outline-none bg-transparent px-2 py-1 sm:px-3 sm:py-2.5 text-xs sm:text-sm focus:ring-0 min-h-[1.5rem] sm:min-h-0 select-text';
const DIVIDER_CLASS = 'w-px shrink-0 bg-gray-200/80 dark:bg-slate-500/50';
const DELETE_BTN_CLASS = 'flex items-center justify-center w-8 h-8 sm:w-10 sm:h-[2.625rem] sm:min-h-[2.625rem] shrink-0 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400/30 dark:focus:ring-gray-500/30 touch-manipulation disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600 dark:disabled:hover:text-slate-300 disabled:hover:dark:bg-transparent';

export interface CurrencyRowValueSlotProps {
    value: string;
    onChange: (value: string) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    placeholder?: string;
    ariaLabel: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    inputMode?: 'text' | 'decimal';
    deleteDisabled: boolean;
    onDelete: () => void;
    removeAriaLabel: string;
    /** Chart / read-only: show spot value without editing */
    readOnly?: boolean;
    /** Chart: no amount field — only delete (or disabled base) */
    hideAmount?: boolean;
}

/** Single shared block: value input + divider + delete. Used for base row and list rows so they are identical. */
export default function CurrencyRowValueSlot({
    value,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onClick,
    placeholder,
    ariaLabel,
    inputRef,
    inputMode = 'text',
    deleteDisabled,
    onDelete,
    removeAriaLabel,
    readOnly = false,
    hideAmount = false,
}: CurrencyRowValueSlotProps) {
    if (hideAmount) {
        return (
            <div className={WRAPPER_DELETE_ONLY_CLASS}>
                <button
                    type="button"
                    disabled={deleteDisabled}
                    onClick={onDelete}
                    aria-label={removeAriaLabel}
                    className={`${DELETE_BTN_CLASS} rounded-lg sm:rounded-xl w-10 h-10 sm:w-11 sm:h-[2.625rem] sm:min-h-[2.625rem]`}
                >
                    {DELETE_ICON}
                </button>
            </div>
        );
    }

    return (
        <div className={WRAPPER_CLASS}>
            <div className={INPUT_WRAPPER_CLASS}>
                <input
                    ref={inputRef}
                    type="text"
                    inputMode={inputMode}
                    readOnly={readOnly}
                    tabIndex={readOnly ? -1 : undefined}
                    value={value}
                    onChange={(e) => !readOnly && onChange(e.target.value)}
                    onFocus={readOnly ? undefined : onFocus}
                    onBlur={readOnly ? undefined : onBlur}
                    onKeyDown={readOnly ? undefined : onKeyDown}
                    onClick={readOnly ? undefined : onClick}
                    className={`${INPUT_CLASS} ${readOnly ? "cursor-default text-gray-500 dark:text-gray-400" : ""}`}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                />
            </div>
            <div className={DIVIDER_CLASS} aria-hidden />
            <button
                type="button"
                disabled={deleteDisabled}
                onClick={onDelete}
                aria-label={removeAriaLabel}
                className={DELETE_BTN_CLASS}
            >
                {DELETE_ICON}
            </button>
        </div>
    );
}
