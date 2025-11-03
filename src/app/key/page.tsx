"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import ApiKey from "@/components/ApiKey";
import CurrencyCard from "@/components/CurrencyCard";

export default function KeyPage() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : 'en'] as typeof translations['en'];
    return (
        <main className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 homepage-vertical-center">
            <div className="w-full max-w-6xl mb-6">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-flare-primary mb-4">
                        {t.apiKey}
                    </h1>
                    <p className="text-base sm:text-xl text-flare-primary max-w-2xl mx-auto">
                        {t.apiKeySubtitle}
                    </p>
                </div>
            </div>
            <div className="w-full max-w-6xl flex flex-col items-center justify-center gap-6">
                <div className="w-full max-w-none">
                    <CurrencyCard>
                        <ApiKey />
                    </CurrencyCard>
                </div>
            </div>
        </main>
    );
}


