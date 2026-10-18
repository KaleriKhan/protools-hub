import type { Metadata } from "next";
import { Suspense } from "react";
import CategoriesContent from "./CategoriesContent";

export const metadata: Metadata = {
  title: "Tool Categories - Browse Free Online Utilities | ProTools Hub",
  description: "Browse ProTools Hub categories: PDF Tools, Image Converters, Developer Utilities, and Security Tools. Find the right utility instantly.",
  keywords: [
    "tool categories",
    "developer utilities",
    "pdf tools",
    "image tools",
    "security tools",
    "protools hub"
  ],
  authors: [{ name: "ProTools Hub" }],
  creator: "ProTools Hub",
  publisher: "ProTools Hub",
  metadataBase: new URL("https://myprotoolshub.com"),
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Tool Categories | ProTools Hub",
    description: "Browse ProTools Hub categories and find the right free online utility instantly.",
    url: "https://myprotoolshub.com/categories",
    siteName: "ProTools Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tool Categories | ProTools Hub",
    description: "Browse free online utility categories on ProTools Hub.",
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

export default function CategoriesPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Tool Categories - ProTools Hub",
    "url": "https://myprotoolshub.com/categories",
    "description": "Browse all tool categories available on ProTools Hub."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading categories...</div>}>
        <CategoriesContent />
      </Suspense>
    </>
  );
}