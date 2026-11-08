// app/blog/page.tsx
import type { Metadata } from "next";
import BlogContent from "@/app/blog/BlogContent";
import { POSTS } from "@/data/posts";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog: Guides on Images, PDFs, Text Tools and Privacy",
  description:
    "Practical guides on resizing and compressing images, understanding PDF compression, summarizing text and keeping your files private with browser-based tools.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "ProTools Hub Blog",
    description: "Practical guides on images, PDFs, text tools and privacy.",
    url: `${SITE_URL}/blog`,
    siteName: "ProTools Hub",
    type: "website",
  },
};

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "ProTools Hub Blog",
    url: `${SITE_URL}/blog`,
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.date,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <BlogContent />
    </>
  );
}