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
        await supabase.auth.exchangeCodeForSession(code);

        // Always redirect to production in production, localhost only in true localhost
        const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
        const homeOrigin = isLocalhost ? requestUrl.origin : 'https://flarexrate.com';
        const homeUrl = new URL('/', homeOrigin);
        homeUrl.search = '';
        homeUrl.hash = '';
        return NextResponse.redirect(homeUrl.toString(), { status: 302 });
    }

    // No code - redirect to home
    const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
    const homeOrigin = isLocalhost ? requestUrl.origin : 'https://flarexrate.com';
    const homeUrl = new URL('/', homeOrigin);
    homeUrl.search = '';
    homeUrl.hash = '';
    return NextResponse.redirect(homeUrl.toString(), { status: 302 });
}
