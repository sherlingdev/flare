/**
 * Origin used in Supabase `redirectTo` (OAuth, magic links, reset password).
 *
 * - **Production domain** (`flarexrate.com`): uses `NEXT_PUBLIC_SITE_URL` when set so OAuth returns to the custom domain, not `*.netlify.app`.
 * - **Netlify deploy previews** (`*.netlify.app`): **always** uses `window.location.origin`. PKCE stores the code verifier on the origin that starts the login; forcing `NEXT_PUBLIC_SITE_URL` here breaks exchange when testing from a preview URL.
 * - **Local**: falls back to current origin when env is unset.
 */
export function getAuthRedirectOrigin(): string {
    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        if (host.endsWith(".netlify.app")) {
            return window.location.origin;
        }
        if (fromEnv) return fromEnv;
        return window.location.origin;
    }

    return fromEnv ?? "";
}
