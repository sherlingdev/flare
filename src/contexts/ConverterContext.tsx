"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const DEFAULT_TO_CURRENCIES = ["DOP"];

interface ConverterContextType {
    fromCurrency: string;
    toCurrency: string;
    toCurrencies: string[];
    setFromCurrency: (code: string) => void;
    setToCurrency: (code: string) => void;
    addToCurrency: (code: string) => void;
    removeToCurrency: (code: string) => void;
    moveToCurrencyUp: (code: string) => void;
    moveToCurrencyDown: (code: string) => void;
    setPair: (from: string, to: string) => void;
    setPairMultiple: (from: string, toList: string[]) => void;
}

const ConverterContext = createContext<ConverterContextType | undefined>(undefined);

const normalizeCode = (code: string) => code?.trim().toUpperCase() || "";

export function ConverterProvider({ children }: { children: React.ReactNode }) {
    const [fromCurrency, setFromCurrencyState] = useState("USD");
    const [toCurrencies, setToCurrenciesState] = useState<string[]>(DEFAULT_TO_CURRENCIES);

    const toCurrency = toCurrencies[0] ?? "DOP";

    const setFromCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) setFromCurrencyState(normalized);
    }, []);

    const setToCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) {
            setToCurrenciesState((prev) =>
                prev.includes(normalized) ? prev : [normalized, ...prev]
            );
        }
    }, []);

    const addToCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) {
            setToCurrenciesState((prev) =>
                prev.includes(normalized) ? prev : [...prev, normalized]
            );
        }
    }, []);

    const removeToCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) {
            setToCurrenciesState((prev) => prev.filter((c) => c !== normalized));
        }
    }, []);

    const moveToCurrencyUp = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (!normalized) return;
        setToCurrenciesState((prev) => {
            const i = prev.indexOf(normalized);
            if (i <= 0) return prev;
            const next = [...prev];
            [next[i - 1], next[i]] = [next[i], next[i - 1]];
            return next;
        });
    }, []);

    const moveToCurrencyDown = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (!normalized) return;
        setToCurrenciesState((prev) => {
            const i = prev.indexOf(normalized);
            if (i < 0 || i >= prev.length - 1) return prev;
            const next = [...prev];
            [next[i], next[i + 1]] = [next[i + 1], next[i]];
            return next;
        });
    }, []);

    const setPair = useCallback((from: string, to: string) => {
        const nFrom = normalizeCode(from);
        const nTo = normalizeCode(to);
        if (nFrom) setFromCurrencyState(nFrom);
        if (nTo) setToCurrenciesState([nTo]);
    }, []);

    const setPairMultiple = useCallback((from: string, toList: string[]) => {
        const nFrom = normalizeCode(from);
        const list = toList.map(normalizeCode).filter(Boolean);
        if (nFrom) setFromCurrencyState(nFrom);
        if (list.length > 0) setToCurrenciesState(list);
    }, []);

    const value = useMemo(
        () => ({
            fromCurrency,
            toCurrency,
            toCurrencies,
            setFromCurrency,
            setToCurrency,
            addToCurrency,
            removeToCurrency,
            moveToCurrencyUp,
            moveToCurrencyDown,
            setPair,
            setPairMultiple,
        }),
        [
            fromCurrency,
            toCurrency,
            toCurrencies,
            setFromCurrency,
            setToCurrency,
            addToCurrency,
            removeToCurrency,
            moveToCurrencyUp,
            moveToCurrencyDown,
            setPair,
            setPairMultiple,
        ]
    );

    return (
        <ConverterContext.Provider value={value}>
            {children}
        </ConverterContext.Provider>
    );
}

export function useConverter() {
    const context = useContext(ConverterContext);
    if (!context) {
        throw new Error("useConverter must be used within a ConverterProvider");
    }
    return context;
}
