"use client";

import React, { useMemo, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import CurrencyRow from "./CurrencyRow";
import CurrencyRowSelector from "./CurrencyRowSelector";
import LanguageSelectModal from "./LanguageSelectModal";

export type AppTheme = "light" | "dark";

export interface SettingsThemePickerProps {
    theme: AppTheme;
    onSelect: (theme: AppTheme) => void;
    optionLabels: { light: string; dark: string };
    modalTitle: string;
    ariaLabel: string;
}

const THEME_ORDER: AppTheme[] = ["light", "dark"];

/**
 * Same row + modal pattern as language / base currency in settings.
 */
export default function SettingsThemePicker({
    theme,
    onSelect,
    optionLabels,
    modalTitle,
    ariaLabel,
}: SettingsThemePickerProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const ordered = useMemo(
        () =>
            THEME_ORDER.map((code) => ({
                code,
                name: code === "light" ? optionLabels.light : optionLabels.dark,
            })),
        [optionLabels.dark, optionLabels.light]
    );

    const headline = theme === "dark" ? optionLabels.dark : optionLabels.light;
    const subline = theme.toUpperCase();

    const rowEmbeddedClass =
        "currency-base-row w-full max-w-full !border-0 !bg-transparent !shadow-none hover:!bg-transparent dark:hover:!bg-transparent hover:!border-transparent !px-0 !py-0 [&>div:first-child]:w-full [&>div:first-child]:min-w-0 [&>div:first-child]:items-stretch";

    const leading =
        theme === "dark" ? (
            <Moon className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
        ) : (
            <Sun className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
        );

    return (
        <>
            <div className="w-full">
                <CurrencyRow noScroll className={rowEmbeddedClass}>
                    <CurrencyRowSelector
                        variant="embedded"
                        leading={leading}
                        headline={headline}
                        subline={subline}
                        flag={undefined}
                        code={theme}
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
                selectedCode={theme}
                onSelect={(code) => onSelect(code as AppTheme)}
                title={modalTitle}
                rowIcon="theme"
            />
        </>
    );
}
