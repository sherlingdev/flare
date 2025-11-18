import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Us | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Learn about our mission to provide accurate real-time currency conversion rates for 160+ currencies worldwide. Built with modern web technologies for fast and reliable service.",
    keywords: "about flare exchange rate, currency converter about, exchange rate service, real-time currency rates, multi-currency converter",
    openGraph: {
        title: "About Us | Convert currencies instantly. Quick, safe, and always accurate.",
        description: "Learn about our mission to provide accurate real-time currency conversion rates for 160+ currencies worldwide.",
        type: "website",
        url: "https://flarexrate.com/about",
    },
    twitter: {
        card: "summary",
        title: "About Us | Convert currencies instantly. Quick, safe, and always accurate.",
        description: "Learn about our mission to provide accurate real-time currency conversion rates for 160+ currencies worldwide.",
    },
    alternates: {
        canonical: "https://flarexrate.com/about",
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

