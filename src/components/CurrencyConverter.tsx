"use client";

import React, { useEffect } from "react";
import { useConverter } from "@/contexts/ConverterContext";
import LastUpdated from "./LastUpdated";
import MultiCurrencyPairPanel from "./MultiCurrencyPairPanel";
import { useRouter } from "next/navigation";
import { useCurrencyPayload } from "@/hooks/useCurrencyPayload";

export default function CurrencyConverter() {
    const { fromCurrency, setFromCurrency: setContextFromCurrency, setPair } = useConverter();
    const router = useRouter();
    const { currencyRates, currencies, isLoadingCurrencies } = useCurrencyPayload();

    useEffect(() => {
        if (isLoadingCurrencies || typeof window === "undefined") {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const from = params.get("from");
        const to = params.get("to");
        let updated = false;
        const fromCode = from?.toUpperCase();
        const toCode = to?.toUpperCase();

        if (fromCode && currencies.some((c) => c.code === fromCode)) {
            if (toCode && currencies.some((c) => c.code === toCode)) {
                setPair(fromCode, toCode);
            } else {
                setContextFromCurrency(fromCode);
            }
            updated = true;
        } else if (toCode && currencies.some((c) => c.code === toCode)) {
            setPair(fromCurrency, toCode);
            updated = true;
        }

        if (updated && window.location.search) {
            router.replace(window.location.pathname, { scroll: false });
        }
    }, [currencies, isLoadingCurrencies, router, fromCurrency, setContextFromCurrency, setPair]);

    return (
        <>
            <MultiCurrencyPairPanel
                variant="converter"
                currencyRates={currencyRates}
                currencies={currencies}
                isLoadingCurrencies={isLoadingCurrencies}
            />
            <div className="mt-4 sm:mt-6">
                <LastUpdated />
            </div>
        </>
    );
}
