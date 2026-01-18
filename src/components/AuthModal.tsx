"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { createClient } from "@/utils/supabase/client";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Helper function to translate Supabase error messages
const translateError = (errorMessage: string, t: typeof translations["en"]): string => {
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('invalid login credentials') || lowerError.includes('invalid credentials')) {
        return t.invalidCredentials || "Invalid login credentials";
    }
    if (lowerError.includes('email not confirmed') || lowerError.includes('email_not_confirmed')) {
        return t.emailNotConfirmed || "Please verify your email before logging in.";
    }
    if (lowerError.includes('user already registered') || lowerError.includes('already registered')) {
        return t.userAlreadyRegistered || "User already registered";
    }
    if (lowerError.includes('email rate limit') || lowerError.includes('rate limit exceeded')) {
        return t.emailRateLimitExceeded || "Email rate limit exceeded. Please try again later.";
    }
    if (lowerError.includes('database error')) {
        return t.databaseError || "There was an issue. Please try again or contact support.";
    }

    return errorMessage;
};

// Email validation helper
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password Input Component
interface PasswordInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
    required?: boolean;
}

const PasswordInput = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    showPassword,
    onToggleVisibility,
    required = true,
}: PasswordInputProps) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
        </label>
        <div className="relative bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
            <input
                id={id}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pr-12 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200"
                required={required}
            />
            <button
                type="button"
                onClick={onToggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
    </div>
);

// Email Input Component
interface EmailInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

