import type { Metadata } from "next";
import MarkdownToHtml from "@/components/tools/MarkdownToHtml";

export const metadata: Metadata = {
    title: "Markdown to HTML Converter - Live Code Parser | ProTools Hub",
    description: "Convert Markdown syntax into clean, valid HTML code instantly with live dual-panel client-side parsing. Fast and secure web utility.",
    keywords: [
        "markdown to html",
        "markdown converter",
        "parse markdown online",
        "markdown to html code",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/markdown-to-html" },
    openGraph: {
        title: "Markdown to HTML Converter | ProTools Hub",
        description: "Live dual-panel Markdown parsing engine for instant HTML conversion.",
        url: "https://myprotoolshub.com/tools/markdown-to-html",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Markdown to HTML Converter | ProTools Hub",
        description: "Convert markdown syntax to clean HTML instantly.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Markdown to HTML Converter",
        "operatingSystem": "All",
        "applicationCategory": "DeveloperApplication",
        "description": "Live dual-panel Markdown to HTML parsing and conversion tool.",
        "url": "https://myprotoolshub.com/tools/markdown-to-html",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "420" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <MarkdownToHtml />
        </main>
    );
}