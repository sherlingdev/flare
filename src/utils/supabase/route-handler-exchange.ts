import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * Supabase client for Route Handlers that exchange OAuth codes.
 * Cookies must be written onto the **same** `NextResponse` you return (often a redirect);
 * using only `cookies()` from `next/headers` can omit `Set-Cookie` on redirect responses.
 */
export function createExchangeRouteHandlerClient(
    request: NextRequest,
    response: NextResponse
) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
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
