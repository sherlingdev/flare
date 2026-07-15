"use client";

import React, { useMemo, useRef, useState } from "react";
import { Globe } from "lucide-react";
import type { Language } from "@/contexts/LanguageContext";
import CurrencyRow from "./CurrencyRow";
import CurrencyRowSelector from "./CurrencyRowSelector";
import LanguageSelectModal from "./LanguageSelectModal";

const LANG_ORDER: Language[] = ["en", "es", "pt", "fr", "de", "sv", "it", "zh"];

const LANGUAGE_OPTIONS: { code: Language; name: string }[] = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "pt", name: "Português" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "sv", name: "Svenska" },
    { code: "it", name: "Italiano" },
    { code: "zh", name: "中文 (简体)" },
];

export interface SettingsLanguagePickerProps {
    language: Language;
    onSelect: (code: Language) => void;
    modalTitle: string;
    ariaLabel: string;
}

/**
 * Same row + modal pattern as InformationCurrencyPicker / base currency in settings.
 */
export default function SettingsLanguagePicker({
    language,
    onSelect,
    modalTitle,
    ariaLabel,
}: SettingsLanguagePickerProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const ordered = useMemo(
        () =>
            LANG_ORDER.map((code) => {
                const row = LANGUAGE_OPTIONS.find((l) => l.code === code);
                if (!row) throw new Error(`Missing language: ${code}`);
                return row;
            }),
        []
    );

    const current = LANGUAGE_OPTIONS.find((l) => l.code === language) ?? LANGUAGE_OPTIONS[0];
    const headline = current.name;
    const subline = current.code.toUpperCase();

    const rowEmbeddedClass =
        "currency-base-row w-full max-w-full !border-0 !bg-transparent !shadow-none hover:!bg-transparent dark:hover:!bg-transparent hover:!border-transparent !px-0 !py-0 [&>div:first-child]:w-full [&>div:first-child]:min-w-0 [&>div:first-child]:items-stretch";

    const globeLeading = <Globe className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />;

    return (
        <>
            <div className="w-full">
                <CurrencyRow noScroll className={rowEmbeddedClass}>
                    <CurrencyRowSelector
                        variant="embedded"
                        leading={globeLeading}
                        headline={headline}
                        subline={subline}
                        flag={undefined}
                        code={language}
                        symbol=""
                        name=""
                        isOpen={modalOpen}
                        onToggle={() => setModalOpen((o) => !o)}
                        ariaLabel={ariaLabel}
                        dropdownRef={dropdownRef}
                    >
                        {null}
                    </CurrencyRowSelector>
                </CurrencyRow>
            </div>

            <LanguageSelectModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                languages={ordered}
                selectedCode={language}
                onSelect={(code) => onSelect(code as Language)}
                title={modalTitle}
            />
        </>
    );
}
