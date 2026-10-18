import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User, ShieldCheck } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const formattedTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} - ProTools Hub Blog`,
    description: `Read our comprehensive guide on ${formattedTitle}. Learn tips, tricks, and best practices with ProTools Hub.`,
    authors: [{ name: "ProTools Hub" }],
    metadataBase: new URL("https://myprotoolshub.com"),
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: `${formattedTitle} | ProTools Hub Blog`,
      description: `Read our comprehensive guide on ${formattedTitle}.`,
      url: `https://myprotoolshub.com/blog/${slug}`,
      siteName: "ProTools Hub",
      type: "article",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const formattedTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": formattedTitle,
    "url": `https://myprotoolshub.com/blog/${slug}`,
    "datePublished": "2026-10-18",
    "author": {
      "@type": "Organization",
      "name": "ProTools Hub"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm text-slate-700">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blog</span>
          </Link>

          <div className="space-y-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>October 18, 2026</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>ProTools Hub Team</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formattedTitle}
            </h1>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <p>
              Welcome to the <strong>ProTools Hub</strong> blog article. This post covers detailed insights, step-by-step instructions, and developer utilities related to <strong>{formattedTitle}</strong>.
            </p>
            <h2 className="text-lg font-bold text-slate-900 pt-2">Why This Matters</h2>
            <p>
              When working with web utilities and browser-based tools, security and efficiency are top priorities. All our tools run entirely client-side to ensure your data stays private.
            </p>
            <h2 className="text-lg font-bold text-slate-900 pt-2">Conclusion</h2>
            <p>
              Explore our suite of free online tools on the homepage to start compressing images, formatting JSON, or generating secure passwords instantly.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Verified & Secure Guide</span>
            </span>
            <Link href="/" className="text-blue-600 font-bold hover:underline">
              Explore ProTools Hub →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}