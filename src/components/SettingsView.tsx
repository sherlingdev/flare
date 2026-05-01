"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useConverter } from "@/contexts/ConverterContext";
import { translations } from "@/lib/translations";
import { useCurrencyPayload } from "@/hooks/useCurrencyPayload";
import InformationCurrencyPicker from "@/components/InformationCurrencyPicker";
import SettingsLanguagePicker from "@/components/SettingsLanguagePicker";
import SettingsThemePicker from "@/components/SettingsThemePicker";
import { Eye, EyeOff } from "lucide-react";

const panelClass =
    "bg-[#FFFFFFF2] dark:bg-[#1E293BF2] rounded-lg p-4 mb-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/20";

/** Flip to `true` when the optional profile phone field should appear again. */
const SHOW_PROFILE_PHONE_FIELD = false;

/** Flip to `true` to show language and theme in Preferences again (e.g. header-only language otherwise). */
const SHOW_LANGUAGE_THEME_IN_SETTINGS = false;

/** Same tokens as AuthModal `EmailInput` / `PasswordInput` for cross-app consistency */
const authFieldLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
const authFieldShellClass =
    "bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600";
const authInputClass =
    "w-full text-sm bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200";

function isPlausibleOptionalPhone(raw: string): boolean {
    const s = raw.trim();
    if (!s) return true;
    if (s.length > 32) return false;
    const digits = s.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) return false;
    return /^[+\d\s().-]+$/.test(s);
}

