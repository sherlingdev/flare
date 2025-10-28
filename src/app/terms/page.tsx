"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export default function TermsOfService() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];

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
                            {t.termsOfService}
                        </h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-base">

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.acceptanceOfTerms}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.acceptanceOfTermsText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.descriptionOfService}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.descriptionOfServiceText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.realTimeExchangeRates}</li>
                                    <li>{t.calculationOperations}</li>
                                    <li>{t.responsiveDesign}</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.useLicense}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.useLicenseText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.modifyOrCopy}</li>
                                    <li>{t.commercialUse}</li>
                                    <li>{t.reverseEngineer}</li>
                                    <li>{t.removeCopyright}</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.disclaimer}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.disclaimerText1}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.disclaimerText2}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.limitations}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.limitationsText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.accuracyOfMaterials}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.accuracyOfMaterialsText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.links}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.linksText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.modifications}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.modificationsText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.governingLaw}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.governingLawText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.userConduct}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.userConductText}
                                </p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2 text-base">
                                    <li>{t.violateLaws}</li>
                                    <li>{t.unauthorizedAccess}</li>
                                    <li>{t.interfereService}</li>
                                    <li>{t.automatedAccess}</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-flare-primary mb-4">
                                    {t.contactUs}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.contactTermsText} <a href={`mailto:${t.contactEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{t.contactEmail}</a>
                                </p>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
