"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * OAuth PKCE completion (Google + GitHub via Supabase).
 *
 * `signInWithOAuth` stores the PKCE **code verifier** with `createBrowserClient` in this origin’s
 * cookies. On Netlify, `exchangeCodeForSession` in a Route Handler often fails (verifier not visible
 * to the server the same way). Completing the exchange here uses the **same** client + storage as
 * the login click — one flow, no duplicate server path.
 *
 * @see https://supabase.com/docs/guides/auth/sessions/pkce-flow
 */

function safeNextPath(raw: string | null): string {
    if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
        return "/";
    }
    return raw;
}

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const run = async () => {
            const code = searchParams.get("code");
            const next = safeNextPath(searchParams.get("next"));
            const type = searchParams.get("type");
            const accessToken = searchParams.get("access_token");

            if (type === "recovery" && accessToken != null) {
                window.location.replace(
                    `${window.location.origin}/auth/reset-password#access_token=${encodeURIComponent(accessToken)}&type=recovery`,
                );
                return;
            }

            if (!code) {
                router.replace("/");
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (!error) {
                window.location.replace(`${window.location.origin}${next}`);
                return;
            }

            console.error("[auth/callback] exchangeCodeForSession:", error.message);

            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                window.location.replace(`${window.location.origin}${next}`);
                return;
            }

            window.location.replace(
                `${window.location.origin}/?auth_error=oauth_exchange_failed`,
            );
        };

        void run();
    }, [router, searchParams]);

    return (
        <div className="flex min-h-[45vh] w-full flex-col items-center justify-center px-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Completing sign-in…</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[45vh] w-full items-center justify-center px-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
                </div>
            }
        >
            <CallbackContent />
        </Suspense>
    );
}
