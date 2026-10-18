import type { Metadata } from "next";
import JSONFormatter from "@/components/tools/JsonFormatter";

export const metadata: Metadata = {
    title: "JSON Formatter & Validator - Format & Minify JSON Online | ProTools Hub",
    description: "Format, validate, and minify JSON data instantly in your browser. Catch syntax errors with real-time reporting and customized indentation.",
    keywords: [
        "json formatter",
        "json validator",
        "json minifier",
        "format json online",
        "pretty print json",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/json-formatter" },
    openGraph: {
        title: "JSON Formatter & Validator | ProTools Hub",
        description: "Format, validate, and minify JSON data directly in your browser.",
        url: "https://myprotoolshub.com/tools/json-formatter",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "JSON Formatter & Validator | ProTools Hub",
        description: "Fast browser-based JSON formatting and validation tool.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "JSON Formatter & Validator",
        "operatingSystem": "All",
        "applicationCategory": "DeveloperApplication",
        "description": "Format, validate, and minify JSON online with real-time error detection.",
        "url": "https://myprotoolshub.com/tools/json-formatter",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "740" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <JSONFormatter />
        </main>
    );
}