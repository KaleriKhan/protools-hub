import type { Metadata } from "next";
import ImageResizerTool from "./ImageResizerTool";

export const metadata: Metadata = {
    title: "Free Image Resizer Online | Fast & High Quality | ProTools Hub",
    description: "Resize images to custom dimensions in pixels or percentage instantly. 100% client-side privacy with no server uploads.",
    keywords: [
        "image resizer online",
        "resize image free",
        "photo resizer",
        "crop image online",
        "protools hub",
        "image dimension changer"
    ],
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: {
        canonical: "/tools/image-resizer"
    },
    openGraph: {
        title: "Free Image Resizer Online - ProTools Hub",
        description: "Resize images to custom dimensions in pixels or percentage instantly with 100% privacy.",
        url: "https://myprotoolshub.com/tools/image-resizer",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Image Resizer Online | ProTools Hub",
        description: "Resize images to custom dimensions in pixels or percentage instantly.",
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

export default function ImageResizerPage() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Free Image Resizer Online",
        "operatingSystem": "All",
        "applicationCategory": "MultimediaApplication",
        "description": "Resize images to custom dimensions in pixels or percentage instantly with client-side privacy.",
        "url": "https://myprotoolshub.com/tools/image-resizer",
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
            <ImageResizerTool />
        </main>
    );
}