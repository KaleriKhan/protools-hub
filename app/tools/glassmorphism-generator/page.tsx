import type { Metadata } from "next";
import GlassmorphismGenerator from "@/components/tools/glassmorphismgenerator";

export const metadata: Metadata = {
  title: "Free CSS Generators & UI Tools Suite | ProTools Hub",
  description: "Explore 19+ advanced CSS generators including Glassmorphism, Box Shadow, Gradients, Flexbox, Keyframes, and Glitch effects. Build modern UI elements instantly.",
  keywords: [
    "css generators",
    "glassmorphism generator",
    "box shadow generator",
    "css gradient generator",
    "flexbox generator",
    "web development tools",
    "protools hub"
  ],
  authors: [{ name: "ProTools Hub" }],
  creator: "ProTools Hub",
  publisher: "ProTools Hub",
  metadataBase: new URL("https://myprotoolshub.com"),
  alternates: {
    canonical: "/tools/css-generators",
  },
  openGraph: {
    title: "Free CSS Generators & UI Tools Suite | ProTools Hub",
    description: "Build modern UI components with 19+ real-time interactive CSS generators. Instant live preview and code copying.",
    url: "https://myprotoolshub.com/tools/css-generators",
    siteName: "ProTools Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free CSS Generators & UI Tools Suite | ProTools Hub",
    description: "Generate CSS styles instantly with live visual previews and zero latency.",
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

export default function Page() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CSS Generators Suite",
    "operatingSystem": "All",
    "applicationCategory": "DeveloperApplication",
    "description": "A collection of 19+ interactive CSS generators for web developers including glassmorphism, shadows, gradients, and flexbox.",
    "url": "https://myprotoolshub.com/tools/css-generators",
    "applicationSubCategory": "Web Development Tools",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250"
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <GlassmorphismGenerator />
    </main>
  );
}