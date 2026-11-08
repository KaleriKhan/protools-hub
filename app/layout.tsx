// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE = "https://myprotoolshub.com";
const isProd = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "ProTools Hub | Free Online Tools for PDF, Images, Text & Code",
    template: "%s | ProTools Hub",
  },
  description:
    "Free online tools to compress images and PDFs, convert PDF to Word, format JSON, generate passwords and QR codes, and more. No sign-up, and file tools run in your browser.",
  // NOTE: no site-wide canonical here. A canonical set in the root layout is inherited by every
  // page that does not define its own, which would point them all at the home page.
  openGraph: {
    title: "ProTools Hub | Free Online Tools for PDF, Images, Text & Code",
    description: "Free online tools for PDFs, images, text and developers. No sign-up, and file tools run in your browser.",
    url: SITE,
    siteName: "ProTools Hub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "ProTools Hub | Free Online Tools",
    description: "Free online tools for PDFs, images, text and developers.",
  },
  verification: {
    google: "rq3tNm5NYZhdANMOmkf2N43QsMXB3FJ-do9hnjIoxbE",
  },
};

const siteJsonLd = [
  { "@context": "https://schema.org", "@type": "WebSite", name: "ProTools Hub", url: SITE },
  { "@context": "https://schema.org", "@type": "Organization", name: "ProTools Hub", url: SITE, email: "support@myprotoolshub.com" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ colorScheme: "dark", backgroundColor: "#020617" }}
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
    >
      <head />
      <body className="bg-slate-950 text-slate-100 min-h-screen" style={{ backgroundColor: "#020617" }} suppressHydrationWarning>
        {siteJsonLd.map((d, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
        ))}

        <div className="flex h-screen w-full overflow-hidden bg-slate-950">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen bg-slate-950">
            <Header />
            {/* Scrollable workspace: the ONLY element that scrolls. Pages must not add another <main>. */}
            <main className="flex-1 min-h-0 overflow-y-auto flex flex-col bg-slate-950">
              <div className="flex-1 w-full bg-slate-950">{children}</div>
              <Footer />
            </main>
          </div>
        </div>

        {/* Analytics and ads load only on the live site, not on localhost */}
        {isProd && (
          <>
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-MW7FHHPGEJ" strategy="lazyOnload" />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-MW7FHHPGEJ');
              `}
            </Script>
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7165952973628019"
              crossOrigin="anonymous"
              strategy="lazyOnload"
            />
          </>
        )}
      </body>
    </html>
  );
}