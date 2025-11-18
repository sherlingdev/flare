import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms and Conditions | Convert currencies instantly. Quick, safe, and always accurate.",
  description: "Read our terms and conditions. Understand the terms of use for our currency converter service, API usage, and user responsibilities.",
  keywords: "terms and conditions, terms of service, user agreement, service terms, legal terms",
  openGraph: {
    title: "Terms and Conditions | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Read our terms and conditions. Understand the terms of use for our currency converter service.",
    type: "website",
    url: "https://flarexrate.com/terms",
  },
  twitter: {
    card: "summary",
    title: "Terms and Conditions | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Read our terms and conditions. Understand the terms of use for our currency converter service.",
  },
  alternates: {
    canonical: "https://flarexrate.com/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

