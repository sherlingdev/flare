import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import StructuredData from "../components/StructuredData";
import AdSenseScript from "../components/AdSenseScript";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "Currency Converter | Flare",
  description: "Convert between USD, EUR, and DOP with real-time exchange rates. Fast, secure, and reliable multi-currency converter with competitive rates.",
  keywords: "currency converter, USD to DOP, EUR to DOP, USD to EUR, exchange rates, multi-currency, dollar to peso, euro to peso, real-time rates, money transfer, forex",
  authors: [{ name: "Flare Exchange" }],
  openGraph: {
    title: "Currency Converter | Flare",
    description: "Convert between USD, EUR, and DOP with real-time exchange rates. Fast, secure, and reliable multi-currency converter.",
    type: "website",
    locale: "en_US",
    url: "https://flare.com",
    siteName: "Flare Exchange",
  },
  twitter: {
    card: "summary_large_image",
    title: "Currency Converter",
    description: "Convert between USD, EUR, and DOP with real-time exchange rates. Fast, secure, and reliable multi-currency converter.",
    creator: "@flareexchange",
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
    canonical: "https://flare.com",
    languages: {
      'en-US': 'https://flare.com',
      'es-ES': 'https://flare.com/es',
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Set default dark theme to prevent hydration mismatch
                document.documentElement.classList.add('dark');
                
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                // Fallback to dark theme
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <StructuredData />
          <AdSenseScript />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
