import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Schema from "@/components/Schema";
import AdSenseScript from "@/components/AdSenseScript";
import AdsterraScript from "@/components/AdsterraScript";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import Loader from "@/components/Loader";
import { ConverterProvider } from "@/contexts/ConverterContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import type { Metadata } from "next";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "Flare Exchange Rate | Convert currencies instantly. Quick, safe, and always accurate.",
  description: "Convert currencies instantly. Quick, safe, and always accurate.",
  keywords: "currency converter, USD to DOP, EUR to DOP, USD to EUR, exchange rates, multi-currency, dollar to peso, euro to peso, real-time rates, money transfer, forex, currency exchange, peso dominicano, euro to dollar",
  authors: [{ name: "Flare Exchange Rate" }],
  openGraph: {
    title: "Flare Exchange Rate | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Convert currencies instantly. Quick, safe, and always accurate.",
    type: "website",
    locale: "en_US",
    url: "https://flarexrate.com",
    siteName: "Flare Exchange Rate",
  },
  twitter: {
    card: "summary",
    title: "Flare Exchange Rate | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Convert currencies instantly. Quick, safe, and always accurate.",
    creator: "@flarexrate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://flarexrate.com",
    languages: {
      'en-US': 'https://flarexrate.com',
      'es-ES': 'https://flarexrate.com',
      'fr-FR': 'https://flarexrate.com',
      'pt-BR': 'https://flarexrate.com',
      'de-DE': 'https://flarexrate.com',
      'zh-CN': 'https://flarexrate.com',
      'it-IT': 'https://flarexrate.com',
    },
  },
  category: "Finance",
  classification: "Currency Exchange",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

        {/* Resource Hints for Performance - Critical for LCP improvement */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.xe.com" />
        <link rel="dns-prefetch" href="//pl27886264.effectivegatecpm.com" />
        <link rel="dns-prefetch" href="https://fundingchoicesmessages.google.com" />

        {/* Preload critical API endpoint */}
        <link rel="preload" href="/api/payload" as="fetch" crossOrigin="anonymous" />
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Set default dark theme
                  document.documentElement.classList.add('dark');
                  
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Set language from localStorage
                  const language = localStorage.getItem('language');
                  const finalLanguage = (language === 'es' || language === 'en') ? language : 'en';
                  
                  document.documentElement.setAttribute('lang', finalLanguage);
                  
                  // Set dynamic title immediately based on current page and language
                  const currentPath = window.location.pathname;
                  const titles = {
                    'en': {
                      '/': 'Flare exchange rate | Real-time currency converter',
                      '/terms': 'Terms and conditions | Flare exchange rate',
                      '/privacy': 'Privacy policy | Flare exchange rate',
                      '/about': 'About us | Flare exchange rate'
                    },
                    'es': {
                      '/': 'Flare exchange rate | Convertidor de monedas en tiempo real',
                      '/terms': 'Términos y condiciones | Flare exchange rate',
                      '/privacy': 'Política de privacidad | Flare exchange rate',
                      '/about': 'Acerca de nosotros | Flare exchange rate'
                    }
                  };
                  
                  const pageTitle = titles[finalLanguage]?.[currentPath] || titles['en']['/'];
                  document.title = pageTitle;
                  
                } catch (e) {
                  // Fallback
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('lang', 'en');
                  document.documentElement.setAttribute('data-language', 'en');
                }
              })();
            `,
          }}
        /> */}
      </head>
      <body
        className={`${dmSans.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <LoadingProvider>
            <ConverterProvider>
              <ThemeProvider>
                <AuthModalProvider>
                  <Loader />
                  <Schema />
                  <AdsterraScript />
                  <AdSenseScript />
                  <GoogleAnalytics />
                  <Layout>
                    {children}
                  </Layout>
                </AuthModalProvider>
              </ThemeProvider>
            </ConverterProvider>
          </LoadingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

