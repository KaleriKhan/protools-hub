import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us - ProTools Hub Support & Inquiries",
  description: "Get in touch with ProTools Hub support team for bug reports, feature requests, or business inquiries. We are here to help you.",
  keywords: [
    "contact protools hub",
    "customer support",
    "report a bug",
    "feature request",
    "developer contact"
  ],
  authors: [{ name: "ProTools Hub" }],
  creator: "ProTools Hub",
  publisher: "ProTools Hub",
  metadataBase: new URL("https://myprotoolshub.com"),
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | ProTools Hub Support",
    description: "Have a feature request, bug report, or business inquiry? Get in touch with our team.",
    url: "https://myprotoolshub.com/contact",
    siteName: "ProTools Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | ProTools Hub",
    description: "Get in touch with ProTools Hub for support and inquiries.",
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

export default function ContactPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact ProTools Hub",
    "url": "https://myprotoolshub.com/contact",
    "description": "Support and inquiry contact page for ProTools Hub users.",
    "mainEntity": {
      "@type": "Organization",
      "name": "ProTools Hub",
      "url": "https://myprotoolshub.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@myprotoolshub.com",
        "contactType": "Customer Support",
        "areaServed": "Worldwide",
        "availableLanguage": ["English"]
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <ContactForm />
    </>
  );
}