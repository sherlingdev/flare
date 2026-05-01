"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Globe, Moon, Sun } from "lucide-react";

export interface LanguageOption {
    code: string;
    name: string;
}

export interface LanguageSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    languages: LanguageOption[];
    selectedCode: string;
    onSelect: (code: string) => void;
    title: string;
    /** Optional: theme picker uses sun/moon per row instead of globe */
    rowIcon?: "globe" | "theme";
}

/**
 * Same shell and list rhythm as CurrencySelectModal, without search (short fixed list).
 */
export default function LanguageSelectModal({
    isOpen,
    onClose,
    languages,
    selectedCode,
    onSelect,
    title,
    rowIcon = "globe",
}: LanguageSelectModalProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const i = Math.max(0, languages.findIndex((l) => l.code === selectedCode));
            setSelectedIndex(i >= 0 ? i : 0);
            document.body.style.overflow = "hidden";
            requestAnimationFrame(() => dialogRef.current?.focus());
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen, languages, selectedCode]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => (i < languages.length - 1 ? i + 1 : 0));
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => (i > 0 ? i - 1 : languages.length - 1));
            return;
        }
        if (e.key === "Enter" && languages.length > 0) {
            e.preventDefault();
            const code = languages[selectedIndex >= 0 ? selectedIndex : 0]?.code;
            if (code) {
                onSelect(code);
                onClose();
            }
        }
    };

    const handleSelect = (code: string) => {
        onSelect(code);
        onClose();
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-[10050] flex items-start justify-center bg-white/70 px-4 pb-6 pt-6 backdrop-blur-md dark:bg-slate-900/70 sm:pt-8"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 10050 }}
            onClick={(e) => {
                if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose();
            }}
            role="presentation"
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="language-modal-title"
                className="animate-scale-in relative mx-auto flex max-h-[85vh] w-full max-w-md flex-col rounded-xl border border-slate-200/50 bg-[#FFFFFFF2] shadow-lg backdrop-blur-sm dark:border-slate-700/50 dark:bg-[#1E293BF2]"
                onKeyDown={handleKeyDown}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-lg p-1 text-flare-primary transition-opacity hover:bg-slate-100 hover:opacity-90 dark:hover:bg-slate-700"
                    aria-label="Close"
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="px-6 pb-4 pt-6">
                    <h2 id="language-modal-title" className="pr-10 text-xl font-bold text-flare-primary">
                        {title}
                    </h2>
                </div>

                <div className="box-border w-full flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-4">
                    <ul className="min-h-0 flex-1 space-y-1.5" role="listbox">
                        {languages.map((lang, idx) => (
                            <li key={lang.code}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={lang.code === selectedCode || idx === selectedIndex}
                                    onClick={() => handleSelect(lang.code)}
                                    className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                                        lang.code === selectedCode
                                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                                            : idx === selectedIndex
                                              ? "bg-slate-100 dark:bg-slate-700/60"
                                              : "hover:bg-slate-50 dark:hover:bg-slate-700/40"
                                    }`}
                                >
                                    <div className="flex h-7 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                                        {rowIcon === "theme" ? (
                                            lang.code === "light" ? (
                                                <Sun className="h-4 w-4 text-flare-primary" strokeWidth={2} aria-hidden />
                                            ) : (
                                                <Moon className="h-4 w-4 text-flare-primary" strokeWidth={2} aria-hidden />
                                            )
                                        ) : (
                                            <Globe className="h-4 w-4 text-flare-primary" strokeWidth={2} aria-hidden />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block truncate font-medium text-[#475569] dark:text-[#CBD5E1]">
                                            {lang.name}
                                        </span>
                                        <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                                            {lang.code.toUpperCase()}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
