import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Currency Information | Convert currencies instantly. Quick, safe, and always accurate.",
  description: "Get detailed information about currencies worldwide. Learn about currency codes, symbols, countries, banknotes, coins, and central banks for 160+ currencies.",
  keywords: "currency information, currency details, currency codes, currency symbols, banknotes, coins, central banks, currency data",
  openGraph: {
    title: "Currency Information | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Get detailed information about currencies worldwide. Learn about currency codes, symbols, countries, and central banks.",
    type: "website",
    url: "https://flarexrate.com/information",
  },
  twitter: {
    card: "summary",
    title: "Currency Information | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Get detailed information about currencies worldwide. Learn about currency codes, symbols, countries, and central banks.",
  },
  alternates: {
    canonical: "https://flarexrate.com/information",
  },
};

export default function InformationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

