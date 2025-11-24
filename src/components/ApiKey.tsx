'use client';

import { useState, useEffect } from 'react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { createClient } from '@/utils/supabase/client';
import Loader from '@/components/Loader';

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

    // Get user email from auth session
    useEffect(() => {
        const getUserEmail = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setUserEmail(session.user.email);
            }
        };

        if (mounted) {
            getUserEmail();
        }
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

            if (data.success) {
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



    if (!userEmail) {
        return <Loader show={true} />;
    }

    return (
        <>
            <Loader show={loading} />

            <div className="flex items-center justify-center">
                {/* Generate button only */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || timeRemaining > 0}
                    className={`inline-flex items-center justify-center px-6 py-3 text-base rounded-xl transition-colors select-none whitespace-nowrap ${loading || timeRemaining > 0
                        ? 'bg-indigo-600/60 text-gray-200 cursor-not-allowed'
                        : 'bg-indigo-600 text-gray-200 hover:bg-indigo-700'
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
