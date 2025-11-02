'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import Loader from '@/components/Loader';

export default function ApiKeyRequest() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : 'en'];
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [messageKey, setMessageKey] = useState<'success' | 'networkError' | 'invalidEmail' | 'serverError' | null>(null);
    const [serverMessage, setServerMessage] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [rateLimitReset, setRateLimitReset] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get translated message based on messageKey
    const getMessage = () => {
        if (!messageKey) return '';

        if (messageKey === 'success') {
            return t.apiKeySuccess;
        } else if (messageKey === 'networkError') {
            return t.apiKeyNetworkError;
        } else if (messageKey === 'invalidEmail') {
            return language === 'en'
                ? 'Invalid email address'
                : language === 'es'
                    ? 'Dirección de correo electrónico inválida'
                    : language === 'fr'
                        ? 'Adresse e-mail invalide'
                        : 'Endereço de e-mail inválido';
        } else if (messageKey === 'serverError') {
            return serverMessage || t.apiKeyNetworkError;
        }
        return '';
    };

    const message = getMessage();

    useEffect(() => {
        // Enfocar el input cuando el componente se monte
        if (mounted && inputRef.current) {
            inputRef.current.focus();
        }
    }, [mounted]);

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
        if (!email) return;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessageKey('invalidEmail');
            setServerMessage('');
            setIsSuccess(false);
            // Clean input and focus again for better UX
            setEmail('');
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 0);
            return;
        }

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
                    email,
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



    return (
        <>
            <Loader show={loading} />

            <div className="flex items-center gap-4">
                {/* Email Input only; submit with Enter */}
                <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
                        <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !loading && email) {
                                    handleSubmit();
                                }
                            }}
                            placeholder={t.apiKeyEmailPlaceholder}
                            required
                            className="currency-input w-full border-none outline-none bg-transparent text-base"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !email || timeRemaining > 0}
                    className={`inline-flex items-center justify-center px-6 py-4 sm:py-5 text-base rounded-xl transition-colors select-none whitespace-nowrap flex-shrink-0 ${loading || !email || timeRemaining > 0
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
                                {language === 'en'
                                    ? `Please wait ${formatTimeRemaining(timeRemaining)} before trying again`
                                    : language === 'es'
                                        ? `Por favor espera ${formatTimeRemaining(timeRemaining)} antes de intentar de nuevo`
                                        : language === 'fr'
                                            ? `Veuillez attendre ${formatTimeRemaining(timeRemaining)} avant de réessayer`
                                            : `Por favor, aguarde ${formatTimeRemaining(timeRemaining)} antes de tentar novamente`}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
