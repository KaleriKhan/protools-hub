"use client";

// app/tools/page.tsx
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { tools } from "@/data/tools";
import { Search, Sparkles, ArrowRight, Layers, XCircle, Zap, ShieldCheck } from "lucide-react";

const CATEGORIES = ["All", "PDF", "Image", "Text", "Developer", "Security"];

function Directory() {
    const params = useSearchParams();
    const qParam = params.get("q") ?? "";
    const catParam = params.get("category") ?? "";

    const [search, setSearch] = useState(qParam);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => setSearch(qParam), [qParam]);
    useEffect(() => {
        const m = CATEGORIES.find((c) => c.toLowerCase() === catParam.toLowerCase());
        setActiveCategory(m ?? "All");
    }, [catParam]);

    // Only show tabs that have tools.
    const tabs = useMemo(
        () => CATEGORIES.filter((c) => c === "All" || tools.some((t) => t.category.toLowerCase().includes(c.toLowerCase()))),
        []
    );

    const filteredTools = useMemo(() => {
        const q = search.trim().toLowerCase();
        return tools.filter((tool) => {
            const matchesSearch = !q || tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q);
            const matchesCategory = activeCategory === "All" || tool.category.toLowerCase().includes(activeCategory.toLowerCase());
            return matchesSearch && matchesCategory;
        });
    }, [search, activeCategory]);

    return (
        <div className="bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-5xl space-y-10">
                <div className="mx-auto max-w-2xl space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>ProTools Hub directory</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Free online tools</h1>
                    <p className="text-sm leading-relaxed text-slate-400">
                        {tools.length} free tools for working with PDFs, images, text and code. Most run in your browser, so your files are processed on your own device.
                    </p>
                </div>

                <div className="mx-auto max-w-xl">
                    <div className="relative">
                        <label htmlFor="dir-search" className="sr-only">Search tools</label>
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            id="dir-search"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tools by name or keyword…"
                            className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3.5 pl-11 pr-10 text-sm text-slate-200 shadow-xl outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-200">
                                <XCircle className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-xl">
                    {tabs.map((category) => (
                        <button
                            key={category}
                            type="button"
                            aria-pressed={activeCategory === category}
                            onClick={() => setActiveCategory(category)}
                            className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition ${activeCategory === category ? "bg-blue-600 text-white shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-4">
                        <h2 className="text-xl font-bold text-white">{activeCategory === "All" ? "All available tools" : `${activeCategory} tools`}</h2>
                        <p className="mt-1 text-xs text-slate-400">
                            Showing {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}.
                        </p>
                    </div>

                    {filteredTools.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredTools.map((tool) => (
                                <Link
                                    key={tool.id}
                                    href={`/tools/${tool.slug}`}
                                    className="group flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
                                >
                                    <div className="space-y-3">
                                        <span className="inline-block rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">{tool.category}</span>
                                        <h3 className="text-base font-bold text-white transition group-hover:text-blue-400">{tool.name}</h3>
                                        <p className="line-clamp-3 text-xs leading-relaxed text-slate-400">{tool.description}</p>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Free · No sign-up</span>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 transition-transform group-hover:translate-x-1.5">
                                            Open tool <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 rounded-3xl border border-dashed border-slate-800 bg-slate-900 px-6 py-16 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-400">
                                <Layers className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h3 className="text-base font-bold text-white">No matching tools found</h3>
                            <p className="mx-auto max-w-sm text-xs text-slate-400">Try a different keyword or clear the filters.</p>
                            <button
                                type="button"
                                onClick={() => { setSearch(""); setActiveCategory("All"); }}
                                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500"
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 pt-6 sm:grid-cols-3">
                    {[
                        { Icon: Zap, color: "text-amber-400", t: "In-browser processing", d: "File tools run in your browser using standard web features such as Canvas." },
                        { Icon: ShieldCheck, color: "text-emerald-400", t: "Files stay on your device", d: "File contents are not uploaded to our servers. See the Privacy Policy for details." },
                        { Icon: Sparkles, color: "text-blue-400", t: "Free, no account", d: "Use any tool without registering. The site is supported by ads." },
                    ].map(({ Icon, color, t, d }) => (
                        <div key={t} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
                            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
                            <div>
                                <h4 className="text-xs font-bold text-white">{t}</h4>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default function ToolsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading tools…</div>}>
            <Directory />
        </Suspense>
    );
}