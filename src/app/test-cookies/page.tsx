"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function TestCookiesPage() {
    const [cookieInfo, setCookieInfo] = useState<{
        allCookies: Array<{ name: string; value: string }>;
        supabaseCookies: Array<{ name: string; value: string; fullValue: string }>;
        sessionInfo: {
            user: { id: string; email: string | undefined } | null;
            accessToken: string | null;
            expiresAt: string | null;
        };
        hostname: string;
        protocol: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkCookies = async () => {
            const supabase = createClient();

            // Get session
            const { data: { session } } = await supabase.auth.getSession();

            // Parse all cookies
            const allCookies = document.cookie.split('; ').map(cookie => {
                const [name, ...rest] = cookie.split('=');
                return { name, value: rest.join('=') };
            });

            // Get Supabase cookies with details
            const supabaseCookies = allCookies
                .filter(cookie => cookie.name.startsWith('sb-'))
                .map(cookie => ({
                    name: cookie.name,
                    value: cookie.value.substring(0, 50) + (cookie.value.length > 50 ? '...' : ''),
                    fullValue: cookie.value,
                }));

            setCookieInfo({
                allCookies,
                supabaseCookies,
                sessionInfo: {
                    user: session?.user ? {
                        id: session.user.id,
                        email: session.user.email,
                    } : null,
                    accessToken: session?.access_token ? session.access_token.substring(0, 20) + '...' : null,
                    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
                },
                hostname: window.location.hostname,
                protocol: window.location.protocol,
            });

            setLoading(false);
        };

        checkCookies();
    }, []);

    const testCookieSetting = () => {
        const supabase = createClient();
        // This will trigger cookie setting
        supabase.auth.getSession();
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Cargando información de cookies...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    Test de Configuración de Cookies
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Información del Entorno
                    </h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>Hostname:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cookieInfo?.hostname}</code></p>
                        <p><strong>Protocol:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cookieInfo?.protocol}</code></p>
                        <p><strong>Es producción:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cookieInfo?.hostname === 'flarexrate.com' ? 'Sí' : 'No'}</code></p>
                        <p><strong>Es localhost:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{(cookieInfo?.hostname === 'localhost' || cookieInfo?.hostname === '127.0.0.1') ? 'Sí' : 'No'}</code></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Cookies de Supabase ({cookieInfo?.supabaseCookies.length || 0})
                    </h2>
                    {cookieInfo?.supabaseCookies.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No hay cookies de Supabase. <button onClick={testCookieSetting} className="text-blue-600 dark:text-blue-400 underline">Haz clic aquí para forzar la creación de cookies</button></p>
                    ) : (
                        <div className="space-y-4">
                            {cookieInfo?.supabaseCookies.map((cookie, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                                    <p className="font-mono text-sm break-all">
                                        <strong className="text-gray-900 dark:text-white">Nombre:</strong> <span className="text-gray-700 dark:text-gray-300">{cookie.name}</span>
                                    </p>
                                    <p className="font-mono text-sm break-all mt-2">
                                        <strong className="text-gray-900 dark:text-white">Valor (primeros 50 chars):</strong> <span className="text-gray-700 dark:text-gray-300">{cookie.value}</span>
                                    </p>
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400">Ver valor completo</summary>
                                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs break-all overflow-auto max-h-40">
                                            {cookie.fullValue}
                                        </pre>
                                    </details>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Información de Sesión
                    </h2>
                    {cookieInfo?.sessionInfo.user ? (
                        <div className="space-y-2 text-sm">
                            <p><strong>Usuario ID:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cookieInfo.sessionInfo.user.id}</code></p>
                            <p><strong>Email:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cookieInfo.sessionInfo.user.email}</code></p>
                            <p><strong>Token (primeros 20 chars):</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cookieInfo.sessionInfo.accessToken}</code></p>
                            <p><strong>Expira:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{cookieInfo.sessionInfo.expiresAt}</code></p>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">No hay sesión activa. Por favor, inicia sesión primero.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Todas las Cookies ({cookieInfo?.allCookies.length || 0})
                    </h2>
                    <div className="space-y-2">
                        {cookieInfo?.allCookies.map((cookie, index) => (
                            <p key={index} className="font-mono text-xs break-all">
                                <span className={cookie.name.startsWith('sb-') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-400'}>
                                    {cookie.name}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500"> = </span>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {cookie.value.length > 50 ? cookie.value.substring(0, 50) + '...' : cookie.value}
                                </span>
                            </p>
                        ))}
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-900 dark:text-yellow-200">
                        Cómo Verificar que Funciona
                    </h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
                        <li>Abre las DevTools del navegador (F12)</li>
                        <li>Ve a la pestaña &quot;Application&quot; (Chrome) o &quot;Storage&quot; (Firefox)</li>
                        <li>En el menú lateral, expande &quot;Cookies&quot; y selecciona tu dominio</li>
                        <li>Verifica que las cookies de Supabase (que empiezan con &quot;sb-&quot;) tengan:
                            <ul className="list-disc list-inside ml-6 mt-1">
                                <li><strong>Domain:</strong> Debe ser exactamente tu hostname (localhost, 127.0.0.1, o flarexrate.com) - NO debe tener un punto al inicio (como .flarexrate.com)</li>
                                <li><strong>Path:</strong> Debe ser &quot;/&quot;</li>
                                <li><strong>SameSite:</strong> Debe ser &quot;Lax&quot;</li>
                                <li><strong>Secure:</strong> Solo debe estar marcado si estás en HTTPS</li>
                            </ul>
                        </li>
                        <li>Prueba abriendo la misma URL en una ventana de incógnito o en otro navegador - NO deberías estar logueado automáticamente</li>
                    </ol>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Refrescar Información
                    </button>
                </div>
            </div>
        </div>
    );
}