function SettingsLanguageThemeRows({ t }: { t: typeof translations["en"] }) {
    const { language, changeLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    return (
        <>
            <div className="mb-4">
                <p className={authFieldLabelClass}>{t.settingsLanguageLabel}</p>
                <div className="w-full min-w-0">
                    <SettingsLanguagePicker
                        language={language}
                        onSelect={changeLanguage}
                        modalTitle={t.settingsLanguageLabel}
                        ariaLabel={t.settingsLanguageLabel}
                    />
                </div>
            </div>
            <div className="mb-4">
                <p className={authFieldLabelClass}>{t.settingsThemeLabel}</p>
                <div className="w-full min-w-0">
                    <SettingsThemePicker
                        theme={theme}
                        onSelect={setTheme}
                        optionLabels={{ light: t.settingsThemeLight, dark: t.settingsThemeDark }}
                        modalTitle={t.settingsThemeLabel}
                        ariaLabel={t.settingsThemeLabel}
                    />
                </div>
            </div>
        </>
    );
}

function SettingsPasswordRow({
    id,
    label,
    value,
    onChange,
    autoComplete,
    placeholder,
    visible,
    onToggleVisible,
    revealLabel,
    hideLabel,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    autoComplete: string;
    placeholder?: string;
    visible: boolean;
    onToggleVisible: () => void;
    revealLabel: string;
    hideLabel: string;
}) {
    return (
        <div>
            <label htmlFor={id} className={authFieldLabelClass}>
                {label}
            </label>
            <div className={`relative ${authFieldShellClass}`}>
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`${authInputClass} pr-12`}
                />
                <button
                    type="button"
                    onClick={onToggleVisible}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={visible ? hideLabel : revealLabel}
                    aria-pressed={visible}
                >
                    {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}

export default function SettingsView() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"] as typeof translations["en"];
    const { fromCurrency, setFromCurrency } = useConverter();
    const { currencies, isLoadingCurrencies } = useCurrencyPayload();

    const [displayName, setDisplayName] = useState<string>("");
    const [savedFullName, setSavedFullName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [savedPhone, setSavedPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [profileBusy, setProfileBusy] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordBusy, setPasswordBusy] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return;
            const meta = user.user_metadata as {
                full_name?: string;
                name?: string;
                display_name?: string;
                phone?: string;
                phone_number?: string;
            } | undefined;
            const name =
                meta?.full_name || meta?.name || meta?.display_name ||
                (user.email
                    ? user.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : "");
            const phoneFromMeta = (meta?.phone ?? meta?.phone_number ?? "").trim();
            setDisplayName(name);
            setSavedFullName(name);
            setPhone(phoneFromMeta);
            setSavedPhone(phoneFromMeta);
            setEmail(user.email ?? "");
        };
        load();
    }, []);

    const sortedCurrencies = useMemo(
        () => [...currencies].sort((a, b) => a.code.localeCompare(b.code)),
        [currencies]
    );

    const currencyNamesMap = useMemo(
        () => (t.currencyNames ?? {}) as Record<string, string>,
        [t.currencyNames]
    );

    const onBaseCurrencyChange = useCallback(
        (code: string) => {
            setFromCurrency(code);
        },
        [setFromCurrency]
    );

    const profileDirty =
        displayName.trim() !== savedFullName.trim() ||
        (SHOW_PROFILE_PHONE_FIELD && phone.trim() !== savedPhone.trim());

    const onSaveProfile = async () => {
        setProfileMsg(null);
        const trimmed = displayName.trim();
        if (!trimmed) {
            setProfileMsg({ ok: false, text: t.settingsProfileNameRequired });
            return;
        }
        const phoneTrim = phone.trim();
        if (SHOW_PROFILE_PHONE_FIELD && !isPlausibleOptionalPhone(phoneTrim)) {
            setProfileMsg({ ok: false, text: t.settingsProfilePhoneInvalid });
            return;
        }
        setProfileBusy(true);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: trimmed,
                name: trimmed,
                display_name: trimmed,
                phone: phoneTrim || null,
            },
        });
        setProfileBusy(false);
        if (error) {
            setProfileMsg({ ok: false, text: t.settingsProfileError });
            return;
        }
        setSavedFullName(trimmed);
        setDisplayName(trimmed);
        setSavedPhone(phoneTrim);
        setPhone(phoneTrim);
        setProfileMsg({ ok: true, text: t.settingsProfileSaved });
    };

    const passwordSubmitReady = useMemo(
        () =>
            email.trim().length > 0 &&
            currentPassword.trim().length > 0 &&
            newPassword.length >= 8 &&
            newPassword === confirmPassword,
        [email, currentPassword, newPassword, confirmPassword]
    );

    const onPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordSubmitReady) return;
        setPasswordMsg(null);
        if (!currentPassword.trim()) {
            setPasswordMsg({ ok: false, text: t.settingsCurrentPasswordRequired });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ ok: false, text: t.passwordsDoNotMatch });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMsg({ ok: false, text: t.passwordTooShort });
            return;
        }
        if (!email.trim()) {
            setPasswordMsg({ ok: false, text: t.settingsPasswordError });
            return;
        }
        setPasswordBusy(true);
        const supabase = createClient();
        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: currentPassword,
        });
        if (verifyError) {
            setPasswordBusy(false);
            setPasswordMsg({ ok: false, text: t.settingsWrongCurrentPassword });
            return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setPasswordBusy(false);
        if (error) {
            setPasswordMsg({ ok: false, text: t.settingsPasswordError });
            return;
        }
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMsg({ ok: true, text: t.settingsPasswordSuccess });
    };

    return (
        <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-16 pb-16">
            <div className="flex w-full flex-col items-center justify-center">
                <div className="w-full max-w-6xl">
                    <div className="w-full rounded-2xl border border-slate-200/50 bg-[#FFFFFFF2] px-6 py-8 shadow-xl backdrop-blur-sm dark:border-slate-700/50 dark:bg-[#1E293BF2] sm:px-8 lg:px-10 sm:py-12">
                        <h1 className="mb-6 text-center text-2xl font-bold text-flare-primary sm:text-3xl">
                            {t.settings}
                        </h1>

                        <div className="prose prose-slate max-w-none text-base dark:prose-invert">
                            {/* Profile — documentation-style panel */}
                            <section className="mb-2">
                                <h2 className="mb-4 text-xl font-semibold text-flare-primary">{t.settingsProfileTitle}</h2>
                                <p className="mb-4 text-slate-600 dark:text-slate-400">{t.settingsProfileDesc}</p>
                                <div className={panelClass}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="settings-profile-name" className={authFieldLabelClass}>
                                                {t.settingsFullName}
                                            </label>
                                            <div className={authFieldShellClass}>
                                                <input
                                                    id="settings-profile-name"
                                                    type="text"
                                                    autoComplete="name"
                                                    maxLength={120}
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    className={authInputClass}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="settings-profile-email" className={authFieldLabelClass}>
                                                {t.settingsEmail}
                                            </label>
                                            <div className={authFieldShellClass}>
                                                <input
                                                    id="settings-profile-email"
                                                    type="email"
                                                    readOnly
                                                    value={email}
                                                    className={`${authInputClass} cursor-default`}
                                                />
                                            </div>
                                        </div>
                                        {SHOW_PROFILE_PHONE_FIELD ? (
                                            <div>
                                                <label htmlFor="settings-profile-phone" className={authFieldLabelClass}>
                                                    {t.settingsPhoneNumber}
                                                </label>
                                                <div className={authFieldShellClass}>
                                                    <input
                                                        id="settings-profile-phone"
                                                        type="tel"
                                                        autoComplete="tel"
                                                        inputMode="tel"
                                                        maxLength={32}
                                                        placeholder={t.settingsPhonePlaceholder}
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className={authInputClass}
                                                    />
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                    {profileMsg && (
                                        <p
                                            className={`mt-3 text-sm ${profileMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                                            role="status"
                                        >
                                            {profileMsg.text}
                                        </p>
                                    )}
                                    <div className="mt-4 flex justify-end border-t border-slate-200/50 pt-4 dark:border-slate-600/40">
                                        <button
                                            type="button"
                                            onClick={onSaveProfile}
                                            disabled={profileBusy || !profileDirty}
                                            className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {profileBusy ? t.settingsSaving : t.settingsSaveProfile}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Preferences */}
                            <section className="mb-2">
                                <h2 className="mb-4 text-xl font-semibold text-flare-primary">{t.settingsPreferencesTitle}</h2>
                                <p className="mb-4 text-slate-600 dark:text-slate-400">{t.settingsPreferencesDesc}</p>

                                <div className={panelClass}>
                                    {SHOW_LANGUAGE_THEME_IN_SETTINGS ? (
                                        <SettingsLanguageThemeRows t={t} />
                                    ) : null}
                                    <div>
                                        <p className={authFieldLabelClass}>{t.settingsBaseCurrencyLabel}</p>
                                        <div className="w-full min-w-0">
                                            <InformationCurrencyPicker
                                                currencies={sortedCurrencies}
                                                selectedCode={fromCurrency}
                                                onSelect={onBaseCurrencyChange}
                                                currencyNames={currencyNamesMap}
                                                searchPlaceholder={t.searchCurrency}
                                                noResultsText={t.noCurrenciesFound}
                                                modalTitle={t.settingsBaseCurrencyLabel}
                                                ariaLabel={t.settingsBaseCurrencyLabel}
                                                isLoadingCurrencies={isLoadingCurrencies}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Security */}
                            <section className="mb-2">
                                <h2 className="mb-4 text-xl font-semibold text-flare-primary">{t.settingsSecurityTitle}</h2>
                                <p className="mb-4 text-slate-600 dark:text-slate-400">{t.settingsSecurityDesc}</p>
                                <div className={panelClass}>
                                    <form onSubmit={onPasswordSubmit} className="space-y-4">
                                        <SettingsPasswordRow
                                            id="settings-current-password"
                                            label={t.settingsCurrentPassword}
                                            value={currentPassword}
                                            onChange={setCurrentPassword}
                                            autoComplete="current-password"
                                            placeholder={t.passwordPlaceholder}
                                            visible={showCurrentPassword}
                                            onToggleVisible={() => setShowCurrentPassword((v) => !v)}
                                            revealLabel={t.settingsPasswordReveal}
                                            hideLabel={t.settingsPasswordHide}
                                        />
                                        <SettingsPasswordRow
                                            id="settings-new-password"
                                            label={t.settingsNewPassword}
                                            value={newPassword}
                                            onChange={setNewPassword}
                                            autoComplete="new-password"
                                            placeholder={t.newPasswordPlaceholder}
                                            visible={showNewPassword}
                                            onToggleVisible={() => setShowNewPassword((v) => !v)}
                                            revealLabel={t.settingsPasswordReveal}
                                            hideLabel={t.settingsPasswordHide}
                                        />
                                        <SettingsPasswordRow
                                            id="settings-confirm-password"
                                            label={t.settingsConfirmPassword}
                                            value={confirmPassword}
                                            onChange={setConfirmPassword}
                                            autoComplete="new-password"
                                            placeholder={t.confirmPasswordPlaceholder}
                                            visible={showConfirmPassword}
                                            onToggleVisible={() => setShowConfirmPassword((v) => !v)}
                                            revealLabel={t.settingsPasswordReveal}
                                            hideLabel={t.settingsPasswordHide}
                                        />
                                        {passwordMsg && (
                                            <p
                                                className={`text-sm ${passwordMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                                                role="alert"
                                            >
                                                {passwordMsg.text}
                                            </p>
                                        )}
                                        <div className="mt-4 flex justify-end border-t border-slate-200/50 pt-4 dark:border-slate-600/40">
                                            <button
                                                type="submit"
                                                disabled={passwordBusy || !passwordSubmitReady}
                                                className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                                            >
                                                {passwordBusy ? t.settingsSaving : t.settingsUpdatePassword}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
