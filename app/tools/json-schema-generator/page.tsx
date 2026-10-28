import type { Metadata } from "next";
import JsonSchemaGeneratorClient from "@/components/tools/JsonSchemaGeneratorClient";

export const metadata: Metadata = {
    title: "Free JSON-LD Schema & Structured Data Generator | ProTools Hub",
    description: "Generate Google-compliant JSON-LD structured data markup instantly for Articles, Organizations, WebSites, and Software Applications to boost SEO rankings and rich snippets.",
    keywords: [
        "json ld schema generator",
        "structured data generator tool",
        "schema markup generator",
        "google rich results tool",
        "seo schema builder free",
        "protools hub",
        "developer utility"
    ],
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: {
        canonical: "/tools/json-schema-generator"
    },
    openGraph: {
        title: "Free JSON-LD Schema & Structured Data Generator | ProTools Hub",
        description: "Create Google-compliant structured data markup instantly for high SEO rankings and rich snippets with 100% privacy.",
        url: "https://myprotoolshub.com/tools/json-schema-generator",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free JSON-LD Schema & Structured Data Generator | ProTools Hub",
        description: "Generate Google-compliant structured data markup instantly for high SEO rankings.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function JsonSchemaGeneratorPage() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "JSON-LD Schema & Structured Data Generator",
        "operatingSystem": "All",
        "applicationCategory": "DeveloperApplication",
        "description": "Generate Google-compliant JSON-LD structured data markup instantly for high SEO rankings.",
        "url": "https://myprotoolshub.com/tools/json-schema-generator",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            <JsonSchemaGeneratorClient />
        </main>
    );
}