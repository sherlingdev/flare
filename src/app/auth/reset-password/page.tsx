"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff } from "lucide-react";

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

export default function ResetPasswordPage() {
    const router = useRouter();
    const { mounted: langMounted, language } = useLanguage();
    const t = translations[langMounted ? language : "en"] as typeof translations["en"];

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordUpdated, setPasswordUpdated] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const hasTokenRef = useRef(false);

    const passwordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Check for reset password token in URL hash/search params or code
    useEffect(() => {
        if (!mounted) return;

        const checkToken = async () => {
            const hash = window.location.hash;
            const search = window.location.search;
            const searchParams = new URLSearchParams(search);
            const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null;

            // Check for code parameter (Supabase PKCE flow)
            const code = searchParams.get('code');
            const type = searchParams.get('type');

            // Get token from hash or search params
            const accessTokenFromHash = hashParams?.get('access_token');
            const typeFromHash = hashParams?.get('type');
            const accessTokenFromSearch = searchParams.get('access_token');
            const typeFromSearch = searchParams.get('type');
            const tokenFromSearch = searchParams.get('token');

            const accessToken = accessTokenFromHash || accessTokenFromSearch || tokenFromSearch;
            const tokenType = typeFromHash || typeFromSearch || type;

            // Check if hash/search contains recovery type directly
            const hasRecoveryToken =
                (hash && (hash.includes('type=recovery') || hash.includes('type%3Drecovery'))) ||
                (search && (search.includes('type=recovery') || search.includes('type%3Drecovery')));

            // If we have a code, Supabase has already processed it via PKCE flow
            // The code parameter indicates the user is authenticated for password reset
            if (code) {
                try {
                    const supabase = createClient();
                    const { data: { session } } = await supabase.auth.getSession();

                    if (session) {
                        setHasToken(true);
                        hasTokenRef.current = true;
                        window.history.replaceState(null, '', window.location.pathname);
                        requestAnimationFrame(() => {
                            passwordInputRef.current?.focus();
                        });
                        return;
                    } else {
                        // No session yet, but code is present - Supabase will handle it
                        // Just proceed with password reset (the code validates the request)
                        setHasToken(true);
                        hasTokenRef.current = true;
                        window.history.replaceState(null, '', window.location.pathname);
                        requestAnimationFrame(() => {
                            passwordInputRef.current?.focus();
                        });
                        return;
                    }
                } catch {
                    // Even if there's an error, if we have a code, proceed
                    setHasToken(true);
                    hasTokenRef.current = true;
                    window.history.replaceState(null, '', window.location.pathname);
                    requestAnimationFrame(() => {
                        passwordInputRef.current?.focus();
                    });
                    return;
                }
            }

            // Check for access_token with recovery type
            if ((accessToken && tokenType === 'recovery') || hasRecoveryToken) {
                setHasToken(true);
                hasTokenRef.current = true;
                setTimeout(() => {
                    window.history.replaceState(null, '', window.location.pathname);
                }, 500);
                requestAnimationFrame(() => {
                    passwordInputRef.current?.focus();
                });
            }
        };

        checkToken();

        // Check multiple times with delays to catch late token arrivals
        const timeout1 = setTimeout(checkToken, 100);
        const timeout2 = setTimeout(checkToken, 500);
        const timeout3 = setTimeout(checkToken, 1000);
        const timeout4 = setTimeout(checkToken, 2000);

        // Final check - if still no token after 3 seconds, redirect to home
        const finalTimeout = setTimeout(() => {
            if (!hasTokenRef.current) {
                router.replace('/');
            }
        }, 3000);

        // Also listen for hash/search changes
        const handleHashChange = () => checkToken();
        const handlePopState = () => checkToken();
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('popstate', handlePopState);

        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            clearTimeout(timeout3);
            clearTimeout(timeout4);
            clearTimeout(finalTimeout);
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [mounted, router]);

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
                // Redirect to home after 2 seconds
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : (t.unexpectedError || "An unexpected error occurred. Please try again.");
            setError(errorMessage);
            setLoading(false);
        }
    }, [password, confirmPassword, t, router]);

    if (!mounted || !hasToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
                <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 px-4 sm:px-6 py-8">
            <div className="relative bg-[#FFFFFFF2] dark:bg-[#1E293BF2] rounded-xl px-6 sm:px-8 py-6 sm:py-8 w-full max-w-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-scale-in">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-flare-primary mb-2">
                        {t.resetPassword || "Reset password"}
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Enter your new password below
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Success message */}
                {passwordUpdated && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Password updated successfully! Redirecting...
                        </p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {/* New Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.newPassword || "New password"}
                        </label>
                        <div className="relative bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                            <input
                                ref={passwordInputRef}
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t.passwordPlaceholder || "Enter your new password"}
                                className="w-full pr-12 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.confirmPassword || "Confirm password"}
                        </label>
                        <div className="relative bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t.confirmPasswordPlaceholder || "Confirm your new password"}
                                className="w-full pr-12 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || passwordUpdated}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (t.loading || "Loading...") : (t.updatePassword || "Update password")}
                    </button>
                </form>
            </div>
        </div>
    );
}
