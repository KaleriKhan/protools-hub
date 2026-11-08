"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { tools } from "@/data/tools";

export default function SearchBar({ className = "" }: { className?: string }) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return tools
            .filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
            .slice(0, 5);
    }, [query]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onClick);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        router.push(results.length > 0 ? `/tools/${results[0].slug}` : `/categories?q=${encodeURIComponent(q)}`);
        setOpen(false);
    };

    return (
        <div ref={wrapRef} className={`relative w-full max-w-2xl ${className}`}>
            <form role="search" onSubmit={onSubmit}>
                <label htmlFor="searchbar-input" className="sr-only">Search tools</label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                        id="searchbar-input"
                        type="text"
                        autoComplete="off"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        placeholder="Search tools, e.g. PDF, image, JSON, password"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pl-14 pr-12 text-base text-slate-200 shadow-xl outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(""); setOpen(false); }}
                            aria-label="Clear search"
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-slate-400 transition hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </form>

            {open && query.trim() !== "" && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
                    {results.length > 0 ? (
                        results.map((t) => (
                            <Link
                                key={t.id}
                                href={`/tools/${t.slug}`}
                                onClick={() => setOpen(false)}
                                className="group flex items-center justify-between gap-3 rounded-xl p-3 transition hover:bg-slate-800"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-200 transition group-hover:text-blue-400">{t.name}</p>
                                    <p className="line-clamp-1 text-xs text-slate-400">{t.description}</p>
                                </div>
                                <span className="shrink-0 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">{t.category}</span>
                            </Link>
                        ))
                    ) : (
                        <p className="p-4 text-center text-sm text-slate-400">
                            No matching tools.{" "}
                            <Link href={`/categories?q=${encodeURIComponent(query.trim())}`} className="font-semibold text-blue-400 hover:underline">Search the directory</Link>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}