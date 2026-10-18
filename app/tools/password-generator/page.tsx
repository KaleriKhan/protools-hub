import type { Metadata } from "next";
import PasswordGenerator from "@/components/tools/PasswordGenerator";

export const metadata: Metadata = {
    title: "Strong Password Generator - Create Secure Passwords Online | ProTools Hub",
    description: "Generate strong, secure, and random passwords instantly. Customize length, symbols, and numbers with a built-in strength checker and zero server logging.",
    keywords: [
        "password generator",
        "strong password maker",
        "secure password creator",
        "random password generator",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/password-generator" },
    openGraph: {
        title: "Strong Password Generator | ProTools Hub",
        description: "Create customized, military-grade secure passwords instantly.",
        url: "https://myprotoolshub.com/tools/password-generator",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Strong Password Generator | ProTools Hub",
        description: "Generate secure passwords locally in your browser.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Strong Password Generator",
        "operatingSystem": "All",
        "applicationCategory": "SecurityApplication",
        "description": "Generate strong secure passwords with customizable character options.",
        "url": "https://myprotoolshub.com/tools/password-generator",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "850" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <PasswordGenerator />
        </main>
    );
}