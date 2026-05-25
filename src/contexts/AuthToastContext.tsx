"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { consumePendingAuthToast } from "@/lib/authToastStorage";

export type AuthToastVariant = "signing-in" | "signed-in" | "signed-out";

interface AuthToastContextType {
    variant: AuthToastVariant | null;
    showSigningIn: () => void;
    showSignedIn: () => void;
    showSignedOut: () => void;
    dismiss: () => void;
}

const AuthToastContext = createContext<AuthToastContextType | undefined>(undefined);

const AUTO_DISMISS_MS: Record<Exclude<AuthToastVariant, "signing-in">, number> = {
    "signed-in": 4000,
    "signed-out": 5000,
};

export function AuthToastProvider({ children }: { children: ReactNode }) {
    const [variant, setVariant] = useState<AuthToastVariant | null>(null);
    const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearDismissTimer = useCallback(() => {
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
            dismissTimerRef.current = null;
        }
    }, []);

    const dismiss = useCallback(() => {
        clearDismissTimer();
        setVariant(null);
    }, [clearDismissTimer]);

    const show = useCallback(
        (next: AuthToastVariant) => {
            clearDismissTimer();
            setVariant(next);
            if (next !== "signing-in") {
                dismissTimerRef.current = setTimeout(() => {
                    setVariant(null);
                    dismissTimerRef.current = null;
                }, AUTO_DISMISS_MS[next]);
            }
        },
        [clearDismissTimer],
    );

    const showSigningIn = useCallback(() => show("signing-in"), [show]);
    const showSignedIn = useCallback(() => show("signed-in"), [show]);
    const showSignedOut = useCallback(() => show("signed-out"), [show]);

    useEffect(() => {
        const pending = consumePendingAuthToast();
        if (pending === "signed-in") showSignedIn();
        else if (pending === "signed-out") showSignedOut();
    }, [showSignedIn, showSignedOut]);

    useEffect(() => () => clearDismissTimer(), [clearDismissTimer]);

    return (
        <AuthToastContext.Provider
            value={{ variant, showSigningIn, showSignedIn, showSignedOut, dismiss }}
        >
            {children}
        </AuthToastContext.Provider>
    );
}

export function useAuthToast() {
    const context = useContext(AuthToastContext);
    if (context === undefined) {
        throw new Error("useAuthToast must be used within an AuthToastProvider");
    }
    return context;
}
