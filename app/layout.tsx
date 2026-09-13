import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://protools-hub-9k1g.vercel.app"),
  title: {
    default: "ProTools Hub — Free Online Utilities & Developer Toolkit",
    template: "%s | ProTools Hub",
  },
  description:
    "Fast, secure, and client-side web tools for image processing, text utilities, PDF conversion, and developer tools. 100% free and browser-native.",
  keywords: [
    "free online tools",
    "developer utilities",
    "json formatter",
    "word counter",
    "image resizer",
    "pdf tools",
    "base64 encoder",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ProTools Hub — Free Online Utilities & Developer Toolkit",
    description:
      "Fast, secure, and browser-native web utilities for developers, students, and professionals.",
    url: "https://protools-hub-9k1g.vercel.app",
    siteName: "ProTools Hub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProTools Hub — Free Online Utilities & Developer Toolkit",
    description:
      "100% free, secure, and client-side web tools for everyday tasks.",
  },
  verification: {
    google: "rq3tNm5NYZhdANMOmkf2N43QsMXB3FJ-do9hnjIoxbE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ProTools Hub",
    url: "https://protools-hub-9k1g.vercel.app",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free browser-native developer utilities, image resizers, text tools, and converters.",
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7165952973628019"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Structured Data (Schema Markup) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}