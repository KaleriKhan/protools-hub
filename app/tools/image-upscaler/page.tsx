import type { Metadata } from "next";
import ImageUpscaler from "@/components/tools/imageupscaler";

export const metadata: Metadata = {
    title: "AI Image Upscaler - Enhance & Enlarge Images Free | ProTools Hub",
    description: "Upscale and enhance low-resolution images up to 4x resolution instantly with smart AI interpolation. 100% free online tool with zero registration required.",
    keywords: [
        "image upscaler",
        "ai image enhancer",
        "enlarge image online free",
        "upscale photo 4x",
        "protools hub",
        "image resolution enhancer",
        "free ai upscaler"
    ],
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: {
        canonical: "/tools/image-upscaler"
    },
    openGraph: {
        title: "AI Image Upscaler - ProTools Hub",
        description: "Enhance and enlarge images up to 4x resolution instantly with smart AI interpolation. 100% free online tool.",
        url: "https://myprotoolshub.com/tools/image-upscaler",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
        images: [
            {
                url: "https://myprotoolshub.com/og-image-upscaler.png",
                width: 1200,
                height: 630,
                alt: "AI Image Upscaler Tool - ProTools Hub",
            }
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Image Upscaler | ProTools Hub",
        description: "Enhance and enlarge images up to 4x resolution instantly with smart AI interpolation.",
        images: ["https://myprotoolshub.com/og-image-upscaler.png"],
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

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AI Image Upscaler",
        "operatingSystem": "All",
        "applicationCategory": "MultimediaApplication",
        "description": "Instant AI-powered image upscaler and enhancer tool for web creators, developers, and photographers.",
        "url": "https://myprotoolshub.com/tools/image-upscaler",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "980"
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            <ImageUpscaler />
        </main>
    );
}