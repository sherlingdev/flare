"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConverter } from "@/contexts/ConverterContext";
import { translations } from "@/lib/translations";
import CurrencyInput from "./CurrencyInput";
import CurrencyRow from "./CurrencyRow";
import CurrencyRowValueSlot from "./CurrencyRowValueSlot";
import CurrencyRowSelector from "./CurrencyRowSelector";
import CurrencySelectModal from "./CurrencySelectModal";
import { Plus } from "lucide-react";
import type { CurrencyItem } from "@/hooks/useCurrencyPayload";
import { MAX_TARGET_CURRENCIES } from "@/lib/converterLimits";

/** HTML5 + touch drag: sentinel for the base (top) currency row — swap with any target row */
const DRAG_INDEX_BASE = -1;

export interface MultiCurrencyPairPanelProps {
    variant: "converter" | "chart";
    currencyRates: Record<string, number>;
    currencies: CurrencyItem[];
    isLoadingCurrencies: boolean;
}

export default function MultiCurrencyPairPanel({
    variant,
    currencyRates,
    currencies,
    isLoadingCurrencies,
}: MultiCurrencyPairPanelProps) {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];
    const {
        fromCurrency,
        toCurrency,
        toCurrencies,
        setFromCurrency: setContextFromCurrency,
        addToCurrency,
        removeToCurrency,
        setPairMultiple,
    } = useConverter();

    const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
    const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
    const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragOverIndexRef = useRef<number | null>(null);
    const touchDragRef = useRef<{ startIndex: number; touchId: number; startY: number; activated: boolean; longPressRequired?: boolean; longPressTimerId?: ReturnType<typeof setTimeout> } | null>(null);
    const justDidDragRef = useRef(false);
    const addCurrencyDropdownRef = useRef<HTMLDivElement>(null);
    const fromAmountRef = useRef<HTMLInputElement>(null);
    const atTargetLimit = toCurrencies.length >= MAX_TARGET_CURRENCIES;

    useEffect(() => {
        if (atTargetLimit && addCurrencyOpen) setAddCurrencyOpen(false);
    }, [atTargetLimit, addCurrencyOpen]);
    const fromDropdownRef = useRef<HTMLDivElement>(null);

    // Edit-any behavior (like single pair + swap): whichever field you edit becomes the source; others calculate from it.
    const [baseAmount, setBaseAmount] = useState(1);
    const [baseCurrency, setBaseCurrency] = useState(fromCurrency);
    const [usdInputRaw, setUsdInputRaw] = useState<string | null>(null);
    const [cardInputRaw, setCardInputRaw] = useState<{ code: string; value: string } | null>(null);

    const fromDebounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => setBaseCurrency((prev) => (prev === fromCurrency ? prev : fromCurrency)), [fromCurrency]);
    useEffect(() => { if (cardInputRaw && !toCurrencies.includes(cardInputRaw.code)) setCardInputRaw(null); }, [cardInputRaw, toCurrencies]);
    useEffect(() => { dragOverIndexRef.current = dragOverIndex; }, [dragOverIndex]);

    // Unified conversion system - single source of truth
    const performConversion = useCallback((fromValue: number, fromCurr: string, toCurr: string): number => {
        // Use dynamic rates instead of hardcoded ones
        const rates = currencyRates;

        if (Object.keys(rates).length === 0) {
            return fromValue;
        }

        if (fromCurr === 'USD') {
            // USD to other currency: use rate directly (now rates are already inversa)
            const rate = rates[toCurr] || 1;
            return fromValue * rate;
        } else if (toCurr === 'USD') {
            // Other currency to USD: use inverse rate (1 / rate)
            const rate = rates[fromCurr] || 1;
            return fromValue / rate;
        } else {
            // Cross-currency conversion: fromCurr -> USD -> toCurr
            // Step 1: Convert fromCurr to USD
            const fromRate = rates[fromCurr] || 1;
            const usdValue = fromValue / fromRate;
            // Step 2: Convert USD to toCurr
            const toRate = rates[toCurr] || 1;
            return usdValue * toRate;
        }
    }, [currencyRates]);

    useEffect(() => {
        const validBase = baseCurrency === fromCurrency || toCurrencies.includes(baseCurrency);
        if (!validBase) {
            setBaseCurrency(fromCurrency);
            setBaseAmount(performConversion(baseAmount, baseCurrency, fromCurrency));
        }
    }, [baseCurrency, fromCurrency, toCurrencies, baseAmount, performConversion]);

    // --- Format & conversion helpers ---
    const formatCurrencyValue = useCallback((value: string): string => {
        if (value === "" || value === "0") return "0.00";
        const num = parseFloat(value.replace(/,/g, ''));
        if (isNaN(num)) return "0.00";
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, []);

    const setBaseFromAmount = useCallback((amount: number, currency: string) => {
        if (!Number.isNaN(amount) && amount >= 0) {
            setBaseAmount(amount);
            setBaseCurrency(currency);
        }
    }, []);

    const handleAmountKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) return;
        if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
        if (!/^[0-9.,]$/.test(e.key)) e.preventDefault();
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



    const debouncedFromConversion = useCallback(() => {
        if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
        fromDebounceRef.current = setTimeout(() => {}, 300);
    }, []);

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


    // Auto-focus: converter only
    useEffect(() => {
        if (variant !== "converter" || !mounted || !fromAmountRef.current) return;
        fromAmountRef.current.focus();
        fromAmountRef.current.select();
    }, [mounted, variant]);

    useEffect(() => {
        return () => {
            if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
        };
    }, []);

    // Derived: "from" amount and all card amounts from current base (edit-any source of truth)
    const fromAmountNum = performConversion(baseAmount, baseCurrency, fromCurrency);
    const fromAmountDisplay = formatCurrencyValue(fromAmountNum.toFixed(2));

    const getCardConvertedValue = useCallback((code: string) => performConversion(baseAmount, baseCurrency, code), [baseAmount, baseCurrency, performConversion]);

    const currenciesToAdd = currencies.filter(
        (c) => c.code !== fromCurrency && !toCurrencies.includes(c.code)
    );

    const cardSlotCurrencies = openCardIndex !== null && toCurrencies[openCardIndex]
        ? getAvailableCurrencies(fromCurrency, toCurrencies[openCardIndex])
        : [];
    const handleFromCurrencyChange = useCallback((newCurrency: string) => {
        setContextFromCurrency(newCurrency);
    }, [setContextFromCurrency]);

    /** Swap primary (fromCurrency) with the currency at listIndex; keeps conversion math consistent. */
    const swapBaseWithTarget = useCallback(
        (listIndex: number) => {
            if (listIndex < 0 || listIndex >= toCurrencies.length) return;
            const oldFrom = fromCurrency;
            const target = toCurrencies[listIndex];
            const newList = [...toCurrencies];
            newList[listIndex] = oldFrom;
            setPairMultiple(target, newList);
        },
        [fromCurrency, toCurrencies, setPairMultiple]
    );

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', index.toString());
        // Close any open dropdowns when starting drag
        setOpenCardIndex(null);
        setAddCurrencyOpen(false);
    };

    const handleDragStartBase = (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedIndex(DRAG_INDEX_BASE);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', String(DRAG_INDEX_BASE));
        setOpenCardIndex(null);
        setAddCurrencyOpen(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragOverBase = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex !== null && draggedIndex >= 0) {
            setDragOverIndex(DRAG_INDEX_BASE);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDragLeaveBase = () => {
        setDragOverIndex(null);
    };

    const applyReorder = useCallback((fromIndex: number, toIndex: number) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
        const newList = [...toCurrencies];
        const [removed] = newList.splice(fromIndex, 1);
        newList.splice(toIndex, 0, removed);
        setPairMultiple(fromCurrency, newList);
    }, [toCurrencies, fromCurrency, setPairMultiple]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null) {
            setDragOverIndex(null);
            return;
        }
        if (draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }
        if (draggedIndex === DRAG_INDEX_BASE) {
            swapBaseWithTarget(dropIndex);
        } else {
            applyReorder(draggedIndex, dropIndex);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDropBase = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedIndex === null) {
            setDragOverIndex(null);
            return;
        }
        if (draggedIndex === DRAG_INDEX_BASE) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }
        swapBaseWithTarget(draggedIndex);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, []);

    // Touch drag for mobile (native DnD doesn't work on touch). Handle: drag on move. Row (long-press): drag after ~400ms hold.
    const TOUCH_DRAG_THRESHOLD_PX = 10;
    const LONG_PRESS_MS = 400;
    const handleTouchStart = useCallback((e: React.TouchEvent, index: number, fromRow = false) => {
        if (touchDragRef.current) return;
        if (fromRow) {
            const target = e.target as HTMLElement;
            if (target.closest?.('input') || target.closest?.('button')) return;
        }
        const touch = e.changedTouches[0];
        touchDragRef.current = {
            startIndex: index,
            touchId: touch.identifier,
            startY: touch.clientY,
            activated: false,
            longPressRequired: fromRow,
            longPressTimerId: fromRow ? undefined : undefined
        };

        const getTouch = (ev: TouchEvent) => {
            for (let i = 0; i < ev.changedTouches.length; i++) {
                if (ev.changedTouches[i].identifier === touchDragRef.current?.touchId) return ev.changedTouches[i];
            }
            for (let i = 0; i < ev.touches.length; i++) {
                if (ev.touches[i].identifier === touchDragRef.current?.touchId) return ev.touches[i];
            }
            return null;
        };

        const cleanup = () => {
            const t = touchDragRef.current;
            if (t?.longPressTimerId) clearTimeout(t.longPressTimerId);
            touchDragRef.current = null;
            document.removeEventListener('touchmove', onTouchMove as (ev: Event) => void, { passive: false } as EventListenerOptions);
            document.removeEventListener('touchend', onTouchEnd as (ev: Event) => void, { capture: true });
            document.removeEventListener('touchcancel', onTouchEnd as (ev: Event) => void, { capture: true });
        };

        if (fromRow) {
            touchDragRef.current.longPressTimerId = setTimeout(() => {
                const t = touchDragRef.current;
                if (!t || t.activated) return;
                t.activated = true;
                t.longPressTimerId = undefined;
                setOpenCardIndex(null);
                setAddCurrencyOpen(false);
                setDraggedIndex(t.startIndex);
            }, LONG_PRESS_MS);
        }

        const onTouchMove = (ev: TouchEvent) => {
            const t = touchDragRef.current;
            if (!t) return;
            const touch = getTouch(ev);
            if (!touch) return;
            const dy = Math.abs(touch.clientY - t.startY);
            if (!t.activated) {
                if (t.longPressRequired) {
                    if (dy > TOUCH_DRAG_THRESHOLD_PX) {
                        cleanup();
                        return;
                    }
                    return;
                }
                if (dy > TOUCH_DRAG_THRESHOLD_PX) {
                    t.activated = true;
                    setOpenCardIndex(null);
                    setAddCurrencyOpen(false);
                    setDraggedIndex(t.startIndex);
                }
            }
            if (t.activated) {
                ev.preventDefault();
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                const row = el?.closest?.('[data-drag-index]');
                const idxStr = row?.getAttribute('data-drag-index') ?? null;
                if (idxStr != null) {
                    const idx = parseInt(idxStr, 10);
                    if (!Number.isNaN(idx)) setDragOverIndex(idx);
                }
            }
        };

        const onTouchEnd = (ev: TouchEvent) => {
            const t = touchDragRef.current;
            if (!t || getTouch(ev) === null) return;
            if (t.activated) {
                const dropIdx = dragOverIndexRef.current;
                if (dropIdx !== null && dropIdx !== t.startIndex) {
                    if (t.startIndex === DRAG_INDEX_BASE && dropIdx >= 0) {
                        swapBaseWithTarget(dropIdx);
                    } else if (t.startIndex >= 0 && dropIdx === DRAG_INDEX_BASE) {
                        swapBaseWithTarget(t.startIndex);
                    } else if (t.startIndex >= 0 && dropIdx >= 0) {
                        applyReorder(t.startIndex, dropIdx);
                    }
                    justDidDragRef.current = true;
                    setTimeout(() => { justDidDragRef.current = false; }, 300);
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
            }
            cleanup();
        };

        document.addEventListener('touchmove', onTouchMove as (ev: Event) => void, { passive: false } as AddEventListenerOptions);
        document.addEventListener('touchend', onTouchEnd as (ev: Event) => void, { capture: true });
        document.addEventListener('touchcancel', onTouchEnd as (ev: Event) => void, { capture: true });
    }, [applyReorder, swapBaseWithTarget]);

    // Reset drag state when any drag ends (e.g. drop outside list) — standard DnD pattern
    useEffect(() => {
        const onDocumentDragEnd = () => {
            setDraggedIndex(null);
            setDragOverIndex(null);
        };
        document.addEventListener('dragend', onDocumentDragEnd);
        return () => document.removeEventListener('dragend', onDocumentDragEnd);
    }, []);

    const isBaseRowDragging = draggedIndex === DRAG_INDEX_BASE;
    const isDragOverBaseRow = dragOverIndex === DRAG_INDEX_BASE;

    const baseDragHandle = (
        <div
            draggable
            onDragStart={handleDragStartBase}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, DRAG_INDEX_BASE)}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-flare-primary transition-colors p-0 sm:p-1 touch-none"
            aria-label="Drag to reorder"
        >
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
            </svg>
        </div>
    );

    const baseRowContainerProps = {
        "data-drag-index": DRAG_INDEX_BASE,
        onDragOver: handleDragOverBase,
        onDragLeave: handleDragLeaveBase,
        onDrop: handleDropBase,
        onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => handleTouchStart(e, DRAG_INDEX_BASE, true),
        onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => e.preventDefault(),
    } as React.HTMLAttributes<HTMLDivElement>;

    // Currency modals (base, add, list row) close via CurrencySelectModal backdrop/X only — no document click-outside, so clicks inside the modal don't close it

    return (
        <>
            <div className="currency-input-group flex flex-col w-full min-w-0 max-w-full">
                {/* Base row: same wrapper as list rows so USD and DOP have identical context and width */}
                <div className="currency-list-scroll currency-base-container w-full max-w-full min-w-0">
                    <CurrencyInput
                        hideAmount={variant === "chart"}
                        value={usdInputRaw !== null ? usdInputRaw : fromAmountDisplay}
                        onChange={(value) => {
                            const sanitized = sanitizeInputValue(value);
                            setUsdInputRaw(sanitized);
                            setBaseFromAmount(parseFloat(sanitized.replace(/,/g, '')) || 0, fromCurrency);
                            debouncedFromConversion();
                        }}
                        onFocus={() => setUsdInputRaw(usdInputRaw ?? fromAmountDisplay)}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            const v = e.target.value.replace(/,/g, '');
                            const num = parseFloat(v);
                            setUsdInputRaw(null);
                            if (v === '' || Number.isNaN(num) || num < 0) {
                                setBaseFromAmount(1, fromCurrency);
                            } else {
                                setBaseFromAmount(num, fromCurrency);
                            }
                        }}
                        placeholder={t.enterAmount}
                        currency={fromCurrency}
                        onCurrencyChange={handleFromCurrencyChange}
                        availableCurrencies={getAvailableCurrencies(toCurrency, fromCurrency)}
                        isDropdownOpen={fromDropdownOpen}
                        onDropdownToggle={() => { setFromDropdownOpen(!fromDropdownOpen); setAddCurrencyOpen(false); }}
                        onKeyDown={handleAmountKeyDown}
                        onClick={(e) => e.currentTarget.select()}
                        currencyNames={t.currencyNames}
                        ariaLabel={t.fromCurrency}
                        inputRef={fromAmountRef}
                        dropdownRef={fromDropdownRef}
                        isLoadingCurrencies={isLoadingCurrencies}
                        t={{ searchCurrency: t.searchCurrency, noCurrenciesFound: t.noCurrenciesFound, removeCurrency: t.removeCurrency }}
                        leftSlot={baseDragHandle}
                        rowClassName={`select-none ${isBaseRowDragging ? 'opacity-50' : ''} ${isDragOverBaseRow ? '!border-indigo-500 dark:!border-indigo-400 shadow-md' : ''}`.trim()}
                        rowContainerProps={baseRowContainerProps}
                    />
                </div>

                {/* "+" button — same surface/hover/border as currency rows; 44px mobile / 48px desktop touch target */}
                <div className="w-full flex justify-center py-4 sm:py-5 mt-3 sm:mt-4">
                    <div className="relative inline-flex" ref={addCurrencyDropdownRef}>
                        <button
                            type="button"
                            disabled={atTargetLimit}
                            onClick={() => {
                                if (atTargetLimit) return;
                                setOpenCardIndex(null);
                                setAddCurrencyOpen(true);
                            }}
                            aria-label={atTargetLimit ? t.addCurrencyMaxReached : t.addCurrency}
                            title={atTargetLimit ? t.addCurrencyMaxReached : t.addCurrency}
                            className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-gray-200/60 dark:border-slate-600/50 bg-gray-50 dark:bg-gray-700 text-flare-primary transition-[background-color,border-color,transform,box-shadow] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-flare-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800 touch-manipulation p-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer hover:bg-gray-100/95 dark:hover:bg-gray-600/90 hover:border-gray-300/80 dark:hover:border-slate-500/70 active:scale-[0.97] hover:shadow disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-700 disabled:active:scale-100 disabled:hover:shadow-none"
                        >
                            <Plus className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={2.5} aria-hidden />
                        </button>
                        <CurrencySelectModal
                            isOpen={addCurrencyOpen}
                            onClose={() => setAddCurrencyOpen(false)}
                            currencies={currenciesToAdd}
                            currencyNames={t.currencyNames}
                            selectedCode=""
                            onSelect={(code) => {
                                addToCurrency(code);
                                setAddCurrencyOpen(false);
                            }}
                            title={t.addCurrency}
                            searchPlaceholder={t.searchCurrency}
                            noResultsText={t.noCurrenciesFound}
                        />
                    </div>
                </div>

                {/* List: same horizontal space as arriba; compact spacing like USD row */}
                <div className="mt-2.5 sm:mt-4 w-full max-w-full min-w-0">
                    {/* sm+: 3+ targets — cap = same row rhythm as 4-row mode: 21.5rem fit ~4 rows+3 gaps → 2 rows+1 gap ≈ 10.44rem (no 3rd-row peek) */}
                    <div
                        className={`currency-list-scroll space-y-1.5 sm:space-y-2.5 w-full max-w-full min-w-0 min-h-0 max-h-[10rem] ${toCurrencies.length > 2 ? "sm:max-h-[10.4375rem]" : "sm:max-h-[21.5rem]"} ${openCardIndex !== null ? "overflow-visible card-dropdown-open" : "overflow-y-auto overflow-x-hidden"}`}
                    >
                    {toCurrencies.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">{t.addCurrency}</p>
                    ) : (
                        toCurrencies.map((code, index) => {
                            const info = currencies.find((c) => c.code === code);
                            const value = getCardConvertedValue(code);
                            const displayValue = formatCurrencyValue(value.toFixed(2));
                            const isDragging = draggedIndex === index;
                            const isDragOver = dragOverIndex === index;
                            const leftSlot = (
                                        <div
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onTouchStart={(e) => handleTouchStart(e, index)}
                                            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-flare-primary transition-colors p-0 sm:p-1 touch-none"
                                            aria-label="Drag to reorder"
                                        >
                                            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                                                <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
                                            </svg>
                                        </div>
                                    );
                            const rightSlot = variant === "chart" ? (
                                <CurrencyRowValueSlot
                                    hideAmount
                                    value=""
                                    onChange={() => {}}
                                    ariaLabel={`${code} ${t.toCurrency}`}
                                    deleteDisabled={toCurrencies.length === 1}
                                    onDelete={() => removeToCurrency(code)}
                                    removeAriaLabel={`${t.removeCurrency} ${code}`}
                                />
                            ) : (
                                <CurrencyRowValueSlot
                                    value={cardInputRaw?.code === code ? cardInputRaw.value : displayValue}
                                    onChange={(next) => {
                                        setCardInputRaw({ code, value: next });
                                        setBaseFromAmount(parseFloat(next.replace(/,/g, '')), code);
                                    }}
                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                        e.currentTarget.select();
                                        setCardInputRaw({ code, value: displayValue });
                                    }}
                                    onBlur={(e) => {
                                        const v = e.target.value.replace(/,/g, '');
                                        const num = parseFloat(v);
                                        setCardInputRaw(null);
                                        if (Number.isNaN(num) || num < 0) {
                                            setBaseFromAmount(1, fromCurrency);
                                        } else {
                                            setBaseFromAmount(num, code);
                                        }
                                    }}
                                    onClick={(e) => e.currentTarget.select()}
                                    onKeyDown={handleAmountKeyDown}
                                    ariaLabel={`${code} ${t.toCurrency}`}
                                    inputMode="decimal"
                                    deleteDisabled={toCurrencies.length === 1}
                                    onDelete={() => removeToCurrency(code)}
                                    removeAriaLabel={`${t.removeCurrency} ${code}`}
                                />
                            );
                            return (
                                <CurrencyRow
                                    key={code}
                                    left={leftSlot}
                                    right={rightSlot}
                                    className={`select-none ${openCardIndex === index ? 'overflow-visible card-row-dropdown-open' : ''} ${isDragging ? 'opacity-50' : ''} ${isDragOver ? '!border-indigo-500 dark:!border-indigo-400 shadow-md' : ''}`}
                                    containerProps={
                                        {
                                            'data-drag-index': index,
                                            onDragOver: (e) => handleDragOver(e, index),
                                            onDragLeave: handleDragLeave,
                                            onDrop: (e) => handleDrop(e, index),
                                            onTouchStart: (e) => handleTouchStart(e, index, true),
                                            onContextMenu: (e) => e.preventDefault()
                                        } as React.HTMLAttributes<HTMLDivElement>
                                    }
                                >
                                    <CurrencyRowSelector
                                        flag={info?.flag}
                                        code={code}
                                        symbol={info?.symbol ?? code}
                                        name={t.currencyNames[code as keyof typeof t.currencyNames] || info?.name || code}
                                        isOpen={openCardIndex === index}
                                        onToggle={() => {
                                            if (justDidDragRef.current) return;
                                            setAddCurrencyOpen(false);
                                            setOpenCardIndex(openCardIndex === index ? null : index);
                                        }}
                                        ariaLabel="Select currency"
                                    >
                                        {null}
                                    </CurrencyRowSelector>
                                </CurrencyRow>
                            );
                        })
                    )}
                    </div>
                </div>
            </div>

            <CurrencySelectModal
                isOpen={openCardIndex !== null}
                onClose={() => setOpenCardIndex(null)}
                currencies={cardSlotCurrencies}
                currencyNames={t.currencyNames}
                selectedCode={openCardIndex !== null ? (toCurrencies[openCardIndex] ?? '') : ''}
                onSelect={(code) => {
                    if (openCardIndex === null) return;
                    const selected = code.trim().toUpperCase();
                    const next = [...toCurrencies];
                    const i = openCardIndex;
                    const j = next.findIndex(
                        (c, idx) => c.trim().toUpperCase() === selected && idx !== i
                    );
                    /** Choosing a currency already on another row: swap rows (avoid duplicate keys / blocked “+” list). */
                    if (j >= 0) {
                        const tmp = next[i];
                        next[i] = next[j]!;
                        next[j] = tmp!;
                    } else {
                        next[i] = selected;
                    }
                    setPairMultiple(fromCurrency, next);
                    setOpenCardIndex(null);
                }}
                searchPlaceholder={t.searchCurrency}
                noResultsText={t.noCurrenciesFound}
            />

        </>
    );

}
