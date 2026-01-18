"use client";

import { useEffect } from "react";
// import { useEffect, useLayoutEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import { measurePerformance, measureWebVitals } from "@/lib/performance";
import CurrencyConverter from "@/components/CurrencyConverter";
import CurrencyCard from "@/components/CurrencyCard";


export default function Home() {
  const { language, mounted } = useLanguage();
  const t = translations[mounted ? language : "en"];

  useEffect(() => {
    if (mounted) {
      measurePerformance('Component Mount', () => {
        // Component mounted successfully
      });

      // Measure Web Vitals
      measureWebVitals();
    }
  }, [mounted, language]);


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

  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 homepage-vertical-center">
      {/* Header */}
      <div className="w-full max-w-6xl mb-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-flare-primary mb-4">
            Flare Exchange Rate
          </h1>
          <p className="text-base sm:text-xl text-flare-primary max-w-2xl mx-auto">
            {t.siteDescription}
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col items-center justify-center gap-6">
        <div className="w-full max-w-none">
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