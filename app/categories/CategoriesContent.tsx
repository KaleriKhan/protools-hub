"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Image as ImageIcon, FileText, Search, Sparkles, ArrowRight, ShieldCheck, Layers,
    FileCode, QrCode, Type, Hash, FileJson, Palette, Binary, ScanSearch, Maximize2,
    type LucideIcon,
} from "lucide-react";

type ToolCategory = "All" | "PDF" | "Image" | "Text" | "Developer" | "Security";

type ToolItem = {
    id: string;
    name: string;
    description: string;
    category: Exclude<ToolCategory, "All">;
    href: string;
    icon: LucideIcon;
    badge: string;
    isPopular?: boolean;
};

// NOTE: check each href matches your real route; the first six are from your old file.
const TOOLS: ToolItem[] = [
    { id: "image-compressor", name: "Image Compressor & Converter", description: "Compress JPEG, PNG and WebP images in batches, compare before and after, and download as ZIP or a single PDF.", category: "Image", href: "/tools/image-compressor", icon: ImageIcon, badge: "Batch", isPopular: true },
    { id: "image-resizer", name: "Image Resizer", description: "Resize by pixels or percent with a locked aspect ratio, size presets and PNG, JPEG or WebP output.", category: "Image", href: "/tools/image-resizer", icon: Maximize2, badge: "Presets" },
    { id: "image-upscaler", name: "Image Upscaler", description: "Enlarge images with high-quality browser resampling and optional sharpening.", category: "Image", href: "/tools/image-upscaler", icon: ScanSearch, badge: "Resample" },
    { id: "pdf-compressor", name: "PDF Compressor", description: "Reduce PDF file size in your browser using PDF.js and pdf-lib.", category: "PDF", href: "/tools/pdf-compressor", icon: FileText, badge: "In-browser", isPopular: true },
    { id: "pdf-to-word", name: "PDF to Word Converter", description: "Convert text and scanned PDFs into editable Word documents with English and Urdu OCR.", category: "PDF", href: "/tools/pdf-to-word", icon: FileText, badge: "OCR", isPopular: true },
    { id: "password-generator", name: "Password Generator", description: "Generate strong random passwords using your browser's cryptographic random generator.", category: "Security", href: "/tools/password-generator", icon: ShieldCheck, badge: "Secure random", isPopular: true },
    { id: "json-formatter", name: "JSON Formatter & Validator", description: "Format, validate and minify JSON with clear syntax error messages.", category: "Developer", href: "/tools/json-formatter", icon: FileJson, badge: "Dev tool" },
    { id: "json-schema-generator", name: "JSON Schema Generator", description: "Generate a JSON Schema from a sample JSON document.", category: "Developer", href: "/tools/json-schema-generator", icon: FileCode, badge: "Dev tool" },
    { id: "qr-code-generator", name: "QR Code Generator", description: "Create QR codes for links, Wi-Fi, text and email, and download them as PNG.", category: "Developer", href: "/tools/qr-code-generator", icon: QrCode, badge: "PNG export" },
    { id: "base64-encoder", name: "Base64 Encoder & Decoder", description: "Encode and decode Base64 text, including Unicode and URL-safe variants.", category: "Developer", href: "/tools/base64-encoder", icon: Binary, badge: "Unicode" },
    { id: "markdown-to-html", name: "Markdown to HTML", description: "Convert Markdown to clean HTML with a live preview.", category: "Developer", href: "/tools/markdown-to-html", icon: FileCode, badge: "Live preview" },
    { id: "css-generators", name: "CSS Generators", description: "Glassmorphism, box shadow, gradient, flexbox and 15 more CSS generators with copy-ready code.", category: "Developer", href: "/tools/glassmorphism-generator", icon: Palette, badge: "19 tools" },
    { id: "text-case-converter", name: "Text Case Converter", description: "Switch text between upper, lower, title, sentence, camel, snake and kebab case.", category: "Text", href: "/tools/text-case-converter", icon: Type, badge: "Instant" },
    { id: "word-counter", name: "Word Counter", description: "Count words, characters, sentences and reading time, including Arabic and Urdu text.", category: "Text", href: "/tools/word-counter", icon: Hash, badge: "Live count" },
    { id: "text-summarizer", name: "Text Summarizer", description: "Pick the most important sentences from long text with extractive summarizing.", category: "Text", href: "/tools/text-summarizer", icon: Sparkles, badge: "Extractive" },
];

const CATEGORIES: ToolCategory[] = ["All", "PDF", "Image", "Text", "Developer", "Security"];

function Inner() {
    const params = useSearchParams();
    const categoryParam = params.get("category");
    const qParam = params.get("q") ?? "";

    const [selected, setSelected] = useState<ToolCategory>("All");
    const [query, setQuery] = useState(qParam);

    useEffect(() => {
        const m = CATEGORIES.find((c) => c.toLowerCase() === (categoryParam ?? "").toLowerCase());
        setSelected(m ?? "All");
    }, [categoryParam]);

    useEffect(() => setQuery(qParam), [qParam]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return TOOLS.filter(
            (t) =>
                (selected === "All" || t.category === selected) &&
                (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
        );
    }, [selected, query]);

    return (
        <div className="bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-10">
                <div className="mx-auto max-w-2xl space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Tool Directory</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                        {selected === "All" ? "All Free Online Tools" : `${selected} Tools`}
                    </h1>
                    <p className="text-sm leading-relaxed text-slate-400">
                        {filtered.length} {filtered.length === 1 ? "tool" : "tools"} shown. Every tool is free, needs no account, and processes your files in your browser.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl md:flex-row">
                    <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-2 md:w-auto md:pb-0" role="tablist" aria-label="Categories">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                role="tab"
                                aria-selected={selected === cat}
                                onClick={() => setSelected(cat)}
                                className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition ${
                                    selected === cat ? "bg-blue-600 text-white shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                            >
                                {cat === "All" ? "All" : cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <label htmlFor="tool-filter" className="sr-only">Search tools</label>
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            id="tool-filter"
                            type="search"
                            placeholder="Search tools…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-4 text-xs font-medium text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {filtered.map((tool) => {
                            const Icon = tool.icon;
                            return (
                                <Link
                                    key={tool.id}
                                    href={tool.href}
                                    className="group flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
                                                <Icon className="h-6 w-6" aria-hidden="true" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {tool.isPopular && (
                                                    <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">Popular</span>
                                                )}
                                                <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300">{tool.badge}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <h2 className="text-base font-bold text-white transition group-hover:text-blue-400">{tool.name}</h2>
                                            <p className="text-xs leading-relaxed text-slate-400">{tool.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{tool.category}</span>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 transition-transform group-hover:translate-x-1.5">
                                            Open tool <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-400">
                            <Layers className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h2 className="text-sm font-bold text-white">No tools match your search</h2>
                        <button
                            type="button"
                            onClick={() => { setQuery(""); setSelected("All"); }}
                            className="cursor-pointer text-xs font-bold text-blue-400 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CategoriesContent() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading tools…</div>}>
            <Inner />
        </Suspense>
    );
}