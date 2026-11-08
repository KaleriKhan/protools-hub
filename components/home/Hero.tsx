"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tools } from "@/data/tools";
import {
  Search, Sparkles, ArrowRight, ShieldCheck, Zap, Lock, FileText, Image as ImageIcon,
  Type, Code2, KeyRound, type LucideIcon,
} from "lucide-react";
import PopularSearches from "./PopularSearches";

const iconFor = (category: string): LucideIcon => {
  const c = category.toLowerCase();
  if (c.includes("pdf")) return FileText;
  if (c.includes("image")) return ImageIcon;
  if (c.includes("text")) return Type;
  if (c.includes("secur")) return KeyRound;
  return Code2;
};

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tools
      .filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .slice(0, 6);
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

  const scrollToTools = () => document.getElementById("featured-tools")?.scrollIntoView({ behavior: "smooth" });
  const preview = tools.slice(0, 5);

  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-600 opacity-20 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-indigo-600 opacity-20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        {/* Left: message, search, actions */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-slate-900 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{tools.length} free tools · No sign-up</span>
          </div>

          <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl xl:text-6xl">
            Free online tools for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
              files, images, text &amp; code
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Compress images and PDFs, convert PDF to Word, format JSON, generate passwords and QR codes. Your files are processed on your own device instead of being uploaded to our servers.
          </p>

          <div ref={wrapRef} className="relative mt-8 max-w-xl">
            <form role="search" onSubmit={onSubmit} className="group relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-sm transition duration-300 group-focus-within:opacity-40" aria-hidden="true" />
              <div className="relative flex items-center">
                <label htmlFor="hero-search" className="sr-only">Search tools</label>
                <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" aria-hidden="true" />
                <input
                  id="hero-search"
                  type="search"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                  placeholder="Search a tool, e.g. PDF compressor, JSON…"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pl-12 pr-28 text-sm text-slate-200 shadow-2xl transition-all placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button type="submit" className="absolute right-2 cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500">
                  Search
                </button>
              </div>
            </form>

            {open && query.trim() !== "" && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
                {results.length > 0 ? (
                  results.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between gap-3 rounded-xl p-3 transition hover:bg-slate-800"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-200 transition group-hover:text-blue-400">{tool.name}</p>
                        <p className="line-clamp-1 text-xs text-slate-400">{tool.description}</p>
                      </div>
                      <span className="shrink-0 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">{tool.category}</span>
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

          <div className="mt-5 max-w-xl text-left [&>div]:mt-0 [&_p]:mb-3 [&_ul]:justify-start">
            <PopularSearches />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToTools}
              className="group flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
            >
              Explore all tools
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <Link href="/categories" className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800">
              Browse categories
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-300">
            <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-amber-400" aria-hidden="true" />Instant results</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-400" aria-hidden="true" />Files stay on your device</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-400" aria-hidden="true" />No account needed</li>
          </ul>
        </div>

        {/* Right: live preview of the tool library */}
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900/90 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-3.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 flex-1 rounded-md bg-slate-800 px-3 py-1 text-[11px] text-slate-400">myprotoolshub.com/tools</span>
            </div>
            <div className="space-y-2.5 p-5">
              {preview.map((t) => {
                const Icon = iconFor(t.category);
                return (
                  <div key={t.id} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-200">{t.name}</p>
                      <p className="truncate text-xs text-slate-400">{t.description}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">{t.category}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-800 bg-emerald-500/5 px-5 py-3.5 text-xs font-semibold text-emerald-400">
              <Lock className="h-3.5 w-3.5" /> Processed in your browser, not uploaded
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}