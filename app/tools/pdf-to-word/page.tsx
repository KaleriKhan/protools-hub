import type { Metadata } from "next";
import PDFToWord from "@/components/tools/PDFToWord";

export const metadata: Metadata = {
    title: "PDF to Word Converter Online - Free & Secure DOCX | ProTools Hub",
    description: "Convert PDF documents to editable Word (DOCX) files quickly and securely in your browser. No registration required, 100% free utility.",
    keywords: [
        "pdf to word converter",
        "convert pdf to docx",
        "pdf to word online free",
        "pdf converter utility",
        "protools hub"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: { canonical: "/tools/pdf-to-word" },
    openGraph: {
        title: "PDF to Word Converter Online | ProTools Hub",
        description: "Convert PDF documents to editable Word DOCX files quickly and securely.",
        url: "https://myprotoolshub.com/tools/pdf-to-word",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "PDF to Word Converter | ProTools Hub",
        description: "Convert PDF files into editable Word documents online for free.",
    },
    robots: { index: true, follow: true },
};

export default function Page() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PDF to Word Converter",
        "operatingSystem": "All",
        "applicationCategory": "UtilitiesApplication",
        "description": "Online tool to convert PDF documents into editable Word files.",
        "url": "https://myprotoolshub.com/tools/pdf-to-word",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1600" }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            <PDFToWord />
        </main>
    );
}