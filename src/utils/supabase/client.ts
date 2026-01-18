import { createBrowserClient } from "@supabase/ssr";
import type { Database } from '@/types/supabase';

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
        );
    }

    // Get current hostname to ensure cookies are scoped to the correct domain
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isProduction = hostname === 'flarexrate.com';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    return createBrowserClient<Database>(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return document.cookie.split('; ').map(cookie => {
                        const [name, ...rest] = cookie.split('=');
                        return { name, value: rest.join('=') };
                    });
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        if (value) {
                            // Build cookie string with security options
                            const cookieParts: string[] = [`${name}=${value}`];

                            // Set SameSite to Lax for security (prevents CSRF while allowing normal navigation)
                            cookieParts.push('SameSite=Lax');

                            // Set Secure flag in production (HTTPS only)
                            if (isProduction) {
                                cookieParts.push('Secure');
                            }

                            // Set path (default to root)
                            cookieParts.push(`Path=${options?.path || '/'}`);

                            // CRITICAL: Only set domain for production, and only if explicitly provided
                            // Never set domain for localhost or subdomains to prevent cookie sharing
                            if (options?.domain && isProduction && !isLocalhost) {
                                // Only use the domain if it matches the current hostname
                                // This prevents cookies from being set for other domains
                                if (options.domain === hostname || options.domain === `.${hostname}`) {
                                    cookieParts.push(`Domain=${options.domain}`);
                                }
                            }

                            // Set max age or expires
                            if (options?.maxAge !== undefined) {
                                cookieParts.push(`Max-Age=${options.maxAge}`);
                            } else if (options?.expires) {
                                cookieParts.push(`Expires=${options.expires.toUTCString()}`);
                            }

                            document.cookie = cookieParts.join('; ');
                        } else {
                            // Delete cookie - ensure it's deleted for current domain and path
                            const deleteParts: string[] = [
                                `${name}=`,
                                `Path=${options?.path || '/'}`,
                                'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
                                'SameSite=Lax'
                            ];

                            // Delete for current domain
                            document.cookie = deleteParts.join('; ');

                            // Also try to delete with domain if it was set
                            if (options?.domain && isProduction && !isLocalhost) {
                                deleteParts.push(`Domain=${options.domain}`);
                                document.cookie = deleteParts.join('; ');
                            }
                        }
                    });
                },
            },
        }
    );
};

