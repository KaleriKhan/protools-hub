// app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SITE = "https://myprotoolshub.com";
const EMAIL = "support@myprotoolshub.com";
const UPDATED = "November 7, 2026";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "The terms for using ProTools Hub's free online tools: acceptable use, your files, accuracy of results, advertising, disclaimers and liability.",
    metadataBase: new URL(SITE),
    alternates: { canonical: "/terms" },
    openGraph: {
        title: "Terms of Service",
        description: "The rules for using ProTools Hub's free online tools.",
        url: `${SITE}/terms`,
        siteName: "ProTools Hub",
        type: "website",
    },
    robots: { index: true, follow: true },
};

type Section = { id: string; title: string; body: string[]; bullets?: string[] };

const SECTIONS: Section[] = [
    {
        id: "acceptance",
        title: "1. Acceptance of these terms",
        body: [
            "By accessing or using ProTools Hub (myprotoolshub.com) and its tools, you agree to these Terms of Service and to our Privacy Policy. If you do not agree, please do not use the site. If you use the site on behalf of an organisation, you confirm you are allowed to accept these terms for it.",
        ],
    },
    {
        id: "service",
        title: "2. What we provide",
        body: [
            "ProTools Hub offers free online utilities, including image, PDF, text, developer and security tools, together with guides and articles. Most tools run in your browser. We may add, change, limit or remove tools or features at any time, and we do not promise that any tool will always be available or error-free.",
        ],
    },
    {
        id: "use",
        title: "3. Acceptable use",
        body: ["You agree to use the site lawfully and responsibly. You must not:"],
        bullets: [
            "Use the tools to process content that is illegal, infringes someone else's rights or that you have no right to use.",
            "Attempt to disrupt, overload, probe or gain unauthorised access to the site or its infrastructure.",
            "Use bots, scrapers or automated means to copy the site or place excessive load on it.",
            "Remove or bypass advertising, copyright notices or technical protections in a way that harms the service.",
            "Resell or republish our tools, code or content as your own, or misrepresent your connection with us.",
            "Use the password, QR code or other generators to harm, deceive or defraud others.",
        ],
    },
    {
        id: "content",
        title: "4. Your files and content",
        body: [
            "You keep all rights in the files and text you process. Because our tools run in your browser, we do not receive or store the contents of your files. You are responsible for making sure you have the right to use and modify the material you process and for keeping your own backups.",
            "Always keep the original of any important file. Tools that compress, convert or edit files can change them, and some changes cannot be undone.",
        ],
    },
    {
        id: "accuracy",
        title: "5. Accuracy of results",
        body: [
            "Our tools produce automated results. Image and PDF compression can reduce quality. PDF-to-Word conversion and OCR may misread text or change layout. Summaries select sentences from your text and can miss context. Generated passwords, formatted code and converted data should be checked before you rely on them.",
            "The tools and articles on this site are for general information and convenience. They are not legal, financial, medical, security or other professional advice.",
        ],
    },
    {
        id: "ads",
        title: "6. Advertising and third-party services",
        body: [
            "The site is funded by advertising, including Google AdSense. Ads and links to third-party sites are provided by others; we do not control or endorse them and are not responsible for their content, products or practices. Your dealings with advertisers or third-party sites are between you and them. See our Privacy Policy for how cookies and advertising work.",
        ],
    },
    {
        id: "ip",
        title: "7. Intellectual property",
        body: [
            "The design, text, graphics, code and branding of ProTools Hub are owned by us or our licensors and are protected by intellectual property laws. You may view and use the site for personal or business purposes, and you may link to our pages. You may not copy, reproduce or redistribute our content or source code without written permission, except for brief quotations with a link back to the original page.",
            "The tools rely on open-source libraries, which remain under their own licences. Files you create with our tools belong to you.",
        ],
    },
    {
        id: "warranty",
        title: "8. Disclaimer of warranties",
        body: [
            "The site and all tools are provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, availability and non-infringement. We do not warrant that the service will be uninterrupted, secure or free of errors or harmful components.",
        ],
    },
    {
        id: "liability",
        title: "9. Limitation of liability",
        body: [
            "To the fullest extent permitted by law, ProTools Hub and its owners and contributors are not liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of data, files, profits or business, arising from your use of or inability to use the site or tools, even if we were told such loss was possible. Where liability cannot be excluded, it is limited to the maximum extent the law allows. Nothing in these terms limits liability that cannot be limited by law.",
        ],
    },
    {
        id: "indemnity",
        title: "10. Your responsibility",
        body: [
            "You are responsible for your use of the site. You agree to be responsible for claims or losses that arise from your breach of these terms or your unlawful use of the tools, to the extent permitted by law.",
        ],
    },
    {
        id: "suspension",
        title: "11. Suspension",
        body: [
            "We may restrict or block access to the site for anyone who breaks these terms, harms the service or other users, or where we are required to by law.",
        ],
    },
    {
        id: "law",
        title: "12. Governing law",
        body: [
            "These terms are governed by the laws that apply in the place where the site operator is based, without regard to conflict-of-law rules. Any dispute will be handled by the competent courts of that place, unless mandatory consumer laws in your country give you other rights.",
        ],
    },
    {
        id: "changes",
        title: "13. Changes to these terms",
        body: [
            "We may update these terms from time to time. The date at the top shows the latest revision. By continuing to use the site after changes are posted, you accept the updated terms.",
        ],
    },
    {
        id: "contact",
        title: "14. Contact",
        body: [`Questions about these terms can be sent to ${EMAIL} or through our Contact page.`],
    },
];

export default function TermsPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Terms of Service",
        url: `${SITE}/terms`,
        dateModified: "2026-11-07",
        isPartOf: { "@type": "WebSite", name: "ProTools Hub", url: SITE },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-blue-400">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
                    </Link>

                    <header className="space-y-4 border-b border-slate-800 pb-8">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">Terms of Service</h1>
                        <p className="text-sm text-slate-400">Last updated: {UPDATED}</p>
                        <p className="text-base leading-relaxed text-slate-300">
                            Please read these terms carefully. They explain the rules for using ProTools Hub and what you can expect from us.
                        </p>
                    </header>

                    <nav aria-label="Table of contents" className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Contents</h2>
                        <ol className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                            {SECTIONS.map((s) => (
                                <li key={s.id}><a href={`#${s.id}`} className="text-slate-300 transition hover:text-blue-400">{s.title}</a></li>
                            ))}
                        </ol>
                    </nav>

                    <div className="space-y-10">
                        {SECTIONS.map((s) => (
                            <section key={s.id} id={s.id} className="scroll-mt-24 space-y-4">
                                <h2 className="text-xl font-bold tracking-tight text-white">{s.title}</h2>
                                {s.body.map((p, i) => (
                                    <p key={i} className="text-[15px] leading-7 text-slate-300">{p}</p>
                                ))}
                                {s.bullets && (
                                    <ul className="space-y-2 pl-1">
                                        {s.bullets.map((b) => (
                                            <li key={b} className="flex gap-3 text-[15px] leading-7 text-slate-300">
                                                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </div>

                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-400">
                        <span>See also our <Link href="/privacy" className="font-semibold text-blue-400 hover:underline">Privacy Policy</Link>.</span>
                        <Link href="/contact" className="font-semibold text-blue-400 hover:underline">Contact us</Link>
                    </footer>
                </div>
            </main>
        </>
    );
}