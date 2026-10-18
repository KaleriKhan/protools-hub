import type { Metadata } from "next";
import { Suspense } from "react";
import BlogContent from "./BlogContent";

export const metadata: Metadata = {
  title: "Blog & Guides - Free Developer & Utility Tips | ProTools Hub",
  description: "Read the latest tutorials, guides, and tips on web development, PDF optimization, image compression, and online browser utilities.",
  keywords: [
    "protools hub blog",
    "developer tutorials",
    "image compression guide",
    "pdf optimization tips",
    "web utilities blog"
  ],
  authors: [{ name: "ProTools Hub" }],
  creator: "ProTools Hub",
  publisher: "ProTools Hub",
  metadataBase: new URL("https://myprotoolshub.com"),
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog & Guides | ProTools Hub",
    description: "Explore tutorials and guides on web tools, developer utilities, and optimization techniques.",
    url: "https://myprotoolshub.com/blog",
    siteName: "ProTools Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Guides | ProTools Hub",
    description: "Explore tutorials and guides on free browser utility tools.",
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

export default function BlogPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "ProTools Hub Blog",
    "url": "https://myprotoolshub.com/blog",
    "description": "Tutorials and guides for developer and media utility tools."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading blog posts...</div>}>
        <BlogContent />
      </Suspense>
    </>
  );
}