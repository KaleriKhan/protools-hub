import type { Metadata } from "next";
import TextSummarizerTool from "./TextSummarizerTool";

export const metadata: Metadata = {
    title: "Free Text Summarizer Online | Instant AI Summary | ProTools Hub",
    description: "Summarize articles, essays, and long documents into key bullet points instantly. Secure in-browser text summarizer.",
    keywords: [
        "text summarizer",
        "article summarizer online",
        "summarize text free",
        "ai text summary",
        "protools hub",
        "content summary tool"
    ],
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: {
        canonical: "/tools/text-summarizer"
    },
    openGraph: {
        title: "Free Text Summarizer Online - ProTools Hub",
        description: "Summarize articles, essays, and long documents into key bullet points instantly.",
        url: "https://myprotoolshub.com/tools/text-summarizer",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Text Summarizer Online | ProTools Hub",
        description: "Summarize articles and long documents into key bullet points instantly.",
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

export default function TextSummarizerPage() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Free Text Summarizer Online",
        "operatingSystem": "All",
        "applicationCategory": "TextEditorApplication",
        "description": "Summarize articles, essays, and long documents into key bullet points instantly online.",
        "url": "https://myprotoolshub.com/tools/text-summarizer",
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
            <TextSummarizerTool />
        </main>
    );
}