import type { Metadata } from "next";
import QRCodeGenerator from "@/components/tools/QRCodeGenerator";

export const metadata: Metadata = {
    title: "Free QR Code Generator - Create Custom QR Codes Online | ProTools Hub",
    description: "Generate customizable, high-resolution QR codes instantly for URLs, text, and Wi-Fi. Free online QR code creator with color customization and instant PNG download.",
    keywords: [
        "qr code generator",
        "create qr code online",
        "free qr code maker",
        "custom qr code generator",
        "url qr code",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/qr-code-generator" },
    openGraph: {
        title: "Free QR Code Generator | ProTools Hub",
        description: "Create customizable, high-resolution QR codes in seconds with color options.",
        url: "https://myprotoolshub.com/tools/qr-code-generator",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free QR Code Generator | ProTools Hub",
        description: "Generate custom QR codes instantly online.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Free QR Code Generator",
        "operatingSystem": "All",
        "applicationCategory": "UtilitiesApplication",
        "description": "Create customizable high-resolution QR codes instantly.",
        "url": "https://myprotoolshub.com/tools/qr-code-generator",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1120" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <QRCodeGenerator />
        </main>
    );
}