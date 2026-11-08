"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Clock, User, ArrowRight, Tag, Sparkles, Wrench } from "lucide-react";
import { POSTS, AUTHOR, formatDate } from "@/data/posts";

const CATEGORIES = ["All", "Optimization", "Tutorials", "Security", "Tools"];

export default function BlogContent() {
    const [category, setCategory] = useState("All");
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return POSTS.filter(
            (p) =>
                (category === "All" || p.category === category) &&
                (!q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
        );
    }, [category, query]);

    const featured = POSTS.find((p) => p.featured);
    const showFeatured = featured && category === "All" && !query.trim();
    const gridPosts = showFeatured ? filtered.filter((p) => p.slug !== featured!.slug) : filtered;

    return (
        <div className="bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-10">
                <div className="mx-auto max-w-2xl space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Guides & Tutorials</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Articles & Guides</h1>
                    <p className="text-sm leading-relaxed text-slate-400">
                        Practical guides on image and PDF optimization, privacy and everyday browser tools.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl md:flex-row">
                    <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-2 md:w-auto md:pb-0">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                aria-pressed={category === cat}
                                onClick={() => setCategory(cat)}
                                className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition ${category === cat ? "bg-blue-600 text-white shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <label htmlFor="blog-search" className="sr-only">Search articles</label>
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            id="blog-search"
                            type="search"
                            placeholder="Search articles…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-4 text-xs font-medium text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {showFeatured && featured && (
                    <Link
                        href={`/blog/${featured.slug}`}
                        className="group block rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition hover:border-blue-500/50 md:p-8"
                    >
                        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
                            <div className="max-w-2xl space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Featured</span>
                                    <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300">{featured.category}</span>
                                </div>
                                <h2 className="text-xl font-bold text-white transition group-hover:text-blue-400 md:text-2xl">{featured.title}</h2>
                                <p className="text-xs leading-relaxed text-slate-400 md:text-sm">{featured.excerpt}</p>
                                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-400">
                                    <span className="flex items-center gap-1.5 text-slate-300"><User className="h-3.5 w-3.5" aria-hidden="true" />{AUTHOR}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{featured.readTime}</span>
                                    <span>{formatDate(featured.date)}</span>
                                </div>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition group-hover:bg-blue-500">
                                Read article <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                        </div>
                    </Link>
                )}

                {gridPosts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {gridPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition hover:border-blue-500/50 hover:shadow-xl"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400">
                                            <Tag className="h-3 w-3" aria-hidden="true" />{post.category}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400">{post.readTime}</span>
                                    </div>
                                    <h3 className="line-clamp-3 text-base font-bold text-white transition group-hover:text-blue-400">{post.title}</h3>
                                    <p className="line-clamp-3 text-xs leading-relaxed text-slate-400">{post.excerpt}</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-medium text-slate-400">
                                    <span>{formatDate(post.date)}</span>
                                    <span className="flex items-center gap-1 font-bold text-blue-400 transition-transform group-hover:translate-x-1">
                                        Read <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    !showFeatured && (
                        <p className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">No articles match your search.</p>
                    )
                )}

                <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 sm:flex-row">
                    <div className="space-y-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-white">Ready to try the tools?</h3>
                        <p className="text-xs text-slate-400">Compress images, convert PDFs, format JSON and more, free and in your browser.</p>
                    </div>
                    <Link href="/categories" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-500">
                        <Wrench className="h-4 w-4" aria-hidden="true" /> Browse all tools
                    </Link>
                </div>
            </div>
        </div>
    );
}