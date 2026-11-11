import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedTools from "@/components/home/FeaturedTools";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HomeContent from "@/components/home/HomeContent";

export const metadata: Metadata = {
  // Absolute title: the layout template would otherwise add " | ProTools Hub" a second time.
  title: { absolute: "ProTools Hub: Free Online Tools for PDFs, Images, Text & Code" },
  description:
    "Free online tools for PDFs, images, text and code: compress images, convert PDF to Word, format JSON, generate passwords and QR codes. No sign-up needed.",
  keywords: [
    "free online tools",
    "developer utilities",
    "image compressor",
    "pdf to word",
    "json formatter",
    "protools hub",
  ],
  authors: [{ name: "ProTools Hub" }],
  creator: "ProTools Hub",
  publisher: "ProTools Hub",
  metadataBase: new URL("https://myprotoolshub.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ProTools Hub: Free Online Tools for PDFs, Images, Text & Code",
    description:
      "Free browser-based tools for everyday work with files, images, text and code. No account needed.",
    url: "https://myprotoolshub.com",
    siteName: "ProTools Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProTools Hub: Free Online Tools",
    description: "Free online tools for PDFs, images, text and code. No account needed.",
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
    name: "ProTools Hub",
    url: "https://myprotoolshub.com",
    description: "Free online tools for PDFs, images, text and code.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://myprotoolshub.com/tools?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <FeaturedCategories />
      <FeaturedTools />
      <WhyChooseUs />
      <HomeContent />
    </>
  );
}