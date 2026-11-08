// app/contact/page.tsx
import type { Metadata } from "next";
import ContactForm from "@/app/contact/ContactForm";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact ProTools Hub to report a bug, request a new tool or ask a question. We reply by email, usually within a few working days.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact ProTools Hub",
    url: `${SITE_URL}/contact`,
    mainEntity: { "@type": "Organization", name: "ProTools Hub", url: SITE_URL, email: "support@myprotoolshub.com" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ContactForm />
    </>
  );
}