import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Settings | Convert currencies instantly. Quick, safe, and always accurate.",
    description:
        "Manage your Flare account: profile, language, theme, base currency, and password.",
    keywords:
        "account settings, currency preferences, language, theme, password, Flare account",
    openGraph: {
        title: "Settings | Convert currencies instantly. Quick, safe, and always accurate.",
        description:
            "Manage your Flare account: profile, language, theme, base currency, and password.",
        type: "website",
        url: "https://flarexrate.com/settings",
    },
    twitter: {
        card: "summary",
        title: "Settings | Convert currencies instantly. Quick, safe, and always accurate.",
        description:
            "Manage your Flare account: profile, language, theme, base currency, and password.",
    },
    alternates: {
        canonical: "https://flarexrate.com/settings",
    },
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
