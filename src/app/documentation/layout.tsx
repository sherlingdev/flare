import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Documentation | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Complete API documentation. Get real-time currency rates, convert currencies, access historical data, and integrate our API into your applications. Free API key available.",
    keywords: "currency converter API, exchange rate API, currency API documentation, real-time rates API, free currency API, API key, REST API",
    openGraph: {
        title: "Documentation | Convert currencies instantly. Quick, safe, and always accurate.",
        description: "Complete API documentation. Get real-time currency rates, convert currencies, and access historical data.",
        type: "website",
        url: "https://flarexrate.com/documentation",
    },
    twitter: {
        card: "summary",
        title: "Documentation | Convert currencies instantly. Quick, safe, and always accurate.",
        description: "Complete API documentation. Get real-time currency rates, convert currencies, and access historical data.",
    },
    alternates: {
        canonical: "https://flarexrate.com/documentation",
    },
};

export default function DocumentationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

