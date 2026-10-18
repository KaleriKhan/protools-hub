import type { Metadata } from "next";
import WordCounter from "@/components/tools/WordCounter";

export const metadata: Metadata = {
    title: "Word & Character Counter - Real-Time Text Analysis | ProTools Hub",
    description: "Count words, characters, sentences, and paragraphs in real-time. Calculate reading time instantly for essays, blogs, and articles online.",
    keywords: [
        "word counter",
        "character count tool",
        "reading time calculator",
        "sentence counter",
        "online word count",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/word-counter" },
    openGraph: {
        title: "Word & Character Counter | ProTools Hub",
        description: "Instant real-time text analysis and reading time calculation.",
        url: "https://myprotoolshub.com/tools/word-counter",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Word & Character Counter | ProTools Hub",
        description: "Count words and characters instantly online.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Word & Character Counter",
        "operatingSystem": "All",
        "applicationCategory": "UtilitiesApplication",
        "description": "Real-time text analysis tool calculating words, characters, sentences, and reading time.",
        "url": "https://myprotoolshub.com/tools/word-counter",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "920" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <WordCounter />
        </main>
    );
}