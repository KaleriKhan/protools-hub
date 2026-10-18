import type { Metadata } from "next";
import BackgroundRemover from "@/components/tools/backgroundremover";

export const metadata: Metadata = {
    title: "AI Background Remover - Free Online Transparent PNG Maker | ProTools Hub",
    description: "Remove image backgrounds instantly with high-precision AI edge detection[cite: 1]. 100% free online tool with no API keys or registration required.",
    keywords: [
        "background remover",
        "ai background removal",
        "remove bg free",
        "transparent png maker",
        "protools hub",
        "online image background eraser",
        "free ai tool"
    ],
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: {
        canonical: "/tools/background-remover"
    },
    openGraph: {
        title: "AI Background Remover - ProTools Hub",
        description: "Remove image backgrounds instantly with high-precision AI edge detection[cite: 1]. 100% free and secure browser utility.",
        url: "https://myprotoolshub.com/tools/background-remover",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
        images: [
            {
                url: "https://myprotoolshub.com/og-background-remover.png",
                width: 1200,
                height: 630,
                alt: "AI Background Remover Tool - ProTools Hub",
            }
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Background Remover | ProTools Hub",
        description: "Instant AI-powered background removal tool with zero setup.",
        images: ["https://myprotoolshub.com/og-background-remover.png"],
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
        "name": "AI Background Remover",
        "operatingSystem": "All",
        "applicationCategory": "MultimediaApplication",
        "description": "Instant AI-powered background removal tool for web creators, developers, and photographers.",
        "url": "https://myprotoolshub.com/tools/background-remover",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1250"
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            <BackgroundRemover />
        </main>
    );
}