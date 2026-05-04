import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, validateApiKey, getClientIP } from "@/lib/rateLimiter";
import { updateSession } from "@/utils/supabase/proxy";

/** Attach cookies from the session refresh response onto another response (e.g. 429). */
function forwardAuthCookies(from: NextResponse, to: NextResponse) {
    from.cookies.getAll().forEach(({ name, value }) => {
        to.cookies.set(name, value);
    });
}

/**
 * Next.js 16 Proxy: refresh Supabase cookies on every matched request, then rate-limit /api/*.
 * https://nextjs.org/docs/app/getting-started/proxy
 */
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Supabase sometimes lands on Site URL root: `/?code=...` instead of `/auth/callback?code=...`
    // (e.g. redirectTo not applied / fallback). Hitting `/` first runs `updateSession` and can break
    // PKCE before client JS forwards. Redirect at the edge, preserving the full query string.
    if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
        const dest = request.nextUrl.clone();
        dest.pathname = "/auth/callback";
        return NextResponse.redirect(dest, 307);
    }

    // PKCE exchange runs in the browser on `app/auth/callback/page.tsx` — do not refresh session
    // before that page’s JS runs (can invalidate PKCE state on some hosts).
    if (pathname === "/auth/callback") {
        const passthrough = NextResponse.next({ request });
        passthrough.headers.set(
            "Cache-Control",
            "no-store, private, max-age=0, must-revalidate"
        );
        return passthrough;
    }

    const sessionResponse = await updateSession(request);

    if (!pathname.startsWith("/api/") || pathname.includes("/test-")) {
        return sessionResponse;
    }

    const rateLimitBypass = ["/api/payload", "/api/information/payload", "/api/historical"];
    if (rateLimitBypass.some((route) => pathname.startsWith(route))) {
        return sessionResponse;
    }

    if (pathname === "/api/api-key" && request.method === "GET") {
        return sessionResponse;
    }

    const ip = getClientIP(request.headers);
    const apiKey =
        request.headers.get("x-api-key") ||
        request.headers.get("authorization")?.replace("Bearer ", "");

    const isAuthenticated = apiKey ? !!(await validateApiKey(apiKey)) : false;
    const identifier =
        isAuthenticated && apiKey ? `api_${apiKey.substring(0, 16)}` : ip;

    const rateLimit = await checkRateLimit(identifier, isAuthenticated);

    if (rateLimit.allowed) {
        sessionResponse.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
        sessionResponse.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
        sessionResponse.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());
        return sessionResponse;
    }

    const denied = NextResponse.json(
        {
            success: false,
            error: "Rate limit exceeded",
            message: isAuthenticated
                ? `You have reached the rate limit of ${rateLimit.limit} request${rateLimit.limit > 1 ? "s" : ""} per minute. Please try again later.`
                : `You have exceeded the rate limit of ${rateLimit.limit} request${rateLimit.limit > 1 ? "s" : ""} per minute. Get an API key for higher limits.`,
            rateLimit: {
                limit: rateLimit.limit,
                remaining: rateLimit.remaining,
                reset: new Date(rateLimit.reset).toISOString(),
            },
            ...(isAuthenticated ? {} : { getApiKey: "https://flarexrate.com/key" }),
        },
        { status: 429 }
    );

    forwardAuthCookies(sessionResponse, denied);

    denied.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
    denied.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    denied.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());
    denied.headers.set(
        "Retry-After",
        Math.ceil((rateLimit.reset - Date.now()) / 1000).toString()
    );

    return denied;
}

export const config = {
    matcher: [
        /*
         * Match all paths except static assets (same idea as Supabase Next.js example).
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
