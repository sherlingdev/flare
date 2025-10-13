"use client";

import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../lib/translations";



export default function PrivacyPolicy() {
    const { language } = useLanguage();
    const t = translations[language];


    return (
        <main className="relative z-10 w-full px-8 sm:px-10 lg:px-12 pt-16 pb-16">
            <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full max-w-7xl">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 lg:px-10 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 text-center">
                            {t.privacyPolicy}
                        </h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-base">

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.informationWeCollect}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.informationWeCollectText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.calculationRequests}</li>
                                    <li>{t.ipAddress}</li>
                                    <li>{t.usagePatterns}</li>
                                    <li>{t.deviceInformation}</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.howWeUse}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.howWeUseText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.provideCalculations}</li>
                                    <li>{t.improveApplication}</li>
                                    <li>{t.analyzeUsage}</li>
                                    <li>{t.displayAds}</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.googleAdsense}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.googleAdsenseText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.useCookies}</li>
                                    <li>{t.collectBrowsing}</li>
                                    <li>{t.displayPersonalized}</li>
                                    <li>{t.useWebBeacons}</li>
                                </ul>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.optOutText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.cookiesTracking}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.cookiesTrackingText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.rememberTheme}</li>
                                    <li>{t.rememberLanguage}</li>
                                    <li>{t.provideAnalytics}</li>
                                    <li>{t.enableAdvertising}</li>
                                </ul>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.controlCookiesText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.dataSecurity}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.dataSecurityText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.dataRetention}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.dataRetentionText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.yourRights}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.yourRightsText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.accessInformation}</li>
                                    <li>{t.correctInformation}</li>
                                    <li>{t.requestDeletion}</li>
                                    <li>{t.optOutProcessing}</li>
                                    <li>{t.withdrawConsent}</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.childrenPrivacy}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.childrenPrivacyText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.changesPrivacy}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.changesPrivacyText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.contactUs}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.contactPrivacyText} <a href={`mailto:${t.contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{t.contactEmail}</a>
                                </p>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
