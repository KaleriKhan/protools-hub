import Link from "next/link";
import { tools } from "@/data/tools";
import { ArrowRight, MousePointerClick, Cpu, Download, CheckCircle2 } from "lucide-react";

const FAQS = [
    { q: "Are the tools on ProTools Hub really free?", a: "Yes. Every tool is free to use without an account, a subscription or a daily limit. The site is supported by advertising." },
    { q: "Are my files uploaded to your servers?", a: "For the file tools, such as the image, PDF and text tools, processing happens in your browser, so the file contents are not sent to our servers. Some features may download extra resources first, such as OCR language data. You can confirm this in your browser's Network tab." },
    { q: "Do I need to create an account?", a: "No. Open a tool, add your file or text and use it straight away." },
    { q: "Which browsers are supported?", a: "Current versions of Chrome, Edge, Firefox and Safari. Very old browsers may lack features such as WebP encoding or the Web Crypto API." },
    { q: "Is there a file size limit?", a: "Limits depend on your device's memory because everything runs locally. Each tool page lists its own size limits so large files do not freeze your browser." },
    { q: "Does the site use cookies or ads?", a: "Yes. We show ads and may use cookies for ads and basic analytics. This is separate from your file contents. Our Privacy Policy explains the details and your choices." },
    { q: "How do I report a bug or request a tool?", a: "Use the Contact page. Tell us which tool you were using and what happened, and we will look into it." },
    { q: "Can I use the results commercially?", a: "Yes, the files you create are yours. Please make sure you have the right to use the original material you process. See our Terms of Service for full details." },
];

const STEPS = [
    { icon: MousePointerClick, title: "Choose a tool", text: "Browse by category or search for what you need, such as a PDF compressor or a JSON formatter." },
    { icon: Cpu, title: "Process it in your browser", text: "Add your file or text. The tool runs on your own device using standard browser features, so there is no upload wait." },
    { icon: Download, title: "Download the result", text: "Preview the output, then download the file or copy the text. Nothing is saved to an account." },
];

export default function HomeContent() {
    const facts = [
        `${tools.length} free tools in one place`,
        "No sign-up, no daily limits",
        "Files processed in your browser",
        "A written guide on every tool page",
        "Practical articles in our blog",
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

            {/* About */}
            <section className="border-b border-slate-800 bg-slate-950 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12 lg:grid-cols-2">
                        <div className="space-y-6">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-400">About us</p>
                            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">What is ProTools Hub?</h2>
                            <div className="space-y-4 text-base leading-7 text-slate-300">
                                <p>
                                    ProTools Hub is a collection of free online utilities for everyday jobs: shrinking an image for a website, turning a PDF into a Word document, checking whether a block of JSON is valid, or generating a strong password. We build each tool ourselves and write a guide for it, so you can see what it does before you use it.
                                </p>
                                <p>
                                    Most tools use the processing power of your own browser. When you resize a photo or compress a PDF, the work happens on your device, which keeps files off our servers and makes results fast even on a slow connection.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                                <Link href="/about" className="inline-flex items-center gap-1.5 text-blue-400 hover:underline">
                                    More about us <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                                <Link href="/blog" className="inline-flex items-center gap-1.5 text-blue-400 hover:underline">
                                    Read the blog <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
                            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">At a glance</h3>
                            <ul className="space-y-4">
                                {facts.map((f) => (
                                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-200">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="border-b border-slate-800 bg-slate-950 py-24">
                <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
                    <div className="space-y-3 text-center">
                        <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">How it works</h2>
                        <p className="text-sm text-slate-400 md:text-base">Three steps from file to result.</p>
                    </div>
                    <ol className="grid gap-6 md:grid-cols-3">
                        {STEPS.map(({ icon: Icon, title, text }, i) => (
                            <li key={title} className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-7">
                                <div className="mb-6 flex items-center justify-between">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{i + 1}</span>
                                    <Icon className="h-7 w-7 text-blue-400" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-bold text-white">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Privacy + FAQ */}
            <section className="border-b border-slate-800 bg-slate-950 py-24">
                <div className="mx-auto max-w-4xl space-y-16 px-4 sm:px-6 lg:px-8">
                    <div className="space-y-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 md:p-10">
                        <h2 className="text-2xl font-bold text-white">Your files and your privacy</h2>
                        <p className="text-base leading-7 text-slate-300">
                            Many online converters make you upload a document to a remote server. Our file tools avoid that by working inside your browser tab, using features such as the Canvas API for images and JavaScript libraries for PDFs. The file contents stay on your device. As with most websites, the site itself may use cookies for advertising and analytics; our{" "}
                            <Link href="/privacy" className="font-semibold text-emerald-300 hover:underline">Privacy Policy</Link> explains what is collected and how to control it. To learn how to check a tool's behaviour yourself, read{" "}
                            <Link href="/blog/why-in-browser-file-processing-means-100-percent-privacy" className="font-semibold text-emerald-300 hover:underline">our guide to in-browser file processing</Link>.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-center text-3xl font-black tracking-tight text-white md:text-4xl">Frequently asked questions</h2>
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
                </div>
            </section>
        </>
    );
}