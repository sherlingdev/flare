"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { createClient } from "@/utils/supabase/client";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

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

// OAuth Buttons Component
interface OAuthButtonsProps {
    onGoogleClick: () => void;
    onGitHubClick: () => void;
    loading: boolean;
    googleText: string;
    githubText: string;
}

const OAuthButtons = ({ onGoogleClick, onGitHubClick, loading, googleText, githubText }: OAuthButtonsProps) => (
    <>
        <div className="mb-4 space-y-2">
            <button
                type="button"
                onClick={onGoogleClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {googleText}
            </button>
            <button
                type="button"
                onClick={onGitHubClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                    />
                </svg>
                {githubText}
            </button>
        </div>
        <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FFFFFFF2] dark:bg-[#1E293BF2] text-gray-700 dark:text-gray-300">or</span>
            </div>
        </div>
    </>
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

    // Reset form state
    const resetFormState = useCallback(() => {
        setError("");
        setEmailSent(false);
        setEmailResent(false);
        setResetPasswordSent(false);
        setPassword("");
        setConfirmPassword("");
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
                emailInputRef.current?.focus();
            });
        }
    }, [isLogin, isOpen, mounted]);

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
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
        });

        if (signUpError && !data.user) {
            setError(translateError(signUpError.message, t));
            setLoading(false);
            return false;
        }

        if (data.user) {
            if (signUpError?.message.toLowerCase().includes('database error')) {
                setError("");
                setEmailSent(true);
                setIsLogin(true);
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setShowConfirmPassword(false);
                setLoading(false);
            } else if (data.session) {
                resetFormState();
                setIsLogin(true);
                onClose();
                setLoading(false);
            } else {
                // User created but needs email confirmation
                setError("");
                setEmailSent(true);
                setIsLogin(true);
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setShowConfirmPassword(false);
                setLoading(false);
            }
        }

        return true;
    }, [email, password, confirmPassword, t, onClose, resetFormState]);

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

    const handleOAuthSignIn = useCallback(async (provider: 'google' | 'github') => {
        setError("");
        setLoading(true);

        try {
            const supabase = createClient();
            // Save current pathname to redirect back after OAuth
            const currentPath = window.location.pathname;
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(currentPath)}`,
                },
            });

            if (oauthError) {
                setError(translateError(oauthError.message, t));
                setLoading(false);
            }
        } catch {
            setError(t.unexpectedError || "An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    }, [t]);

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
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email,
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

                {/* OAuth Buttons */}
                {!isForgotPassword && !isResetPasswordMode && (
                    <OAuthButtons
                        onGoogleClick={() => handleOAuthSignIn('google')}
                        onGitHubClick={() => handleOAuthSignIn('github')}
                        loading={loading}
                        googleText={t.signInWithGoogle || "Continue with Google"}
                        githubText={t.signInWithGitHub || "Continue with GitHub"}
                    />
                )}

                {/* Form */}
                <form onSubmit={isResetPasswordMode ? handleUpdatePassword : (isForgotPassword ? handleResetPassword : handleSubmit)} className="space-y-4">
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
                        disabled={loading || passwordUpdated}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? t.loading : isResetPasswordMode ? (t.resetPassword || "Reset password") : (isForgotPassword ? (t.resetPassword || "Reset password") : (isLogin ? (t.signIn || "Sign in") : t.registerButton))}
                    </button>
                </form>

                {/* Back to login button for forgot password */}
                {(isForgotPassword || isResetPasswordMode) && (
                    <div className="mt-6 text-center">
                        <button onClick={switchBackToLogin} className="flex items-center gap-2 text-sm text-flare-primary hover:underline mx-auto">
                            <ArrowLeft className="w-4 h-4" />
                            {t.backToLogin || "Back to login"}
                        </button>
                    </div>
                )}

                {/* Resend confirmation email */}
                {isEmailNotConfirmed && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleResendConfirmationEmail}
                            disabled={resendingEmail || !email}
                            className="text-sm text-flare-primary hover:underline px-4 py-2 rounded-lg bg-flare-primary/10 dark:bg-flare-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {resendingEmail ? "Sending..." : "Resend confirmation email"}
                        </button>
                    </div>
                )}

                {/* Switch mode / Forgot password */}
                {!isResetPasswordMode && (
                    <div className="mt-6 text-center space-y-2">
                        {isLogin && !isForgotPassword && (
                            <div>
                                <button type="button" onClick={switchToForgotPassword} className="text-sm text-flare-primary hover:underline">
                                    {t.forgotPassword || "Forgot password?"}
                                </button>
                            </div>
                        )}
                        {!isForgotPassword && (
                            <div>
                                <button onClick={switchMode} className="text-sm text-flare-primary hover:underline">
                                    {isLogin ? t.noAccount : t.haveAccount}{" "}
                                    <span className="font-medium">{isLogin ? t.register : (t.signIn || "Sign in")}</span>
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
