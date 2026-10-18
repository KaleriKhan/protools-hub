import type { Metadata } from "next";
import ImageCompressor from "@/components/tools/ImageCompressor";

export const metadata: Metadata = {
    title: "Free Image Compressor & Optimizer - Reduce File Size Online | ProTools Hub",
    description: "Compress JPG, PNG, and WebP images instantly without losing quality. Fast, secure browser-based image size reducer with zero server uploads.",
    keywords: [
        "image compressor",
        "reduce image size online",
        "compress png jpg free",
        "photo optimizer",
        "image size reducer",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/image-compressor" },
    openGraph: {
        title: "Free Image Compressor & Optimizer | ProTools Hub",
        description: "Compress JPG, PNG, and WebP images without losing quality instantly in your browser.",
        url: "https://myprotoolshub.com/tools/image-compressor",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Image Compressor & Optimizer | ProTools Hub",
        description: "Compress images online securely with zero quality loss.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Free Image Compressor",
        "operatingSystem": "All",
        "applicationCategory": "MultimediaApplication",
        "description": "Browser-based fast image compressor and quality optimizer tool.",
        "url": "https://myprotoolshub.com/tools/image-compressor",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "980" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <ImageCompressor />
        </main>
    );
}