import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Get API Key | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Get your free API key. Access real-time currency rates, convert currencies, and integrate our API into your applications. Quick setup, easy implementation.",
    keywords: "API key, free API key, currency API key, exchange rate API, get API key, API access, currency converter API",
    openGraph: {
        title: "Get API Key | Convert currencies instantly. Quick, safe, and always accurate.",
        description: "Get your free API key. Access real-time currency rates and integrate our API into your applications.",
        type: "website",
        url: "https://flarexrate.com/key",
    },
    twitter: {
        card: "summary",
        title: "Get API Key | Convert currencies instantly. Quick, safe, and always accurate.",
        description: "Get your free API key. Access real-time currency rates and integrate our API into your applications.",
    },
    alternates: {
        canonical: "https://flarexrate.com/key",
    },
};

export default function KeyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

