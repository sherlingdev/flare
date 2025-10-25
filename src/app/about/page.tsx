"use client";

import React, { useEffect, useLayoutEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export default function AboutUs() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];

    // Update page title dynamically - useLayoutEffect to prevent static title flash
    useLayoutEffect(() => {
        document.title = t.aboutTitle;
    }, [t.aboutTitle]);

    // Scroll to top on mount and prevent scroll restoration
    useEffect(() => {
        // Force scroll to top immediately
        window.scrollTo(0, 0);

        // Disable scroll restoration temporarily
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // Additional scroll to top after a brief delay to override any restoration
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);

        // Force scroll again after a longer delay to ensure it sticks
        const timer2 = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
            // Re-enable scroll restoration when component unmounts
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        };
    }, []);

    return (
        <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-16 pb-16">
            <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full max-w-6xl">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 lg:px-10 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50">
                        <h1 className="text-2xl sm:text-3xl font-bold text-flare-primary mb-4 text-center">
                            {t.aboutUs}
                        </h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-base">
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.ourMission}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.ourMissionText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.whatWeOffer}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-flare-primary mb-3">
                                            {t.realTimeExchangeRatesTitle}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-base">
                                            {t.realTimeExchangeRatesText}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-flare-primary mb-3">
                                            {t.multiLanguageSupport}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-base">
                                            {t.multiLanguageSupportText}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-flare-primary mb-3">
                                            {t.responsiveDesignTitle}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-base">
                                            {t.responsiveDesignText}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-flare-primary mb-3">
                                            {t.darkModeSupport}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-base">
                                            {t.darkModeSupportText}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.ourTechnology}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.ourTechnologyText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li><strong>Next.js:</strong> {t.nextjsDescription}</li>
                                    <li><strong>React:</strong> {t.reactDescription}</li>
                                    <li><strong>TypeScript:</strong> {t.typescriptDescription}</li>
                                    <li><strong>Tailwind CSS:</strong> {t.tailwindDescription}</li>
                                    <li><strong>{t.realTimeApis}:</strong> {t.realTimeApisDescription}</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.privacySecurity}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.privacySecurityText}
                                </p>
                            </section>



                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.futurePlans}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.futurePlansText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.additionalCurrencies}</li>
                                    <li>{t.historicalCharts}</li>
                                    <li>{t.currencyAlerts}</li>
                                    <li>{t.mobileApp}</li>
                                    <li>{t.enhancedAnalytics}</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.contactUs}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.contactAboutText} <a href={`mailto:${t.contactEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{t.contactEmail}</a>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
