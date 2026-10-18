import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions - ProTools Hub",
    description: "Read the terms and conditions for using ProTools Hub free online browser tools, developer utilities, and media converters.",
    keywords: [
        "terms and conditions",
        "terms of service",
        "protools hub terms",
        "legal policy"
    ],
    authors: [{ name: "ProTools Hub" }],
    creator: "ProTools Hub",
    publisher: "ProTools Hub",
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: {
        canonical: "/terms",
    },
    openGraph: {
        title: "Terms & Conditions | ProTools Hub",
        description: "Read the rules and guidelines for using ProTools Hub free online tools.",
        url: "https://myprotoolshub.com/terms",
        siteName: "ProTools Hub",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Terms & Conditions | ProTools Hub",
        description: "Read the terms and conditions for using ProTools Hub utility tools.",
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

export default function TermsPage() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Terms & Conditions",
        "url": "https://myprotoolshub.com/terms",
        "description": "Terms and conditions for ProTools Hub services and browser-based tools."
    };

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-12 shadow-xl shadow-slate-100 space-y-6">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 border-b border-slate-100 pb-6">
                    Terms & Conditions
                </h1>
                <div className="text-xs text-slate-600 space-y-4 leading-relaxed">
                    <p>
                        Welcome to ProTools Hub. By accessing our website and using our free online browser tools, you agree to comply with and be bound by the following terms and conditions.
                    </p>
                    <h2 className="text-sm font-bold text-slate-900 pt-4">1. Use of Tools</h2>
                    <p>
                        All tools provided on ProTools Hub (including image compressors, JSON formatters, text utilities, and generators) are provided free of charge for personal and professional use. Most processing happens client-side directly in your browser to ensure privacy and security.
                    </p>
                    <h2 className="text-sm font-bold text-slate-900 pt-4">2. Intellectual Property</h2>
                    <p>
                        The design, code, layout, and branding of ProTools Hub are protected under intellectual property laws. You may not copy, duplicate, or redistribute our source code without explicit permission.
                    </p>
                    <h2 className="text-sm font-bold text-slate-900 pt-4">3. Limitation of Liability</h2>
                    <p>
                        ProTools Hub is provided on an &quot;as is&quot; basis without warranties of any kind. We are not liable for any data loss, damages, or issues arising from the use of our browser-based utilities.
                    </p>
                </div>
            </div>
        </main>
    );
}