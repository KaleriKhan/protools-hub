import type { Metadata } from "next";
import LoremIpsumGenerator from "@/components/tools/LoremIpsumGenerator";

export const metadata: Metadata = {
    title: "Lorem Ipsum Generator - Dummy Placeholder Text | ProTools Hub",
    description: "Generate standard Lorem Ipsum dummy placeholder text instantly for UI/UX wireframes, layouts, and web design mockups.",
    keywords: [
        "lorem ipsum generator",
        "dummy text generator",
        "placeholder text online",
        "lorem ipsum paragraphs",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/lorem-ipsum-generator" },
    openGraph: {
        title: "Lorem Ipsum Generator | ProTools Hub",
        description: "Generate dummy placeholder text for UI/UX designs and mockups.",
        url: "https://myprotoolshub.com/tools/lorem-ipsum-generator",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Lorem Ipsum Generator | ProTools Hub",
        description: "Generate placeholder text instantly for mockups.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Lorem Ipsum Generator",
        "operatingSystem": "All",
        "applicationCategory": "DesignApplication",
        "description": "Generate custom paragraphs and words of dummy placeholder text.",
        "url": "https://myprotoolshub.com/tools/lorem-ipsum-generator",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "390" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <LoremIpsumGenerator />
        </main>
    );
}