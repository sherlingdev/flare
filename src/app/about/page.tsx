"use client";

import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../lib/translations";



export default function AboutUs() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <main className="relative z-10 w-full px-8 sm:px-10 lg:px-12 pt-16 pb-16">
            <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full max-w-7xl">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 lg:px-10 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 text-center">
                            {t.aboutUs}
                        </h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-base">
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.ourMission}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.ourMissionText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.whatWeOffer}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                                            {t.realTimeExchangeRatesTitle}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-base">
                                            {t.realTimeExchangeRatesText}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                                            {t.multiLanguageSupport}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-base">
                                            {t.multiLanguageSupportText}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                                            {t.responsiveDesignTitle}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-base">
                                            {t.responsiveDesignText}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                                            {t.darkModeSupport}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-base">
                                            {t.darkModeSupportText}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.ourTechnology}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.ourTechnologyText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li><strong>Next.js:</strong> Para aplicaciones web rápidas con renderizado del lado del servidor</li>
                                    <li><strong>React:</strong> Para interfaces de usuario responsivas e interactivas</li>
                                    <li><strong>TypeScript:</strong> Para código seguro en tipos y mantenible</li>
                                    <li><strong>Tailwind CSS:</strong> Para diseños hermosos y responsivos</li>
                                    <li><strong>APIs en tiempo real:</strong> Para tipos de cambio precisos y actualizados</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.privacySecurity}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.privacySecurityText}
                                </p>
                            </section>



                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
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
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.contactUs}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.contactAboutText} <a href={`mailto:${t.contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{t.contactEmail}</a>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
