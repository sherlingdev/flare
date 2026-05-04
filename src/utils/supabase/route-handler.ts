import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * Supabase client for App Router **Route Handlers** performing OAuth code exchange.
 *
 * `cookies()` from `next/headers` does not reliably attach `Set-Cookie` to `NextResponse.redirect`
 * in all Next.js versions. Cookie writes must target the **same** `NextResponse` you return.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export function createSupabaseRouteHandlerClient(
    request: NextRequest,
    response: NextResponse,
) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
        );
    }

    return createServerClient<Database>(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });
}
