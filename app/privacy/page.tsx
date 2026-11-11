// app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const SITE = "https://myprotoolshub.com";
const EMAIL = "support@myprotoolshub.com";
const UPDATED = "November 7, 2026";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "How ProTools Hub handles your files, cookies, advertising (Google AdSense) and personal data, and the choices and rights you have.",
    metadataBase: new URL(SITE),
    alternates: { canonical: "/privacy" },
    openGraph: {
        title: "Privacy Policy | ProTools Hub",
        description: "How ProTools Hub handles your files, cookies, advertising and personal data.",
        url: `${SITE}/privacy`,
        siteName: "ProTools Hub",
        type: "website",
    },
    robots: { index: true, follow: true },
};

type Section = { id: string; title: string; body: string[]; bullets?: string[] };

const SECTIONS: Section[] = [
    {
        id: "files",
        title: "1. Your files and text",
        body: [
            "Our file and text tools (for example the image, PDF, text and developer tools) are designed to run in your web browser. When you select a file or paste text, it is read and processed on your own device. The contents of your files and text are not uploaded to our servers and we do not store them.",
            "There are limited exceptions to be aware of. Some tools load supporting resources when you first use them, such as code libraries, fonts or OCR language data, and these downloads come from our servers or from a content delivery network. This is data coming to your browser; it does not include your file. If we ever add a feature that needs to send your content to a server, we will say so clearly on that tool's page before you use it.",
            "You can check this yourself. Open your browser's developer tools, go to the Network tab and run a tool: you should not see your file being sent anywhere.",
        ],
    },
    {
        id: "collect",
        title: "2. Information we collect automatically",
        body: [
            "Like most websites, when you visit ProTools Hub our hosting provider and our tools may automatically receive technical information. We use it to keep the site running, fix problems, understand which pages are useful and prevent abuse.",
        ],
        bullets: [
            "Your IP address and approximate location (such as country or city) derived from it.",
            "Browser type and version, device type and operating system.",
            "Pages visited, the page that referred you, date and time of the visit and how long you stayed.",
            "Basic interaction data, such as which tool pages were opened.",
        ],
    },
    {
        id: "contact",
        title: "3. Information you send us",
        body: [
            `If you contact us, for example through the Contact page or by emailing ${EMAIL}, we receive your name, email address and the contents of your message. We use this only to reply to you and to improve the site, and we keep it for as long as needed to handle your request and for a reasonable period afterwards. Please do not send passwords, identity documents or other sensitive files by email.`,
        ],
    },
    {
        id: "cookies",
        title: "4. Cookies and similar technologies",
        body: [
            "Cookies are small files stored on your device. We and our partners use cookies and similar technologies such as local storage and pixels for the following purposes:",
        ],
        bullets: [
            "Essential: remembering basic settings and keeping the site working.",
            "Analytics: measuring traffic and page performance, usually in aggregated form.",
            "Advertising: showing and measuring ads, limiting how often you see an ad and, where permitted, personalizing ads.",
        ],
    },
    {
        id: "ads",
        title: "5. Advertising and Google AdSense",
        body: [
            "ProTools Hub is free to use and is supported by advertising. We use Google AdSense and may work with other advertising partners. Third-party vendors, including Google, use cookies to serve ads based on a user's previous visits to this website and other websites.",
            "Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet. Where the law requires consent, for example for visitors in the European Economic Area, the United Kingdom and Switzerland, ads that use cookies or personalization are shown according to the choices you make in the consent message.",
            "You can control personalized advertising in several ways:",
        ],
        bullets: [
            "Visit Google Ads Settings (adssettings.google.com) to opt out of personalized advertising.",
            "Visit www.aboutads.info/choices or www.youronlinechoices.eu to opt out of many third-party vendors' personalized advertising.",
            "Change your browser settings to block or delete cookies. Note that some parts of a site may not work as intended without them.",
            "Learn how Google uses information from sites that use its services at policies.google.com/technologies/partner-sites.",
        ],
    },
    {
        id: "use",
        title: "6. How we use information",
        body: ["We use the information described above to:"],
        bullets: [
            "Operate, maintain and secure the website and its tools.",
            "Understand usage and improve existing tools and create new ones.",
            "Respond to messages and support requests.",
            "Display advertising that funds the site.",
            "Detect and prevent fraud, abuse and technical problems.",
            "Comply with legal obligations.",
        ],
    },
    {
        id: "sharing",
        title: "7. Sharing of information",
        body: [
            "We do not sell your personal information for money. We share limited information only with service providers that help us run the site, such as hosting, analytics and advertising partners, who may process it under their own privacy policies, and where required by law or to protect our rights and users. If our business is ever merged or transferred, information may be transferred as part of that change.",
        ],
    },
    {
        id: "thirdparty",
        title: "8. Third-party websites",
        body: [
            "Our pages may link to other websites. We do not control those sites and are not responsible for their content or privacy practices. We encourage you to read their policies before sharing information.",
        ],
    },
    {
        id: "retention",
        title: "9. Data retention and security",
        body: [
            "Server logs and analytics data are kept only for as long as needed for the purposes above, in line with our providers' retention periods. Messages you send us are kept as described in section 3. We use reasonable technical measures, including encrypted (HTTPS) connections, to protect information, but no method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
        ],
    },
    {
        id: "rights",
        title: "10. Your rights and choices",
        body: [
            "Depending on where you live, you may have rights over your personal data. These can include the right to access it, correct it, delete it, restrict or object to its processing, receive a copy of it, and withdraw consent you previously gave. If you are in the European Economic Area or the United Kingdom, you can also complain to your local data protection authority.",
            "If you are a California resident, you may have the right to know what personal information is collected, to request deletion and to opt out of the sale or sharing of personal information. We do not sell personal information for money; you can opt out of personalized advertising using the tools in section 5.",
            `To make a request, email ${EMAIL}. We may need to verify your identity before acting on it.`,
        ],
    },
    {
        id: "children",
        title: "11. Children's privacy",
        body: [
            "ProTools Hub is a general-audience site and is not directed to children under 13 (or under 16 where local law sets a higher age). We do not knowingly collect personal information from children. If you believe a child has sent us personal information, contact us and we will delete it.",
        ],
    },
    {
        id: "international",
        title: "12. International visitors",
        body: [
            "Our service providers may process data in countries other than your own. Where this involves transferring personal data from regions with data transfer rules, we rely on the safeguards offered by those providers, such as standard contractual clauses.",
        ],
    },
    {
        id: "changes",
        title: "13. Changes to this policy",
        body: [
            "We may update this policy as the site, our tools or the law changes. The date at the top shows when it was last revised. If we make significant changes, we will make that clear on the site.",
        ],
    },
    {
        id: "contactus",
        title: "14. Contact us",
        body: [`Questions about this policy or your data can be sent to ${EMAIL} or through our Contact page.`],
    },
];

export default function PrivacyPolicyPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Privacy Policy",
        url: `${SITE}/privacy`,
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
                        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">Privacy Policy</h1>
                        <p className="text-sm text-slate-400">Last updated: {UPDATED}</p>
                        <p className="text-base leading-relaxed text-slate-300">
                            This policy explains what information ProTools Hub (myprotoolshub.com) handles when you use our website and tools, how we use it, and the choices you have.
                        </p>
                    </header>

                    <aside className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> The short version
                        </h2>
                        <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                            <li>Our file and text tools run in your browser. Your files are not uploaded to our servers.</li>
                            <li>The site shows ads (Google AdSense), which use cookies. You can opt out of personalized ads.</li>
                            <li>We collect ordinary technical data such as IP address and pages visited, and any message you send us.</li>
                            <li>We do not sell your personal information for money.</li>
                        </ul>
                    </aside>

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
                        <span>See also our <Link href="/terms" className="font-semibold text-blue-400 hover:underline">Terms of Service</Link>.</span>
                        <Link href="/contact" className="font-semibold text-blue-400 hover:underline">Contact us</Link>
                    </footer>
                </div>
            </main>
        </>
    );
}