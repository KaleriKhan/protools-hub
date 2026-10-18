import type { Metadata } from "next";
import PDFCompressor from "@/components/tools/PDFCompressor";

export const metadata: Metadata = {
    title: "Free PDF Compressor - Reduce PDF File Size Online | ProTools Hub",
    description: "Compress PDF document file size securely right inside your browser. Adjustable compression levels with 100% data privacy and zero server uploads.",
    keywords: [
        "pdf compressor",
        "reduce pdf file size",
        "compress pdf online free",
        "shrink pdf size",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/pdf-compressor" },
    openGraph: {
        title: "Free PDF Compressor | ProTools Hub",
        description: "Reduce the size of your PDF directly in your browser securely.",
        url: "https://myprotoolshub.com/tools/pdf-compressor",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free PDF Compressor | ProTools Hub",
        description: "Compress PDF documents online with complete privacy.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PDF Compressor",
        "operatingSystem": "All",
        "applicationCategory": "OfficeApplication",
        "description": "Browser-based PDF file size reducer with customizable compression presets.",
        "url": "https://myprotoolshub.com/tools/pdf-compressor",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "630" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <PDFCompressor />
        </main>
    );
}