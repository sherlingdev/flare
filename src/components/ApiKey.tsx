'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { createClient } from '@/utils/supabase/client';
import Loader from '@/components/Loader';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

const rateLimitTemplates: Record<Language, string> = {
    en: 'Please wait {time} before trying again',
    es: 'Por favor espera {time} antes de intentar de nuevo',
    fr: 'Veuillez attendre {time} avant de réessayer',
    pt: 'Por favor, aguarde {time} antes de tentar novamente',
    de: 'Bitte warten Sie {time}, bevor Sie es erneut versuchen',
    it: 'Attendere {time} prima di riprovare',
    zh: '请稍候 {time} 后再试'
};

export default function ApiKeyRequest() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : 'en'];
    const [loading, setLoading] = useState(false);
    const [messageKey, setMessageKey] = useState<'success' | 'networkError' | 'serverError' | null>(null);
    const [serverMessage, setServerMessage] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [rateLimitReset, setRateLimitReset] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loadingKey, setLoadingKey] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showFullKey, setShowFullKey] = useState(false);
    const hasFetchedRef = useRef(false);

    // Get user email and existing API key from auth session
    useEffect(() => {
        // Prevent duplicate requests
        if (hasFetchedRef.current || !mounted) return;

        const getUserData = async () => {
            hasFetchedRef.current = true;
            const supabase = createClient();
            const { data: { user }, error } = await supabase.auth.getUser();
            if (user?.email && !error) {
                setUserEmail(user.email);

                // Fetch existing API key
                try {
                    const response = await fetch('/api/api-key');
                    const data = await response.json();

                    if (data.success && data.hasKey && data.data?.api_key) {
                        setApiKey(data.data.api_key);
                    }
                } catch (error) {
                    console.error('Error fetching API key:', error);
                } finally {
                    setLoadingKey(false);
                }
            } else {
                setLoadingKey(false);
            }
        };

        getUserData();
    }, [mounted]);

    // Get translated message based on messageKey
    const getMessage = () => {
        if (!messageKey) return '';

        if (messageKey === 'success') {
            return t.apiKeySuccess;
        } else if (messageKey === 'networkError') {
            return t.apiKeyNetworkError;
        } else if (messageKey === 'serverError') {
            return serverMessage || t.apiKeyNetworkError;
        }
        return '';
    };

    const message = getMessage();

    // Contador regresivo para el rate limit
    useEffect(() => {
        if (!rateLimitReset) {
            setTimeRemaining(0);
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const resetTime = new Date(rateLimitReset).getTime();
            const remaining = Math.max(0, Math.ceil((resetTime - now) / 1000));

            setTimeRemaining(remaining);

            if (remaining <= 0) {
                setRateLimitReset(null);
                // Clear error message when rate limit time is over
                setMessageKey(null);
                setServerMessage('');
                setIsSuccess(false);
            }
        };

        // Actualizar inmediatamente
        updateTimer();

        // Actualizar cada segundo
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [rateLimitReset]);

    // Formatear tiempo restante
    const formatTimeRemaining = (seconds: number): string => {
        if (seconds <= 0) return '';

        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
        }
        return `${secs} second${secs !== 1 ? 's' : ''}`;
    };


    const handleSubmit = async () => {
        if (!userEmail) return;

        setLoading(true);
        setMessageKey(null);
        setServerMessage('');
        setIsSuccess(false);

        try {
            const response = await fetch('/api/api-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: language || 'en' // Enviar el idioma actual
                }),
            });

            const data = await response.json();

            if (data.success && data.data?.api_key) {
                setApiKey(data.data.api_key);
                setMessageKey('success');
                setServerMessage('');
                setIsSuccess(true);
                setRateLimitReset(null); // Reset rate limit cuando es exitoso
            } else {
                // If server sends a custom message, use it; otherwise use network error
                const errorMessage = data.error || data.message;
                if (errorMessage && errorMessage !== t.apiKeyNetworkError) {
                    setMessageKey('serverError');
                    setServerMessage(errorMessage);
                } else {
                    setMessageKey('networkError');
                    setServerMessage('');
                }
                setIsSuccess(false);

                // Capturar el tiempo de reset del rate limit si está presente
                if (response.status === 429 && data.rateLimit?.reset) {
                    setRateLimitReset(new Date(data.rateLimit.reset));
                }
            }
        } catch {
            setMessageKey('networkError');
            setServerMessage('');
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };



    const handleCopy = async () => {
        if (!apiKey) return;

        try {
            await navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const maskApiKey = (key: string): string => {
        if (key.length <= 11) return key; // If key is too short, show it all
        const start = key.substring(0, 7); // Show first 7 chars (sk_xxxx)
        const end = key.substring(key.length - 4); // Show last 4 chars
        return `${start}${'•'.repeat(Math.max(8, key.length - 11))}${end}`;
    };

    const displayKey = apiKey ? (showFullKey ? apiKey : maskApiKey(apiKey)) : '';

    if (!userEmail || loadingKey) {
        return <Loader show={true} />;
    }

    return (
        <>
            <Loader show={loading} />

            {/* Always show input field with Generate button */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                        <input
                        type="text"
                        value={displayKey}
                        readOnly
                        placeholder={apiKey ? undefined : t.apiKeyInputPlaceholder}
                        className="w-full bg-[#F9FAFB] dark:bg-[#374151] text-slate-600 dark:text-slate-300 rounded-xl px-4 py-3 pr-16 text-sm font-mono border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    {apiKey && (
                        <>
                            <button
                                onClick={() => setShowFullKey(!showFullKey)}
                                className="absolute right-9 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                aria-label={showFullKey ? "Hide API key" : "Show API key"}
                            >
                                {showFullKey ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={handleCopy}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                aria-label="Copy API key"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </>
                    )}
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || timeRemaining > 0}
                    className={`inline-flex items-center justify-center px-4 py-3 text-sm font-mono rounded-xl border-none outline-none transition-colors select-none whitespace-nowrap ${loading || timeRemaining > 0
                        ? 'bg-[#F9FAFB] dark:bg-[#374151] text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-[#F9FAFB] dark:bg-[#374151] text-slate-600 dark:text-slate-300 hover:bg-[#E2E8F0] dark:hover:bg-[#4B5563]'
                        }`}
                >
                    {t.generate}
                </button>
            </div>

            {message && (
                <div className="mt-6 text-center" role="status" aria-live="polite">
                    <div className={`text-base ${isSuccess
                        ? 'text-green-400'
                        : 'text-red-400'
                        }`}>
                        {message}
                        {timeRemaining > 0 && !message.endsWith('.') && !message.endsWith('!') && !message.endsWith('?') && '.'}
                        {timeRemaining > 0 && (
                            <span className="inline">
                                {' '}
                                {(rateLimitTemplates[language] || rateLimitTemplates.en).replace('{time}', formatTimeRemaining(timeRemaining))}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
