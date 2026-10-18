import type { Metadata } from "next";
import TextCaseConverter from "@/components/tools/TextCaseConverter";

export const metadata: Metadata = {
    title: "Text Case Converter - UPPERCASE, lowercase, camelCase & More | ProTools Hub",
    description: "Transform text into UPPERCASE, lowercase, Title Case, camelCase, and snake_case online. Free text transformer with word and character statistics.",
    keywords: [
        "text case converter",
        "uppercase converter",
        "lowercase converter",
        "camelcase converter",
        "snake case online",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/text-case-converter" },
    openGraph: {
        title: "Text Case Converter | ProTools Hub",
        description: "Transform text into UPPERCASE, lowercase, titleCase, camelCase & snake_case.",
        url: "https://myprotoolshub.com/tools/text-case-converter",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Text Case Converter | ProTools Hub",
        description: "Instant online text case transformer and stats calculator.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Text Case Converter",
        "operatingSystem": "All",
        "applicationCategory": "TextEditorApplication",
        "description": "Convert text cases between UPPERCASE, lowercase, title case, camelCase, and snake_case.",
        "url": "https://myprotoolshub.com/tools/text-case-converter",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.7", "ratingCount": "510" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <TextCaseConverter />
        </main>
    );
}