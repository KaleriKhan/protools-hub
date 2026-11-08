"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import MobileNav from "./MobileNav";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Press "/" anywhere to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/tools?q=${encodeURIComponent(q)}` : "/tools");
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur-md sm:px-6">
      <form role="search" onSubmit={onSubmit} className="w-full max-w-md">
        <label htmlFor="site-search" className="sr-only">Search tools</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            id="site-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools (JSON, PDF, Base64)…"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-10 text-sm text-slate-200 placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <kbd className="pointer-events-none absolute right-3 top-2 hidden rounded border border-slate-700 px-1.5 text-[11px] text-slate-500 sm:block">/</kbd>
        </div>
      </form>

      <div className="hidden shrink-0 items-center md:flex">
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
          Free · Runs in your browser
        </span>
      </div>

      <MobileNav />
    </header>
  );
}