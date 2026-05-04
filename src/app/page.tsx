"use client";

import { useEffect, useState } from "react";
// import { useEffect, useLayoutEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { measurePerformance, measureWebVitals } from "@/lib/performance";
import CurrencyConverter from "@/components/CurrencyConverter";
import CurrencyCard from "@/components/CurrencyCard";
import { createClient } from "@/utils/supabase/client";
import { getOAuthCallbackUrl } from "@/lib/publicSiteUrl";


export default function Home() {
  const { language, mounted } = useLanguage();
  const t = translations[mounted ? language : "en"];
  const [showOauthErrorBanner, setShowOauthErrorBanner] = useState(false);

  /** `app/auth/callback/route.ts` redirects here with `?auth_error=oauth_exchange_failed` on exchange failure */
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth_error") !== "oauth_exchange_failed") return;
    setShowOauthErrorBanner(true);
    params.delete("auth_error");
    const qs = params.toString();
    const clean =
      window.location.pathname +
      (qs ? `?${qs}` : "") +
      window.location.hash;
    window.history.replaceState(null, "", clean);
  }, [mounted]);

  /** If the user is actually signed in, never keep the OAuth exchange error banner up. */
  useEffect(() => {
    if (!mounted) return;
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setShowOauthErrorBanner(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setShowOauthErrorBanner(false);
    });
    return () => subscription.unsubscribe();
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      measurePerformance('Component Mount', () => {
        // Component mounted successfully
      });

      // Measure Web Vitals
      measureWebVitals();
    }
  }, [mounted, language]);


  // OAuth sometimes lands with ?code= on "/" — forward to /auth/callback on same origin (PKCE cookies).
  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === "/" && params.get("code")) {
      window.location.replace(
        `${getOAuthCallbackUrl()}?${params.toString()}`
      );
    }
  }, [mounted]);

  // Detect reset password token in URL hash/search params and redirect to reset password page
  useEffect(() => {
    if (!mounted) return;

    const checkResetToken = () => {
      // Check both hash and search params (Supabase can use either)
      const hash = window.location.hash;
      const search = window.location.search;
      const fullUrl = window.location.href;
      const searchParams = new URLSearchParams(search);

      // Get token from hash
      const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null;
      const accessTokenFromHash = hashParams?.get('access_token');
      const typeFromHash = hashParams?.get('type');

      // Get token from search params
      const accessTokenFromSearch = searchParams.get('access_token');
      const typeFromSearch = searchParams.get('type');
      const tokenFromSearch = searchParams.get('token'); // Supabase sometimes uses 'token' instead of 'access_token'

      const accessToken = accessTokenFromHash || accessTokenFromSearch || tokenFromSearch;
      const type = typeFromHash || typeFromSearch;

      // Also check if hash/search/url contains recovery type directly
      const hasRecoveryToken =
        (hash && (hash.includes('type=recovery') || hash.includes('type%3Drecovery'))) ||
        (search && (search.includes('type=recovery') || search.includes('type%3Drecovery'))) ||
        (fullUrl && (fullUrl.includes('type=recovery') || fullUrl.includes('type%3Drecovery')));

      // Only redirect from homepage, not from other pages (like /auth/reset-password)
      if (window.location.pathname === '/' && ((accessToken && type === 'recovery') || hasRecoveryToken)) {
        // Preserve the hash or search params
        let tokenString = '';
        if (hash) {
          tokenString = hash;
        } else if (search) {
          // Convert search params to hash format
          if (accessToken && type) {
            tokenString = `#access_token=${accessToken}&type=${type}`;
          } else if (tokenFromSearch && typeFromSearch) {
            tokenString = `#access_token=${tokenFromSearch}&type=${typeFromSearch}`;
          } else {
            tokenString = search;
          }
        } else if (accessToken && type) {
          tokenString = `#access_token=${accessToken}&type=${type}`;
        } else if (tokenFromSearch && typeFromSearch) {
          tokenString = `#access_token=${tokenFromSearch}&type=${typeFromSearch}`;
        }

        if (tokenString) {
          // Use window.location.replace to avoid adding to history
          const redirectUrl = `/auth/reset-password${tokenString}`;
          window.location.replace(redirectUrl);
          return;
        }
      }

    };

    // Check immediately
    checkResetToken();

    // Check multiple times with delays to catch late hash/search updates
    const timeout1 = setTimeout(checkResetToken, 50);
    const timeout2 = setTimeout(checkResetToken, 200);
    const timeout3 = setTimeout(checkResetToken, 500);
    const timeout4 = setTimeout(checkResetToken, 1000);
    const timeout5 = setTimeout(checkResetToken, 2000);

    // Also listen for hash and popstate changes
    window.addEventListener('hashchange', checkResetToken);
    window.addEventListener('popstate', checkResetToken);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      clearTimeout(timeout5);
      window.removeEventListener('hashchange', checkResetToken);
      window.removeEventListener('popstate', checkResetToken);
    };
  }, [mounted]);

  const tt = t as typeof translations["en"] & {
    oauthExchangeFailedTitle?: string;
    oauthExchangeFailedBody?: string;
    oauthErrorDismiss?: string;
  };

  return (
    <main className="relative z-10 w-full min-w-0 flex flex-col items-center justify-center px-3 sm:px-6 lg:px-8 homepage-vertical-center">
      {showOauthErrorBanner && (
        <div
          className="w-full max-w-6xl px-4 sm:px-8 mb-4 order-first"
          role="alert"
        >
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 px-4 py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-left">
            <div className="min-w-0">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                {tt.oauthExchangeFailedTitle ?? "Couldn’t complete sign-in"}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200/95 mt-1">
                {tt.oauthExchangeFailedBody ??
                  "Try signing in again in this tab and allow cookies for this site."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOauthErrorBanner(false)}
              className="shrink-0 self-end sm:self-center rounded-lg px-3 py-1.5 text-sm font-medium bg-amber-200/80 text-amber-950 hover:bg-amber-300/90 dark:bg-amber-900/80 dark:text-amber-100 dark:hover:bg-amber-800"
            >
              {tt.oauthErrorDismiss ?? "Got it"}
            </button>
          </div>
        </div>
      )}
      {/* Header — two lines: Convert currencies instantly. + Quick, safe... */}
      <div className="w-full max-w-6xl py-3 sm:py-6 lg:py-8 px-4 sm:px-8 mb-0">
        <h1 className="text-center text-2xl sm:text-5xl lg:text-6xl font-bold text-flare-primary w-full max-w-full">
          {(t as { taglineTitle?: string }).taglineTitle ?? "Convert currencies instantly"}
        </h1>
        <p className="text-center text-sm sm:text-base lg:text-xl text-flare-primary mt-2 sm:mt-2.5 w-full max-w-full">
          {(t as { taglineSubtitle?: string }).taglineSubtitle ?? "Quick, safe, and always accurate"}
        </p>
      </div>

      <div className="w-full max-w-6xl min-w-0 flex flex-col items-center justify-center gap-3 sm:gap-5">
        <div className="w-full max-w-none min-w-0">
          <CurrencyCard>
            <CurrencyConverter />
          </CurrencyCard>
        </div>
      </div>

      {/* Live Exchange Rates Display */}
      <div className="mt-4 animate-fade-in">
        {/* <LastUpdated /> */}
      </div>


    </main>
  );
}