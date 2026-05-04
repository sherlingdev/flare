import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * OAuth PKCE + email completion: exchange ?code= for a session.
 *
 * Uses a NextResponse prepared up front so `setAll` attaches session cookies to the same
 * redirect Supabase expects (Route Handler + `cookies()` from next/headers can drop Set-Cookie on redirects).
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    const code = requestUrl.searchParams.get("code");
    const nextRaw = requestUrl.searchParams.get("next");
    const next = nextRaw?.startsWith("/") ? nextRaw : "/";

    const type = requestUrl.searchParams.get("type");
    const accessToken = requestUrl.searchParams.get("access_token");

    const isRecovery =
        type === "recovery" ||
        (accessToken != null && requestUrl.searchParams.get("type") === "recovery");

    if (isRecovery && accessToken) {
        const tokenString = `#access_token=${encodeURIComponent(accessToken)}&type=recovery`;
        return NextResponse.redirect(new URL(`/auth/reset-password${tokenString}`, origin));
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (code) {
        if (!supabaseUrl || !supabaseKey) {
            console.error("[auth/callback] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
            const fail = new URL("/", origin);
            fail.searchParams.set("auth_error", "oauth_exchange_failed");
            return NextResponse.redirect(fail);
        }

        const successResponse = NextResponse.redirect(new URL(next, origin));

        const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        successResponse.cookies.set(name, value, options);
                    });
                },
            },
        });

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return successResponse;
        }

        console.error("[auth/callback] exchangeCodeForSession:", error.message);
        const fail = new URL("/", origin);
        fail.searchParams.set("auth_error", "oauth_exchange_failed");
        return NextResponse.redirect(fail);
    }

    return NextResponse.redirect(new URL("/", origin));
}