const EmailInput = ({ value, onChange, placeholder, inputRef }: EmailInputProps) => (
    <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
        </label>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
            <input
                ref={inputRef}
                id="email"
                type="email"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full text-sm bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200"
                required
            />
        </div>
    </div>
);

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { mounted: langMounted, language } = useLanguage();
    const t = translations[langMounted ? language : "en"] as typeof translations["en"];
    const { isResetPasswordMode: contextResetMode, setResetPasswordMode: setContextResetMode } = useAuthModal();

    // State management
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailResent, setEmailResent] = useState(false);
    const [resetPasswordSent, setResetPasswordSent] = useState(false);
    const [passwordUpdated, setPasswordUpdated] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Refs
    const modalRef = useRef<HTMLDivElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const fullNameInputRef = useRef<HTMLInputElement>(null);

    // Reset form state
    const resetFormState = useCallback(() => {
        setError("");
        setEmailSent(false);
        setEmailResent(false);
        setResetPasswordSent(false);
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setShowPassword(false);
        setShowConfirmPassword(false);
    }, []);

    // Effects
    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync with context reset password mode and check sessionStorage
    useEffect(() => {
        if (contextResetMode && isOpen) {
            setIsResetPasswordMode(true);
            setIsForgotPassword(false);
            setIsLogin(false);
        }
    }, [contextResetMode, isOpen]);

    // Check for reset password token in URL hash or sessionStorage
    useEffect(() => {
        if (mounted && isOpen) {
            // Check sessionStorage first (set by reset-password page)
            const hasResetToken = sessionStorage.getItem('resetPasswordToken');

            if (hasResetToken === 'true') {
                setIsResetPasswordMode(true);
                setContextResetMode(true);
                setIsForgotPassword(false);
                setIsLogin(false);
                // Clear sessionStorage
                sessionStorage.removeItem('resetPasswordToken');
                sessionStorage.removeItem('resetPasswordHash');
                return;
            }

            // Also check URL hash directly (fallback)
            const checkToken = () => {
                const hash = window.location.hash;
                const hashParams = new URLSearchParams(hash.substring(1));
                const searchParams = new URLSearchParams(window.location.search);
                const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
                const type = hashParams.get('type') || searchParams.get('type');

                // Also check if hash contains recovery type directly
                const hasRecoveryToken = hash.includes('type=recovery') || hash.includes('type%3Drecovery');

                if ((accessToken && type === 'recovery') || hasRecoveryToken) {
                    setIsResetPasswordMode(true);
                    setContextResetMode(true);
                    setIsForgotPassword(false);
                    setIsLogin(false);
                    // Clear the hash and search params from URL
                    window.history.replaceState(null, '', window.location.pathname);
                }
            };

            // Check immediately and also after a small delay
            checkToken();
            const timeoutId = setTimeout(checkToken, 100);
            const timeoutId2 = setTimeout(checkToken, 500);

            return () => {
                clearTimeout(timeoutId);
                clearTimeout(timeoutId2);
            };
        }
    }, [mounted, isOpen, setContextResetMode]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            requestAnimationFrame(() => {
                emailInputRef.current?.focus();
            });
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && mounted) {
            requestAnimationFrame(() => {
                // Focus on full name for register, email for login/forgot password
                if (!isLogin && !isForgotPassword && !isResetPasswordMode) {
                    fullNameInputRef.current?.focus();
                } else {
                emailInputRef.current?.focus();
                }
            });
        }
    }, [isLogin, isForgotPassword, isResetPasswordMode, isOpen, mounted]);

    // Removed handleClickOutside - modal can only be closed with X button

    // Removed handleEscape - modal can only be closed with X button

    // Handlers
    const handleLogin = useCallback(async () => {
        const supabase = createClient();
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (signInError) {
            setError(translateError(signInError.message, t));
            setLoading(false);
            return false;
        }

        if (!data.user || !data.session) {
            setError(t.loginFailed || "Login failed. Please check your credentials.");
            setLoading(false);
            return false;
        }

        onClose();
        setEmail("");
        setPassword("");
        setLoading(false);
        return true;
    }, [email, password, t, onClose]);

    const handleRegister = useCallback(async () => {
        if (password !== confirmPassword) {
            setError(t.passwordsDoNotMatch || "Passwords do not match");
            setLoading(false);
            return false;
        }

        if (password.length < 8) {
            setError(t.passwordTooShort || "Password must be at least 8 characters long");
            setLoading(false);
            return false;
        }

        const supabase = createClient();

        // Use production URL in production, current origin in development
        // IMPORTANT: This URL must be added to Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
        const isProduction = window.location.hostname === 'flarexrate.com';
        const emailRedirectTo = isProduction
            ? 'https://flarexrate.com/auth/callback'
            : `${window.location.origin}/auth/callback`;

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                emailRedirectTo,
                data: {
                    full_name: fullName.trim() || null,
                },
            },
        });

        // Handle errors
        if (signUpError && !data.user) {
            setError(translateError(signUpError.message, t));
            setLoading(false);
            return false;
        }

        // Handle successful user creation
        if (data.user) {
            if (data.session) {
                // User created and automatically logged in (email confirmation disabled)
                resetFormState();
                setIsLogin(true);
                onClose();
                setLoading(false);
            } else {
                // User created but needs email confirmation
                if (data.user.confirmation_sent_at) {
                setError("");
                setEmailSent(true);
                } else {
                    setError("User created but email confirmation may not have been sent. Please check your email or try again.");
                }
                setIsLogin(true);
                setPassword("");
                setConfirmPassword("");
                setFullName("");
                setShowPassword(false);
                setShowConfirmPassword(false);
                setLoading(false);
            }
        } else {
            // No user was created and no error was caught
            setError(t.unexpectedError || "An unexpected error occurred. Please try again.");
            setLoading(false);
            return false;
        }

        return true;
    }, [email, password, confirmPassword, fullName, t, onClose, resetFormState]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        resetFormState();

        if (!email || !email.trim()) {
            setError(t.emailRequired || "Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            setError(t.emailInvalid || "Please enter a valid email address");
            return;
        }

        if (!password || !password.trim()) {
            setError(t.passwordRequired || "Please enter your password");
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await handleLogin();
            } else {
                await handleRegister();
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : (t.unexpectedError || "An unexpected error occurred. Please try again.");
            setError(errorMessage);
            setLoading(false);
        }
    }, [email, password, isLogin, t, handleLogin, handleRegister, resetFormState]);

    const handleResendConfirmationEmail = useCallback(async () => {
        if (!email) {
            setError(t.emailRequired || "Please enter your email address");
            return;
        }

        setResendingEmail(true);
        setError("");
        setEmailSent(false);
        setEmailResent(false);

        try {
            const supabase = createClient();

            // Use production URL in production, current origin in development
            const isProduction = window.location.hostname === 'flarexrate.com';
            const emailRedirectTo = isProduction
                ? 'https://flarexrate.com/auth/callback'
                : `${window.location.origin}/auth/callback`;

            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo,
                },
            });

            if (resendError) {
                setError(translateError(resendError.message, t));
            } else {
                setEmailResent(true);
                setEmailSent(false);
                setError("");
            }
        } catch {
            setError(t.unexpectedError || "An unexpected error occurred. Please try again.");
        } finally {
            setResendingEmail(false);
        }
    }, [email, t]);

    const handleResetPassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setResetPasswordSent(false);

        if (!email || !email.trim()) {
            setError(t.emailRequired || "Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            setError(t.emailInvalid || "Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (resetError) {
                setError(translateError(resetError.message, t));
                setLoading(false);
            } else {
                setResetPasswordSent(true);
                setError("");
                setLoading(false);
            }
        } catch {
            setError(t.resetPasswordError || t.unexpectedError || "An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    }, [email, t]);

    const handleUpdatePassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setPasswordUpdated(false);

        if (!password || !password.trim()) {
            setError(t.passwordRequired || "Please enter your password");
            return;
        }

        if (password.length < 8) {
            setError(t.passwordTooShort || "Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError(t.passwordsDoNotMatch || "Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                setError(translateError(updateError.message, t));
                setLoading(false);
            } else {
                setPasswordUpdated(true);
                setError("");
                setLoading(false);
                // Close modal after 2 seconds
                setTimeout(() => {
                    onClose();
                    setIsResetPasswordMode(false);
                    setPassword("");
                    setConfirmPassword("");
                }, 2000);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : (t.unexpectedError || "An unexpected error occurred. Please try again.");
            setError(errorMessage);
            setLoading(false);
        }
    }, [password, confirmPassword, t, onClose]);

    const switchMode = useCallback(() => {
        setIsLogin(!isLogin);
        setIsForgotPassword(false);
        setIsResetPasswordMode(false);
        setEmail("");
        resetFormState();
    }, [isLogin, resetFormState]);

    const switchToForgotPassword = useCallback(() => {
        setIsForgotPassword(true);
        setIsResetPasswordMode(false);
        setEmail("");
        setLoading(false);
        setPasswordUpdated(false);
        resetFormState();
    }, [resetFormState]);

    const switchBackToLogin = useCallback(() => {
        setIsForgotPassword(false);
        setIsResetPasswordMode(false);
        resetFormState();
    }, [resetFormState]);


    if (!isOpen || !mounted) return null;

    const isEmailNotConfirmed = error && (
        error.toLowerCase().includes('email not confirmed') ||
        error.toLowerCase().includes('email_not_confirmed') ||
        error.toLowerCase().includes('verify your email') ||
        error.toLowerCase().includes('verifica tu correo') ||
        error.toLowerCase().includes('vérifier votre e-mail') ||
        error.toLowerCase().includes('verifique seu e-mail') ||
        error.toLowerCase().includes('bestätigen sie ihre e-mail') ||
        error.toLowerCase().includes('验证您的电子邮件')
    );

    const modalContent = (
        <div
            className="fixed inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md z-[9999] flex items-center justify-center"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                zIndex: 9999,
            }}
        >
            <div
                ref={modalRef}
                className="relative bg-[#FFFFFFF2] dark:bg-[#1E293BF2] rounded-xl px-6 sm:px-8 py-6 sm:py-8 w-full max-w-md mx-4 shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-scale-in"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-flare-primary hover:opacity-70 transition-opacity duration-200 z-10"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-flare-primary mb-2">
                        {isResetPasswordMode ? (t.resetPassword || "Reset password") : (isForgotPassword ? (t.resetPassword || "Reset password") : (isLogin ? (t.signIn || "Sign in") : t.register))}
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {isResetPasswordMode ? "Enter your new password below" : (isForgotPassword ? (t.resetPasswordSubtitle || "Enter your email to receive a password reset link") : (isLogin ? t.loginSubtitle : t.registerSubtitle))}
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Success messages */}
                {emailSent && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                            {t.registrationSuccess || "Account created successfully! Please check your email to confirm your account."}
                        </p>
                    </div>
                )}

                {emailResent && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                            {t.confirmationEmailResent || "Confirmation email sent! Please check your inbox."}
                        </p>
                    </div>
                )}

                {resetPasswordSent && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                            {t.resetPasswordSent || "Password reset email sent! Please check your inbox."}
                        </p>
                    </div>
                )}

                {passwordUpdated && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Password updated successfully! Redirecting...
                        </p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={isResetPasswordMode ? handleUpdatePassword : (isForgotPassword ? handleResetPassword : handleSubmit)} className="space-y-4">
                    {!isLogin && !isForgotPassword && !isResetPasswordMode && (
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t.fullName || "Full name"}
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                                <input
                                    ref={fullNameInputRef}
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder={t.fullNamePlaceholder || "Enter your full name"}
                                    className="w-full text-sm bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    {!isResetPasswordMode && (
                        <EmailInput
                            value={email}
                            onChange={setEmail}
                            placeholder={t.emailPlaceholder}
                            inputRef={emailInputRef}
                        />
                    )}

                    {!isForgotPassword && !isResetPasswordMode && (
                        <>
                            <PasswordInput
                                id="password"
                                label={t.password}
                                value={password}
                                onChange={setPassword}
                                placeholder={t.passwordPlaceholder}
                                showPassword={showPassword}
                                onToggleVisibility={() => setShowPassword(!showPassword)}
                            />
                        </>
                    )}

                    {isResetPasswordMode && (
                        <>
                            <PasswordInput
                                id="password"
                                label={t.password}
                                value={password}
                                onChange={setPassword}
                                placeholder={t.passwordPlaceholder}
                                showPassword={showPassword}
                                onToggleVisibility={() => setShowPassword(!showPassword)}
                            />
                            <PasswordInput
                                id="confirmPassword"
                                label={t.confirmPassword}
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                placeholder={t.confirmPasswordPlaceholder}
                                showPassword={showConfirmPassword}
                                onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        </>
                    )}

                    {!isLogin && !isForgotPassword && !isResetPasswordMode && (
                        <PasswordInput
                            id="confirmPassword"
                            label={t.confirmPassword}
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder={t.confirmPasswordPlaceholder}
                            showPassword={showConfirmPassword}
                            onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                    )}

                    <button
                        type="submit"
                        disabled={(() => {
                            if (isForgotPassword) {
                                const shouldDisable = !email || !email.trim() || resetPasswordSent || loading;
                                return shouldDisable;
                            }
                            if (isResetPasswordMode) {
                                return passwordUpdated || !password.trim() || !confirmPassword.trim() || loading;
                            }
                            if (isLogin) {
                                return !email.trim() || !password.trim() || loading;
                            }
                            return !email.trim() || !password.trim() || !confirmPassword.trim() || loading;
                        })()}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? t.loading : isResetPasswordMode ? (t.resetPassword || "Reset password") : (isForgotPassword ? (t.resetPassword || "Reset password") : (isLogin ? (t.signIn || "Sign in") : t.registerButton))}
                    </button>
                </form>

                {/* Back to login button for forgot password */}
                {(isForgotPassword || isResetPasswordMode) && (
                    <div className="mt-4">
                        <button
                            onClick={switchBackToLogin}
                            className="w-full flex items-center justify-center gap-2 py-3 text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            {t.backToLogin || "Back to login"}
                        </button>
                    </div>
                )}

                {/* Resend confirmation email */}
                {isEmailNotConfirmed && (
                    <div className="mt-4">
                        <button
                            onClick={handleResendConfirmationEmail}
                            disabled={resendingEmail || !email}
                            className="w-full py-3 px-4 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendingEmail ? "Sending..." : "Resend confirmation email"}
                        </button>
                    </div>
                )}

                {/* Switch mode / Forgot password */}
                {!isResetPasswordMode && (
                    <div className="mt-6">
                        {isLogin && !isForgotPassword && (
                            <div className="flex items-center justify-between">
                                <button onClick={switchMode} className="text-sm text-flare-primary hover:underline">
                                    {t.noAccount}
                                </button>
                                <button type="button" onClick={switchToForgotPassword} className="text-sm text-flare-primary hover:underline">
                                    {t.forgotPassword || "Forgot password?"}
                                </button>
                            </div>
                        )}
                        {!isLogin && !isForgotPassword && (
                            <div className="text-center">
                                <button onClick={switchMode} className="text-sm text-flare-primary hover:underline">
                                    {t.haveAccount}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
