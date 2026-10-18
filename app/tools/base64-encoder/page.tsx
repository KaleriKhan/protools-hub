import type { Metadata } from "next";
import Base64EncoderTool from "./Base64EncoderTool";

export const metadata: Metadata = {
    title: "Base64 Encoder & Decoder Online | Fast & Private | ProTools Hub",
    description: "Encode text to Base64 format or decode Base64 strings instantly in your browser. 100% private developer utility with zero server uploads.",
    keywords: [
        "base64 encoder",
        "base64 decoder online",
        "convert text to base64",
        "base64 converter",
        "protools hub",
        "developer utility"
    ],
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: {
        canonical: "/tools/base64-encoder"
    },
    openGraph: {
        title: "Base64 Encoder & Decoder Online - ProTools Hub",
        description: "Encode text to Base64 format or decode Base64 strings instantly in your browser with 100% privacy.",
        url: "https://myprotoolshub.com/tools/base64-encoder",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Base64 Encoder & Decoder Online | ProTools Hub",
        description: "Encode text or decode Base64 strings instantly in your browser.",
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

export default function Base64Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Base64 Encoder & Decoder",
        "operatingSystem": "All",
        "applicationCategory": "DeveloperApplication",
        "description": "Fast and private online Base64 encoder and decoder tool for developers.",
        "url": "https://myprotoolshub.com/tools/base64-encoder",
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
            <Base64EncoderTool />
        </main>
    );
}