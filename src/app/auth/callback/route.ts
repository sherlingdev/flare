import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const hash = requestUrl.hash;
    const type = requestUrl.searchParams.get('type');
    const accessToken = requestUrl.searchParams.get('access_token');

    // Check if this is a password reset request
    // Supabase can send type=recovery in query params or hash
    const isRecovery = type === 'recovery' ||
        hash?.includes('type=recovery') ||
        hash?.includes('type%3Drecovery');

    if (isRecovery || (accessToken && type === 'recovery')) {
        // Build the hash string with the token
        let tokenString = '';
        if (hash) {
            tokenString = hash;
        } else if (accessToken) {
            tokenString = `#access_token=${accessToken}&type=recovery`;
        } else {
            // Try to get from query params
            const token = requestUrl.searchParams.get('token');
            if (token) {
                tokenString = `#access_token=${token}&type=recovery`;
            }
        }

        // Redirect to reset password page with the token
        return NextResponse.redirect(new URL(`/auth/reset-password${tokenString}`, requestUrl.origin));
    }

    if (code) {
        const supabase = await createClient();
        await supabase.auth.exchangeCodeForSession(code);

        // Get redirect path, default to home
        const redirectPath = requestUrl.searchParams.get('redirect') || '/';
        const safeRedirect = redirectPath.startsWith('/') ? redirectPath.split('?')[0].split('#')[0] : '/';

        // Redirect to clean URL using absolute URL
        const redirectUrl = new URL(safeRedirect, requestUrl.origin);
        redirectUrl.search = '';
        redirectUrl.hash = '';

        // Use 302 (Found) redirect - simpler and more reliable
        return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
    }

    // If there's no code, redirect to home (clean URL)
    const homeUrl = new URL('/', requestUrl.origin);
    homeUrl.search = '';
    homeUrl.hash = '';
    return NextResponse.redirect(homeUrl);
}

