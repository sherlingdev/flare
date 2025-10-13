"use client";

import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../lib/translations";



export default function TermsOfService() {
    const { language } = useLanguage();
    const t = translations[language];


    return (
        <main className="relative z-10 w-full px-8 sm:px-10 lg:px-12 pt-16 pb-16">
            <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full max-w-7xl">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 lg:px-10 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 text-center">
                            {t.termsOfService}
                        </h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-base">

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.acceptanceOfTerms}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.acceptanceOfTermsText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
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
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
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
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
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
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.limitations}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.limitationsText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.accuracyOfMaterials}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.accuracyOfMaterialsText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.links}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.linksText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.modifications}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.modificationsText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.governingLaw}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.governingLawText}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
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
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {t.contactUs}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-base">
                                    {t.contactTermsText} <a href={`mailto:${t.contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{t.contactEmail}</a>
                                </p>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
