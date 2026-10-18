import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedTools from "@/components/home/FeaturedTools";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export const metadata: Metadata = {
  title: "ProTools Hub - Free Online Developer & Media Utilities Suite",
  description: "Explore 100% free online browser tools including image compressors, background removers, JSON formatters, password generators, and CSS tools.",
  keywords: [
    "free online tools",
    "developer utilities",
    "image compressor",
    "background remover",
    "json formatter",
    "protools hub"
  ],
  authors: [{ name: "ProTools Hub" }],
  creator: "ProTools Hub",
  publisher: "ProTools Hub",
  metadataBase: new URL("https://myprotoolshub.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ProTools Hub - Free Online Developer & Media Utilities",
    description: "Access fast, secure, and 100% free browser-based utility tools with zero server uploads.",
    url: "https://myprotoolshub.com",
    siteName: "ProTools Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProTools Hub | Free Online Tools Suite",
    description: "Fast, secure, and free online utilities for developers and creators.",
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

export default function Home() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ProTools Hub",
    "url": "https://myprotoolshub.com",
    "description": "Free online browser utility tools for developers and creators.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://myprotoolshub.com/tools?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <Hero />
      <FeaturedCategories />
      <FeaturedTools />
      <WhyChooseUs />
    </>
  );
}