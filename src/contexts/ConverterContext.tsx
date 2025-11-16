"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ConverterContextType {
    fromCurrency: string;
    toCurrency: string;
    setFromCurrency: (code: string) => void;
    setToCurrency: (code: string) => void;
    setPair: (from: string, to: string) => void;
}

const ConverterContext = createContext<ConverterContextType | undefined>(undefined);

const normalizeCode = (code: string) => code?.trim().toUpperCase() || "";

export function ConverterProvider({ children }: { children: React.ReactNode }) {
    const [fromCurrency, setFromCurrencyState] = useState("USD");
    const [toCurrency, setToCurrencyState] = useState("DOP");

    const setFromCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) {
            setFromCurrencyState(normalized);
        }
    }, []);

    const setToCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) {
            setToCurrencyState(normalized);
        }
    }, []);

    const setPair = useCallback((from: string, to: string) => {
        const normalizedFrom = normalizeCode(from);
        const normalizedTo = normalizeCode(to);
        if (normalizedFrom) {
            setFromCurrencyState(normalizedFrom);
        }
        if (normalizedTo) {
            setToCurrencyState(normalizedTo);
        }
    }, []);

    const value = useMemo(() => ({
        fromCurrency,
        toCurrency,
        setFromCurrency,
        setToCurrency,
        setPair
    }), [fromCurrency, toCurrency, setFromCurrency, setToCurrency, setPair]);

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


