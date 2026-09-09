"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { tools } from "@/data/tools";
import {
    Search,
    Sparkles,
    ArrowRight,
    Layers,
    XCircle,
    Zap,
    ShieldCheck,
} from "lucide-react";

export default function ToolsPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const categories = [
        "All",
        "PDF",
        "Image",
        "Text",
        "Developer",
        "AI",
        "Calculator",
    ];

    const filteredTools = useMemo(() => {
        return tools.filter((tool) => {
            const matchesSearch =
                tool.name.toLowerCase().includes(search.toLowerCase()) ||
                tool.description.toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                activeCategory === "All" ||
                tool.category.toLowerCase().includes(activeCategory.toLowerCase());

            return matchesSearch && matchesCategory;
        });
    }, [search, activeCategory]);

    if (!isMounted) {
        return null; // Prevents SSR Hydration Mismatch
    }

    return (
        <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-5xl space-y-10">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        <span>ProTools Hub Directory</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                        Free Online Utilities
                    </h1>

                    <p className="text-slate-500 text-sm leading-relaxed">
                        Powerful, fast, and secure client-side tools for web developers, designers, students, and content creators.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mx-auto max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search tools by name or keyword..."
                            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 py-3.5 text-sm text-slate-900 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Categories Bar */}
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                    {categories.map((category) => {
                        const active = activeCategory === category;

                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setActiveCategory(category)}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${active
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60"
                                    }`}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>

                {/* Tools Header & Count */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {activeCategory === "All"
                                    ? "All Available Tools"
                                    : `${activeCategory} Tools`}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Showing {filteredTools.length}{" "}
                                {filteredTools.length === 1 ? "utility" : "utilities"} in directory.
                            </p>
                        </div>
                    </div>

                    {/* Tools Grid */}
                    {filteredTools.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredTools.map((tool) => (
                                <Link
                                    key={tool.id}
                                    href={`/tools/${tool.slug}`}
                                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-100">
                                                {tool.category}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                                            {tool.name}
                                        </h3>

                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                                            {tool.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Browser Native
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1.5 transition-transform">
                                            <span>Open Tool</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center space-y-3">
                            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Layers className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                No matching tools found
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                We couldn't find any tools matching your search criteria. Try clearing your filters or search keywords.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setActiveCategory("All");
                                }}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                            >
                                Reset Search Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Privacy & Trust Badges */}
                <div className="grid gap-4 sm:grid-cols-3 pt-6">
                    <div className="rounded-2xl bg-white p-4 border border-slate-200/80 flex items-start gap-3 shadow-sm">
                        <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-xs text-slate-900">In-Browser Processing</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Executes local client-side scripts directly inside WebAssembly/Canvas.</p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 border border-slate-200/80 flex items-start gap-3 shadow-sm">
                        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-xs text-slate-900">Zero Server Uploads</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Files are never transmitted over external networks or cloud APIs.</p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 border border-slate-200/80 flex items-start gap-3 shadow-sm">
                        <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-xs text-slate-900">Instant Access</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Free forever with unlimited daily usage and zero registration barriers.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}