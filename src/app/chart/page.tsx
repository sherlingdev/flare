"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { createClient } from "@/utils/supabase/client";
import { useAuthModal } from "@/contexts/AuthModalContext";
import CurrencyCard from "@/components/CurrencyCard";
import CurrencyPairSelector from "@/components/CurrencyPairSelector";
import HistoricalChart from "@/components/HistoricalChart";
import Loader from "@/components/Loader";

export default function ChartPage() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];
    const { openModal } = useAuthModal();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Open auth modal instead of redirecting
                openModal();
                setIsAuthenticated(false);
                return;
            }

            setIsAuthenticated(true);
        };

        if (mounted) {
            checkAuth();
        }

        // Listen for auth state changes
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [mounted, openModal]);

    if (!mounted || isAuthenticated === null) {
        return <Loader show={true} />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <main className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-16">
            {/* Header */}
            <div className="w-full max-w-6xl mb-6">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-flare-primary mb-4">
                        {t.chartTitle}
                    </h1>
                    <p className="text-base sm:text-xl text-flare-primary max-w-2xl mx-auto">
                        {t.chartSubtitle}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-6xl flex flex-col items-center justify-center gap-6">
                {/* Currency Pair Selector */}
                <div className="w-full max-w-none relative z-[200]">
                    <CurrencyCard>
                        <CurrencyPairSelector />
                    </CurrencyCard>
                </div>

                {/* Historical Chart */}
                <div className="w-full max-w-none relative z-[1]">
                    <CurrencyCard>
                        <HistoricalChart />
                    </CurrencyCard>
                </div>
            </div>
        </main>
    );
}

