"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { tools } from "@/data/tools";
import {
    Image as ImageIcon, FileText, Search, Sparkles, ArrowRight, ShieldCheck, Layers,
    FileCode, QrCode, Type, Hash, FileJson, Palette, Binary, ScanSearch, Maximize2,
    type LucideIcon,
} from "lucide-react";

type ToolCategory = "All" | "PDF" | "Image" | "Text" | "Developer" | "Security";

// Icons by slug; anything else falls back to an icon for its category.
const SLUG_ICONS: Record<string, LucideIcon> = {
    "pdf-to-word": FileText, "pdf-compressor": FileText,
    "image-compressor": ImageIcon, "image-resizer": Maximize2, "image-upscaler": ScanSearch,
    "password-generator": ShieldCheck, "json-formatter": FileJson, "json-schema-generator": FileCode,
    "qr-code-generator": QrCode, "base64-encoder": Binary, "markdown-to-html": FileCode,
    "css-generators": Palette, "glassmorphism-generator": Palette,
    "text-case-converter": Type, "word-counter": Hash, "text-summarizer": Sparkles,
    "lorem-ipsum-generator": Type,
};

const iconFor = (slug: string, category: string): LucideIcon => {
    if (SLUG_ICONS[slug]) return SLUG_ICONS[slug];
    const c = category.toLowerCase();
    if (c.includes("pdf")) return FileText;
    if (c.includes("image")) return ImageIcon;
    if (c.includes("text")) return Type;
    if (c.includes("secur")) return ShieldCheck;
    return FileCode;
};

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
        return tools.filter(
            (t) =>
                (selected === "All" || t.category.toLowerCase().includes(selected.toLowerCase())) &&
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
                                className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition ${selected === cat ? "bg-blue-600 text-white shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
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
                            const Icon = iconFor(tool.slug, tool.category);
                            return (
                                <Link
                                    key={tool.id}
                                    href={`/tools/${tool.slug}`}
                                    className="group flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
                                                <Icon className="h-6 w-6" aria-hidden="true" />
                                            </div>
                                            <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300">{tool.category}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <h2 className="text-base font-bold text-white transition group-hover:text-blue-400">{tool.name}</h2>
                                            <p className="line-clamp-3 text-xs leading-relaxed text-slate-400">{tool.description}</p>
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

// Server-rendered fallback: crawlers see an H1 and a link to every tool.
function StaticCategories() {
    return (
        <div className="bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-5xl space-y-8">
                <h1 className="text-center text-3xl font-extrabold tracking-tight text-white md:text-4xl">Tool categories</h1>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool) => (
                        <li key={tool.slug} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                            <Link href={`/tools/${tool.slug}`} className="font-bold text-white hover:text-blue-400">{tool.name}</Link>
                            <p className="mt-1.5 text-sm text-slate-400">{tool.description}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default function CategoriesContent() {
    return (
        <Suspense fallback={<StaticCategories />}>
            <Inner />
        </Suspense>
    );
}