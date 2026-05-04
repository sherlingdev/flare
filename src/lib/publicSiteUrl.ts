/**
 * Canonical origin for Supabase auth redirects (OAuth, email links, reset password).
 *
 * Set **NEXT_PUBLIC_SITE_URL=https://flarexrate.com** in Netlify (Production) so OAuth
 * `redirectTo` points at the custom domain — Google/GitHub return there instead of `*.netlify.app`.
 *
 * Leave unset for local dev and branch deploy previews — falls back to `window.location.origin`.
 */
export function getAuthRedirectOrigin(): string {
    const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (raw) return raw.replace(/\/$/, "");
    if (typeof window !== "undefined") return window.location.origin;
    return "";
}
