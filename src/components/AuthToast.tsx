"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthToast } from "@/contexts/AuthToastContext";
import { translations } from "@/lib/translations";

function AuthToastSpinner() {
    return (
        <span className="relative inline-flex h-5 w-5 shrink-0" aria-hidden>
            <span className="h-5 w-5 rounded-full border-2 border-slate-300/80 dark:border-slate-600" />
            <span className="absolute inset-0 h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin-smooth" />
        </span>
    );
}

function AuthToastSuccessIcon() {
    return (
        <span
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80 dark:ring-white/20"
            aria-hidden
        >
            <Check className="h-3 w-3" strokeWidth={2.75} />
        </span>
    );
}

export default function AuthToast() {
    const { mounted: langMounted, language } = useLanguage();
    const { variant, dismiss } = useAuthToast();
    const t = translations[langMounted ? language : "en"];
    const [portalReady, setPortalReady] = useState(false);

    useEffect(() => {
        setPortalReady(true);
    }, []);

    if (!variant || !portalReady) return null;

    const isSigningIn = variant === "signing-in";
    const isSuccess = variant === "signed-in" || variant === "signed-out";

    const message = isSigningIn
        ? t.authSigningIn
        : variant === "signed-in"
          ? t.authSignedIn
          : t.authSignedOut;

    const toast = (
        <div
            className="flare-auth-toast-anchor animate-slide-down"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="group relative pl-2.5 pt-2.5">
                {isSuccess && (
                    <button
                        type="button"
                        onClick={dismiss}
                        className="absolute left-0 top-0 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/80 bg-[#FFFFFFF2] text-slate-600 opacity-0 shadow-md pointer-events-none transition-opacity duration-150 hover:bg-white hover:text-slate-900 focus-visible:pointer-events-auto focus-visible:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-slate-600/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                        aria-label={t.authToastDismiss}
                    >
                        <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    </button>
                )}

                <div className="flex min-w-[14rem] items-center gap-3 rounded-lg border border-slate-200/60 bg-[#FFFFFFF2] px-4 py-3 shadow-lg backdrop-blur-sm dark:border-slate-700/50 dark:bg-[#1E293BF2]">
                    {isSigningIn ? <AuthToastSpinner /> : <AuthToastSuccessIcon />}
                    <p
                        className={`min-w-0 flex-1 text-sm leading-snug text-gray-900 dark:text-gray-100 ${
                            isSuccess ? "font-semibold" : "font-medium"
                        }`}
                    >
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );

    return createPortal(toast, document.body);
}
