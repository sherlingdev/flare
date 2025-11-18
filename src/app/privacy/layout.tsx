import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | Convert currencies instantly. Quick, safe, and always accurate.",
  description: "Read our privacy policy. Learn how we protect your personal information, handle data, use cookies, and comply with privacy regulations. Your privacy is important to us.",
  keywords: "privacy policy, data protection, cookie policy, GDPR compliance, user privacy, data security",
  openGraph: {
    title: "Privacy Policy | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Read our privacy policy. Learn how we protect your personal information and handle data.",
    type: "website",
    url: "https://flarexrate.com/privacy",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Convert currencies instantly. Quick, safe, and always accurate.",
    description: "Read our privacy policy. Learn how we protect your personal information and handle data.",
  },
  alternates: {
    canonical: "https://flarexrate.com/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

