// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/data/tools";
import {
    ShieldCheck, Zap, UserCheck, Eye, Wrench, BookOpen, Mail, ArrowRight, CheckCircle2, XCircle,
    FileText, Image as ImageIcon, Type, Code2, KeyRound, Hammer, FlaskConical, RefreshCw, Quote, Server, Clock, Megaphone,
    type LucideIcon,
} from "lucide-react";

const SITE = "https://myprotoolshub.com";
const EMAIL = "support@myprotoolshub.com";

export const metadata: Metadata = {
    title: "About ProTools Hub | Free Browser-Based Online Tools",
    description:
        "ProTools Hub builds free online tools for images, PDFs, text and developers that run in your browser. Learn who we are, how we build tools and how the site is funded.",
    metadataBase: new URL(SITE),
    alternates: { canonical: "/about" },
    openGraph: {
        title: "About ProTools Hub",
        description: "Free online tools that run in your browser, built and explained by the ProTools Hub team.",
        url: `${SITE}/about`,
        siteName: "ProTools Hub",
        type: "website",
    },
    robots: { index: true, follow: true },
};

const PRINCIPLES: { icon: LucideIcon; title: string; text: string; color: string; bg: string }[] = [
    { icon: ShieldCheck, title: "Respect your files", text: "Where a tool can run in your browser, it does. Your documents and photos are processed on your device instead of being uploaded to us.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { icon: Eye, title: "Say what a tool really does", text: "We describe each tool's limits plainly. If a feature is a simple algorithm and not artificial intelligence, we do not call it AI.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { icon: Zap, title: "Keep it fast and simple", text: "No sign-up, no queue and no waiting for an upload. Open a tool, use it and leave.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { icon: UserCheck, title: "Explain, do not just provide", text: "Every tool page has a written guide, tips and answers to common questions, so you understand the result you get.", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
];

const AREAS: { icon: LucideIcon; title: string; text: string; param: string }[] = [
    { icon: ImageIcon, title: "Image tools", text: "Compress, resize and convert images between JPEG, PNG and WebP.", param: "Image" },
    { icon: FileText, title: "PDF tools", text: "Reduce PDF size and convert PDFs to editable Word documents, including scans with OCR.", param: "PDF" },
    { icon: Type, title: "Text tools", text: "Count words, change text case and summarize long passages.", param: "Text" },
    { icon: Code2, title: "Developer tools", text: "Format JSON, encode Base64, convert Markdown, create QR codes and build CSS effects.", param: "Developer" },
    { icon: KeyRound, title: "Security tools", text: "Generate strong random passwords using your browser's secure random generator.", param: "Security" },
];

const DOES = [
    "Process files in your browser wherever the task allows it",
    "Offer every tool free, with no account",
    "Write guides and articles ourselves",
    "Fix reported bugs and improve tools over time",
    "Tell you plainly what ads and cookies the site uses",
];

const DOESNT = [
    "Sell or store the contents of your files",
    "Ask you to register or pay to unlock a tool",
    "Claim results are perfect: every tool has limits",
    "Pretend a tool is AI when it is not",
];

const PROCESS: { icon: LucideIcon; title: string; text: string }[] = [
    { icon: Hammer, title: "1. Build", text: "Each tool starts from a real task people struggle with. We build it with standard web technology: the Canvas API for images, well-known open-source libraries for PDFs and OCR, and the browser's built-in Web Crypto for passwords. Size limits stop large files from freezing your browser." },
    { icon: FlaskConical, title: "2. Test", text: "Before a tool goes live we try it with a range of real files and edge cases, such as very large images, empty input, unusual characters and different browsers. When something cannot be processed, the tool shows a clear message instead of failing silently." },
    { icon: RefreshCw, title: "3. Maintain", text: "Bugs reported through our Contact page are looked at and fixed. We revisit tools and guides as browsers and best practices change, and we publish articles that explain the ideas behind the tools in plain language." },
];

const FUNDING: { icon: LucideIcon; title: string; text: string }[] = [
    { icon: Server, title: "Hosting", text: "Keeping the site online and fast for everyone." },
    { icon: Clock, title: "Development time", text: "Building new tools and maintaining the existing ones." },
    { icon: Megaphone, title: "Ads stay separate", text: "Ads never receive the contents of files processed in your browser." },
];

const FAQS = [
    { q: "Who can use ProTools Hub?", a: "Anyone. There is no account, subscription or daily limit." },
    { q: "Are my files uploaded?", a: "For the file tools, processing happens in your browser, so file contents are not sent to our servers. Some tools download supporting resources, such as OCR language data, the first time you use them." },
    { q: "How is the site paid for?", a: "Through advertising, including Google AdSense. Every tool remains free." },
    { q: "Can I suggest a new tool?", a: "Yes. Send your idea through the Contact page and tell us what task you are trying to finish." },
    { q: "How do I report a problem?", a: "Use the Contact page and mention the tool, your browser and what happened. Screenshots help." },
    { q: "Which browsers work best?", a: "Current versions of Chrome, Edge, Firefox and Safari. Older browsers may lack some features." },
];

export default function AboutPage() {
    const total = tools.length;
    const categoriesCount = AREAS.filter((a) => tools.some((t) => t.category.toLowerCase().includes(a.param.toLowerCase()))).length;
    const count = (param: string) => tools.filter((t) => t.category.toLowerCase().includes(param.toLowerCase())).length;

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About ProTools Hub",
            url: `${SITE}/about`,
            isPartOf: { "@type": "WebSite", name: "ProTools Hub", url: SITE },
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ProTools Hub",
            url: SITE,
            email: EMAIL,
            description: "Free online tools for images, PDFs, text and developers that run in your browser.",
        },
    ];

    return (
        <>
            {jsonLd.map((d, i) => (
                <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />
            ))}

            <main className="bg-slate-950">
                {/* Intro */}
                <section className="relative overflow-hidden border-b border-slate-800 px-4 pb-16 pt-20 sm:px-6 lg:px-8">
                    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                        <div className="absolute -left-10 top-0 h-72 w-72 rounded-full bg-blue-600 opacity-10 blur-3xl" />
                        <div className="absolute -right-10 top-10 h-72 w-72 rounded-full bg-indigo-600 opacity-10 blur-3xl" />
                    </div>
                    <div className="relative mx-auto max-w-6xl space-y-12">
                        <div className="mx-auto max-w-3xl space-y-6 text-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-slate-900 px-4 py-1.5 text-xs font-semibold text-blue-400">
                                <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> About ProTools Hub
                            </span>
                            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                                Useful tools that respect
                                <span className="block text-sky-300">your files and your time</span>
                            </h1>
                            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                                {`ProTools Hub is a growing library of ${total} free online tools for everyday work with images, PDFs, text and code. Most of them run in your browser, so you can finish a task without creating an account or handing your files to a stranger's server.`}
                            </p>
                        </div>

                        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[
                                [String(total), "Free tools"],
                                [String(categoriesCount), "Categories"],
                                ["0", "Sign-ups required"],
                                ["In-browser", "File processing"],
                            ].map(([value, label]) => (
                                <div key={label} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 px-5 py-6 text-center">
                                    <dt className="order-2 mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
                                    <dd className="text-2xl font-black text-white sm:text-3xl">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                {/* Story */}
                <section className="border-b border-slate-800 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-5">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="space-y-3">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Why we exist</p>
                                <h2 className="text-3xl font-black tracking-tight text-white">Why we built ProTools Hub</h2>
                            </div>
                            <figure className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-7">
                                <Quote className="mb-4 h-7 w-7 text-blue-400" aria-hidden="true" />
                                <blockquote className="text-lg font-semibold leading-snug text-white">
                                    Do one job well, open instantly, and treat your files as yours.
                                </blockquote>
                                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Our goal for every tool</figcaption>
                            </figure>
                        </div>
                        <div className="space-y-5 text-base leading-8 text-slate-300 lg:col-span-3">
                            <p>
                                Many free online tools make the same trade: to compress a photo or convert a PDF, you upload the file, wait, and hope it is handled responsibly. Others bury the result under sign-up walls, watermarks or daily limits.
                            </p>
                            <p>
                                We wanted something different. Modern browsers are powerful enough to resize images, rearrange PDF pages, format code and generate secure random values on their own, so for most tasks there is no reason to send a file anywhere.
                            </p>
                            <p>
                                ProTools Hub is the result. Each tool is built by our team and published with a plain-language guide, so you know what it does, what its limits are and how to get the best result. We keep the tools free and the pages quick, and we are open about how the site pays for itself.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Principles */}
                <section className="border-b border-slate-800 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="mx-auto max-w-2xl space-y-3 text-center">
                            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">What we stand for</h2>
                            <p className="text-sm text-slate-400 md:text-base">Four principles guide every tool we build.</p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {PRINCIPLES.map(({ icon: Icon, title, text, color, bg }) => (
                                <div key={title} className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
                                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${bg} ${color}`}>
                                        <Icon className="h-7 w-7" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* What you can do here */}
                <section className="border-b border-slate-800 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="mx-auto max-w-2xl space-y-3 text-center">
                            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">What you can do here</h2>
                            <p className="text-sm text-slate-400 md:text-base">Tools grouped by the kind of job you need done.</p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {AREAS.map(({ icon: Icon, title, text, param }) => {
                                const n = count(param);
                                if (n === 0) return null;
                                return (
                                    <Link
                                        key={title}
                                        href={`/categories?category=${encodeURIComponent(param)}`}
                                        className="group flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-7 transition hover:border-blue-500/50"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <Icon className="h-7 w-7 text-blue-400" aria-hidden="true" />
                                            <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">{n} {n === 1 ? "tool" : "tools"}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white transition group-hover:text-blue-400">{title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
                                    </Link>
                                );
                            })}
                            <Link
                                href="/categories"
                                className="group flex flex-col justify-between rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 p-7 transition hover:border-blue-400/60"
                            >
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Everything in one place</p>
                                    <h3 className="mt-2 text-lg font-bold text-white">Browse all {total} tools</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-300">Search the full directory or filter by category.</p>
                                </div>
                                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-300">
                                    Open directory <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* How we work */}
                <section className="border-b border-slate-800 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="mx-auto max-w-2xl space-y-3 text-center">
                            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">How we build and check our tools</h2>
                            <p className="text-sm text-slate-400 md:text-base">
                                Our <Link href="/blog" className="font-semibold text-blue-400 hover:underline">articles</Link> explain the ideas behind the tools. Found a problem? <Link href="/contact" className="font-semibold text-blue-400 hover:underline">Tell us</Link>.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {PROCESS.map(({ icon: Icon, title, text }) => (
                                <div key={title} className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                        <Icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{title}</h3>
                                    <p className="mt-2 text-sm leading-7 text-slate-400">{text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-7">
                                <h3 className="mb-4 text-lg font-bold text-white">What we do</h3>
                                <ul className="space-y-3">
                                    {DOES.map((d) => (
                                        <li key={d} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />{d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
                                <h3 className="mb-4 text-lg font-bold text-white">What we don&apos;t do</h3>
                                <ul className="space-y-3">
                                    {DOESNT.map((d) => (
                                        <li key={d} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />{d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Funding */}
                <section className="border-b border-slate-800 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12 lg:grid-cols-2">
                        <div className="space-y-4">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Transparency</p>
                            <h2 className="text-3xl font-black tracking-tight text-white">How ProTools Hub is funded</h2>
                            <p className="text-base leading-8 text-slate-300">
                                Every tool is free. The site is supported by advertising, including Google AdSense. For details about cookies and ad choices, see our{" "}
                                <Link href="/privacy" className="font-semibold text-blue-400 hover:underline">Privacy Policy</Link> and{" "}
                                <Link href="/terms" className="font-semibold text-blue-400 hover:underline">Terms of Service</Link>.
                            </p>
                        </div>
                        <ul className="space-y-4">
                            {FUNDING.map(({ icon: Icon, title, text }) => (
                                <li key={title} className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">{title}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* FAQ */}
                <section className="border-b border-slate-800 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-8">
                        <h2 className="text-center text-3xl font-black tracking-tight text-white md:text-4xl">Common questions</h2>
                        <div className="space-y-3">
                            {FAQS.map((f) => (
                                <details key={f.q} className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 open:border-blue-500/30">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white">
                                        {f.q}
                                        <span className="text-blue-400 transition group-open:rotate-45" aria-hidden="true">+</span>
                                    </summary>
                                    <p className="mt-3 text-sm leading-7 text-slate-300">{f.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-10 text-center">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Get in touch</h2>
                            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300">
                                Found a bug, need a tool we do not have yet, or want to ask a question? We read every message.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500">
                                <Mail className="h-4 w-4" aria-hidden="true" /> Contact us
                            </Link>
                            <Link href="/categories" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">
                                Browse tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link href="/blog" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">
                                <BookOpen className="h-4 w-4" aria-hidden="true" /> Read the blog
                            </Link>
                        </div>
                        <p className="text-xs text-slate-400">Email: <a href={`mailto:${EMAIL}`} className="font-semibold text-blue-400 hover:underline">{EMAIL}</a></p>
                    </div>
                </section>
            </main>
        </>
    );
}