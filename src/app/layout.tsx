import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import Layout from "../components/Layout";
import StructuredData from "../components/StructuredData";
import AdSenseScript from "../components/AdSenseScript";
import { LanguageProvider } from "../contexts/LanguageContext";
import Loader from "../components/Loader";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  description: "Convert between USD, EUR, and DOP with real-time exchange rates. Fast, secure, and reliable multi-currency converter with competitive rates.",
  keywords: "currency converter, USD to DOP, EUR to DOP, USD to EUR, exchange rates, multi-currency, dollar to peso, euro to peso, real-time rates, money transfer, forex",
  authors: [{ name: "Flare exchange rate" }],
  openGraph: {
    description: "Convert between USD, EUR, and DOP with real-time exchange rates. Fast, secure, and reliable multi-currency converter with competitive rates.",
    type: "website",
    locale: "en_US",
    url: "https://flarexrate.com",
    siteName: "Flare exchange rate",
  },
  twitter: {
    card: "summary_large_image",
    description: "Convert between USD, EUR, and DOP with real-time exchange rates. Fast, secure, and reliable multi-currency converter with competitive rates.",
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
      'es-ES': 'https://flarexrate.com/es',
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
    <html suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
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
        />
      </head>
      <body
        className={`${dmSans.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <ThemeProvider>
            <Loader />
            <StructuredData />
            <AdSenseScript />
            <Layout>
              {children}
            </Layout>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

