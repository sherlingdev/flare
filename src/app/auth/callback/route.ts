import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * OAuth PKCE + email magic-link completion: exchange ?code= for a session (sets cookies).
 * Recovery flows may send fragments (hash) — those are not visible here; keep reset-password client handling.
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
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
        return NextResponse.redirect(new URL(`/auth/reset-password${tokenString}`, requestUrl.origin));
    }

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(new URL(next, requestUrl.origin));
        }

        console.error("[auth/callback] exchangeCodeForSession:", error.message);
        const fail = new URL("/", requestUrl.origin);
        fail.searchParams.set("auth_error", "oauth_exchange_failed");
        return NextResponse.redirect(fail);
    }

    return NextResponse.redirect(new URL("/", requestUrl.origin));
}
