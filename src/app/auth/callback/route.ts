import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');
    const hash = requestUrl.hash;
    const accessToken = requestUrl.searchParams.get('access_token');

    // Handle password reset
    const isRecovery = type === 'recovery' ||
        hash?.includes('type=recovery') ||
        hash?.includes('type%3Drecovery') ||
        (accessToken && type === 'recovery');

    if (isRecovery) {
        let tokenString = hash || '';
        if (!tokenString && accessToken) {
            tokenString = `#access_token=${accessToken}&type=recovery`;
        } else if (!tokenString) {
            const token = requestUrl.searchParams.get('token');
            if (token) {
                tokenString = `#access_token=${token}&type=recovery`;
            }
        }
        return NextResponse.redirect(new URL(`/auth/reset-password${tokenString}`, requestUrl.origin));
    }

    // Handle OAuth
    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('OAuth exchange error:', error);
        }

        // Always redirect to production in production, localhost only in true localhost
        // Use 307 (temporary redirect) to ensure clean redirect without code
        const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
        const homeUrl = isLocalhost
            ? new URL('/', requestUrl.origin)
            : new URL('https://flarexrate.com/');

        // Ensure URL is completely clean
        homeUrl.search = '';
        homeUrl.hash = '';

        const response = NextResponse.redirect(homeUrl.toString(), { status: 307 });
        // Clear any potential code parameters from headers
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        // Set a cookie to prevent middleware from intercepting the redirect
        response.cookies.set('oauth_processed', '1', {
            maxAge: 10, // 10 seconds
            path: '/',
            httpOnly: false,
            sameSite: 'lax'
        });
        return response;
    }

    // No code - redirect to home
    const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
    const homeOrigin = isLocalhost ? requestUrl.origin : 'https://flarexrate.com';
    const homeUrl = new URL('/', homeOrigin);
    homeUrl.search = '';
    homeUrl.hash = '';
    return NextResponse.redirect(homeUrl.toString(), { status: 302 });
}
