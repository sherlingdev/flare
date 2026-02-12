'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

export interface CurrencyOption {
    code: string;
    name: string;
    symbol: string;
    flag: string;
}

export interface CurrencySelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    currencies: CurrencyOption[];
    currencyNames: Record<string, string>;
    selectedCode: string;
    onSelect: (code: string) => void;
    title?: string;
    searchPlaceholder?: string;
    noResultsText?: string;
}

export default function CurrencySelectModal({
    isOpen,
    onClose,
    currencies,
    currencyNames,
    selectedCode,
    onSelect,
    title = 'Choose currency',
    searchPlaceholder = 'Search currency...',
    noResultsText = 'No currencies found',
}: CurrencySelectModalProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const filtered = search.trim()
        ? currencies.filter((c) => {
            const q = search.toLowerCase();
            return c.code.toLowerCase().includes(q) ||
                c.name.toLowerCase().includes(q) ||
                (currencyNames[c.code]?.toLowerCase().includes(q));
          })
        : currencies;

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => searchInputRef.current?.focus());
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
            return;
        }
        if (e.key === 'Enter' && filtered.length > 0) {
            e.preventDefault();
            const code = filtered[selectedIndex >= 0 ? selectedIndex : 0]?.code;
            if (code) {
                onSelect(code);
                onClose();
            }
        }
    };

    const handleSelect = (code: string) => {
        onSelect(code);
        onClose();
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md z-[10050] flex items-start justify-center pt-6 sm:pt-8 pb-6 px-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 10050 }}
            onClick={(e) => {
                if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose();
            }}
            role="presentation"
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="currency-modal-title"
                className="relative bg-[#FFFFFFF2] dark:bg-[#1E293BF2] rounded-xl w-full max-w-md mx-auto shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-scale-in flex flex-col max-h-[85vh]"
                onKeyDown={handleKeyDown}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-flare-primary hover:opacity-70 transition-opacity z-10 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="px-6 pt-6 pb-4">
                    <h2 id="currency-modal-title" className="text-xl font-bold text-flare-primary pr-10">
                        {title}
                    </h2>
                </div>

                <div
                    ref={listRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-4 w-full box-border flex flex-col"
                >
                    <div className="flex-shrink-0 sticky top-0 z-10 bg-[#FFFFFFF2] dark:bg-[#1E293BF2] pb-4 -mt-px">
                        <div className="relative bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden h-[52px] flex items-center w-full">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full h-full pl-11 pr-11 py-0 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0"
                                style={{ lineHeight: '52px' }}
                                aria-label={searchPlaceholder}
                            />
                            {search.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); searchInputRef.current?.focus(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    {filtered.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            {noResultsText}
                        </p>
                    ) : (
                        <ul className="space-y-1.5 flex-1 min-h-0" role="listbox">
                            {filtered.map((c, idx) => (
                                <li key={c.code}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={c.code === selectedCode || idx === selectedIndex}
                                        onClick={() => handleSelect(c.code)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors min-h-[52px] ${
                                            c.code === selectedCode
                                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200'
                                                : idx === selectedIndex
                                                    ? 'bg-slate-100 dark:bg-slate-700/60'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                                        }`}
                                    >
                                        <div className="flex-shrink-0 w-9 h-7 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                                            {c.flag && (
                                                <Image
                                                    src={c.flag}
                                                    alt=""
                                                    width={36}
                                                    height={28}
                                                    className="object-cover w-full h-full"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium text-gray-900 dark:text-gray-100 block truncate">
                                                {c.code} <span className="font-normal text-gray-600 dark:text-gray-400">({c.symbol})</span>
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                                                {currencyNames[c.code] || c.name}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
