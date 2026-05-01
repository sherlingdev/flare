"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
    BASE_CURRENCY_STORAGE_KEY,
    type ProfileSupabaseClient,
    readStoredBaseCurrencyCode,
    syncProfileBaseCurrencyOnLogin,
    upsertProfileBaseCurrency,
} from "@/lib/profileBaseCurrency";
import { MAX_TARGET_CURRENCIES } from "@/lib/converterLimits";

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

/** First occurrence wins; drops duplicate codes (e.g. bad setPairMultiple state). */
function dedupeTargetCurrencies(codes: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of codes) {
        const n = normalizeCode(raw);
        if (!n || seen.has(n)) continue;
        seen.add(n);
        out.push(n);
    }
    if (out.length === 0) return [...DEFAULT_TO_CURRENCIES];
    return out.slice(0, MAX_TARGET_CURRENCIES);
}

function persistBaseCurrency(code: string) {
    try {
        localStorage.setItem(BASE_CURRENCY_STORAGE_KEY, code);
    } catch {
        /* ignore */
    }
}

function persistBaseToServer(userId: string, code: string) {
    const supabase = createClient() as ProfileSupabaseClient;
    void upsertProfileBaseCurrency(supabase, userId, code);
}

export function ConverterProvider({ children }: { children: React.ReactNode }) {
    const [fromCurrency, setFromCurrencyState] = useState("USD");
    const [toCurrencies, setToCurrenciesState] = useState<string[]>(DEFAULT_TO_CURRENCIES);

    const sessionUserIdRef = useRef<string | null>(null);

    const toCurrency = toCurrencies[0] ?? "DOP";

    const applyFromServer = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (!normalized) return;
        setFromCurrencyState(normalized);
        persistBaseCurrency(normalized);
    }, []);

    useEffect(() => {
        const code = readStoredBaseCurrencyCode();
        setFromCurrencyState(code);
    }, []);

    useEffect(() => {
        const supabase = createClient();

        const setSessionRef = (session: Session | null) => {
            sessionUserIdRef.current = session?.user?.id ?? null;
        };

        void supabase.auth.getSession().then(({ data: { session } }) => {
            setSessionRef(session);
            const uid = session?.user?.id;
            if (uid) {
                void syncProfileBaseCurrencyOnLogin(
                    supabase as ProfileSupabaseClient,
                    uid,
                    applyFromServer
                );
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT") {
                sessionUserIdRef.current = null;
                return;
            }
            if (event === "SIGNED_IN") {
                setSessionRef(session);
                const uid = session?.user?.id;
                if (uid) {
                    void syncProfileBaseCurrencyOnLogin(
                        supabase as ProfileSupabaseClient,
                        uid,
                        applyFromServer
                    );
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [applyFromServer]);

    const setFromCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) {
            setFromCurrencyState(normalized);
            persistBaseCurrency(normalized);
            const uid = sessionUserIdRef.current;
            if (uid) persistBaseToServer(uid, normalized);
        }
    }, []);

    const setToCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) {
            setToCurrenciesState((prev) => {
                if (prev.includes(normalized)) return prev;
                if (prev.length >= MAX_TARGET_CURRENCIES) return prev;
                return [normalized, ...prev];
            });
        }
    }, []);

    /** New targets prepended so the row you just added is visible without scrolling (common converter UX). */
    const addToCurrency = useCallback((code: string) => {
        const normalized = normalizeCode(code);
        if (normalized) {
            setToCurrenciesState((prev) => {
                if (prev.includes(normalized)) return prev;
                if (prev.length >= MAX_TARGET_CURRENCIES) return prev;
                return [normalized, ...prev];
            });
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
        if (nFrom) {
            setFromCurrencyState(nFrom);
            persistBaseCurrency(nFrom);
            const uid = sessionUserIdRef.current;
            if (uid) persistBaseToServer(uid, nFrom);
        }
        if (nTo) setToCurrenciesState([nTo]);
    }, []);

    const setPairMultiple = useCallback((from: string, toList: string[]) => {
        const nFrom = normalizeCode(from);
        const list = dedupeTargetCurrencies(toList.map(normalizeCode).filter(Boolean));
        if (nFrom) {
            setFromCurrencyState(nFrom);
            persistBaseCurrency(nFrom);
            const uid = sessionUserIdRef.current;
            if (uid) persistBaseToServer(uid, nFrom);
        }
        setToCurrenciesState(list);
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
