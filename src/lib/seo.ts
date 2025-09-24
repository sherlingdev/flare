// SEO Configuration
export const seoConfig = {
    siteName: "Flare Exchange",
    siteUrl: "https://flare.com",
    defaultTitle: "USD to DOP Exchange Rate - Fast currency converter | Flare",
    defaultDescription: "Convert USD to DOP at competitive exchange rates. Real-time currency conversion with fast, secure, and reliable USD to Dominican peso exchange.",
    defaultKeywords: [
        "USD to DOP",
        "USD DOP exchange rate",
        "dollar to peso dominicano",
        "currency converter",
        "exchange rate",
        "money transfer",
        "forex",
        "Dominican peso",
        "USD conversion",
        "currency exchange",
        "real-time rates"
    ],
    social: {
        twitter: "@flareexchange",
        facebook: "flareexchange",
        instagram: "flareexchange"
    },
    verification: {
        google: "your-google-verification-code",
        yandex: "your-yandex-verification-code",
        yahoo: "your-yahoo-verification-code"
    }
};

// Generate structured data
export const generateStructuredData = () => {
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Flare Currency Converter",
        "description": "Fast and reliable USD to DOP currency converter with real-time exchange rates",
        "url": seoConfig.siteUrl,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "provider": {
            "@type": "Organization",
            "name": seoConfig.siteName,
            "url": seoConfig.siteUrl
        }
    };
};
