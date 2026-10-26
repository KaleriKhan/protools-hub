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
  metadataBase: new URL("https://myprotoolshub.com"),
  title: {
    default: "ProTools Hub — 100% Free & Private Online Utilities Toolkit",
    template: "%s | ProTools Hub",
  },
  description:
    "Fast, secure, and 100% client-side web tools for image processing, text utilities, JSON formatting, Base64 encoding, and developer tools with zero server data storage.",
  keywords: [
    "free online tools",
    "developer utilities",
    "json formatter online",
    "word counter tool",
    "image resizer free",
    "text summarizer",
    "base64 encoder decoder",
    "lorem ipsum generator",
    "private browser tools",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ProTools Hub — 100% Free & Private Online Utilities Toolkit",
    description:
      "Fast, secure, and browser-native web utilities for developers, students, and professionals.",
    url: "https://myprotoolshub.com",
    siteName: "ProTools Hub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProTools Hub — 100% Free & Private Online Utilities Toolkit",
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MW7FHHPGEJ"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MW7FHHPGEJ');
          `}
        </Script>

        {/* Google AdSense - Optimized with lazyOnload to improve performance score */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7165952973628019"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900" suppressHydrationWarning>
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}