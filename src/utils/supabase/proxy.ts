import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * Refreshes the Supabase session on every matched request (Next.js Proxy).
 * Follows https://supabase.com/docs/guides/auth/server-side/nextjs (Proxy + cookie handling).
 *
 * Use getUser() on the server so the JWT is validated; avoid getSession() in server code only.
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("[Supabase proxy] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
        return supabaseResponse;
    }

    const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => {
                    request.cookies.set(name, value);
                });
                supabaseResponse = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) => {
                    supabaseResponse.cookies.set(name, value, options);
                });
            },
        },
    });

    // Do not run logic between createServerClient and getUser — avoids flaky sessions.
    await supabase.auth.getUser();

    // Prevent CDN/browser caching of personalized responses (session refresh sets cookies).
    supabaseResponse.headers.set(
        "Cache-Control",
        "no-store, private, max-age=0, must-revalidate"
    );

    return supabaseResponse;
}
