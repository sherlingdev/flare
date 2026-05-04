/**
 * Base URL for Supabase `redirectTo` from the client (OAuth, signup confirmation, password reset).
 *
 * ### Flow (Google / GitHub via Supabase)
 *
 * 1. User clicks sign-in → `signInWithOAuth({ options: { redirectTo: <origin>/auth/callback } })`.
 * 2. Redirect to provider → Supabase → browser returns to `redirectTo` with `?code=`.
 * 3. `app/auth/callback/route.ts` (Server Route Handler) runs `exchangeCodeForSession` with
 *    `createClient` from `@/utils/supabase/server` per [Supabase social login + PKCE](https://supabase.com/docs/guides/auth/social-login).
 *    Redirects use `x-forwarded-host` so Netlify keeps the public domain (e.g. flarexrate.com).
 *
 * ### Why `window.location.origin` (no separate “canonical env” for OAuth)
 *
 * PKCE stores the verifier on the **origin where the flow started**. The redirect URI must be that
 * same origin’s `/auth/callback` (allow-listed in Supabase). Using the live browser origin is the
 * usual pattern for client-initiated OAuth and avoids production bugs where `NEXT_PUBLIC_SITE_URL`
 * was pointed at `*.netlify.app` while users open `flarexrate.com`.
 *
 * ### Supabase dashboard (required)
 *
 * Under **Authentication → URL Configuration → Redirect URLs**, include every origin you use, e.g.:
 * `https://flarexrate.com/auth/callback`, `http://localhost:3000/auth/callback`,
 * `https://*.netlify.app/auth/callback` for previews.
 *
 * Optional `NEXT_PUBLIC_SITE_URL` is only a fallback when this helper runs without `window` (should
 * not occur for current AuthModal-only usage).
 */
export function getAuthRedirectOrigin(): string {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
}
