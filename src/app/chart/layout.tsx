import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Chart | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "View historical currency exchange rate charts. Track currency trends and analyze exchange rate changes over the last 15 days with interactive charts.",
    keywords: "currency charts, exchange rate charts, historical rates, currency trends, forex charts, rate analysis",
    openGraph: {
        title: "Chart | Convert currencies instantly. Quick, safe, and always accurate.",
        description: "View historical currency exchange rate charts. Track currency trends and analyze exchange rate changes over the last 15 days.",
        type: "website",
        url: "https://flarexrate.com/chart",
    },
    twitter: {
        card: "summary",
        title: "Chart | Convert currencies instantly. Quick, safe, and always accurate.",
        description: "View historical currency exchange rate charts. Track currency trends and analyze exchange rate changes over the last 15 days.",
    },
    alternates: {
        canonical: "https://flarexrate.com/chart",
    },
};

export default function ChartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}


