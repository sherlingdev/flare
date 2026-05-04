import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/utils/supabase/route-handler";

/**
 * Single OAuth / PKCE completion endpoint for Google & GitHub (same `redirectTo` from AuthModal).
 *
 * Flow: Supabase redirects here with `?code=` → `exchangeCodeForSession` → session cookies on redirect.
 *
 * @see https://supabase.com/docs/guides/auth/social-login/auth-github (Next.js route snippet)
 */

function noStore(res: NextResponse) {
    res.headers.set(
        "Cache-Control",
        "no-store, private, max-age=0, must-revalidate",
    );
    return res;
}

function safeNextPath(raw: string | null): string {
    const fallback = "/";
    if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
        return fallback;
    }
    return raw;
}

/** Public URL for redirects behind Netlify / other proxies (custom domain). */
function absoluteRedirectUrl(request: NextRequest, pathnameAndQuery: string): string {
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const isLocal = process.env.NODE_ENV === "development";

    if (isLocal) {
        return `${origin}${pathnameAndQuery}`;
    }

    if (forwardedHost) {
        const host = forwardedHost.split(",")[0].trim();
        const proto = (forwardedProto ?? "https").split(",")[0].trim();
        return `${proto}://${host}${pathnameAndQuery}`;
    }

    return `${origin}${pathnameAndQuery}`;
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = safeNextPath(requestUrl.searchParams.get("next"));

    const type = requestUrl.searchParams.get("type");
    const accessToken = requestUrl.searchParams.get("access_token");

    const isRecovery = type === "recovery" && accessToken != null;

    if (isRecovery) {
        const tokenString = `#access_token=${encodeURIComponent(accessToken)}&type=recovery`;
        return noStore(
            NextResponse.redirect(
                `${absoluteRedirectUrl(request, "/auth/reset-password")}${tokenString}`,
            ),
        );
    }

    if (code) {
        const successUrl = absoluteRedirectUrl(request, next);
        const redirectResponse = NextResponse.redirect(successUrl);
        const supabase = createSupabaseRouteHandlerClient(request, redirectResponse);
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return noStore(redirectResponse);
        }

        const err = error as { message: string; status?: number; code?: string };
        console.error("[auth/callback] exchangeCodeForSession failed:", {
            message: err.message,
            status: err.status,
            code: err.code,
        });

        return noStore(
            NextResponse.redirect(
                absoluteRedirectUrl(request, "/?auth_error=oauth_exchange_failed"),
            ),
        );
    }

    return noStore(NextResponse.redirect(absoluteRedirectUrl(request, "/")));
}
