import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flare - Fast Currency Exchange",
  description: "Exchange currencies at the best rates with Flare. Fast, secure, and reliable currency conversion with real-time rates and instant transfers.",
  keywords: "currency exchange, money transfer, forex, exchange rates, international transfer, currency converter",
  authors: [{ name: "Flare" }],
  openGraph: {
    title: "Flare - Fast Currency Exchange",
    description: "Exchange currencies at the best rates with Flare. Fast, secure, and reliable currency conversion.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flare - Fast Currency Exchange",
    description: "Exchange currencies at the best rates with Flare.",
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
      </head>
      <body
        className={`${dmSans.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
