"use client";

import React, { useState } from "react";
import Link from "next/link";
import { tools } from "@/data/tools";
import { Search, Sparkles, ArrowRight, ShieldCheck, Zap, Lock } from "lucide-react";

export default function Hero() {
  const [query, setQuery] = useState("");

  const filteredTools = query.trim()
    ? tools.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  const handleScrollToTools = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById("featured-tools");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white py-16 md:py-24 border-b border-slate-100">

      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-blue-400 blur-3xl opacity-30"></div>
        <div className="absolute top-20 right-1/4 h-80 w-80 rounded-full bg-indigo-300 blur-3xl opacity-30"></div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm border border-blue-100 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>100% Free • Client-Side Security • No Sign-Up</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Smart Online Tools Built for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Speed & Convenience
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
          Format JSON, compress PDFs, generate secure passwords, convert text cases, and create QR codes — all processed right inside your browser without uploading data.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={handleScrollToTools}
            className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/35 transition cursor-pointer"
          >
            Explore All Tools
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <Link
            href="/categories"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            Browse Categories
          </Link>
        </div>

        {/* Interactive Search Bar */}
        <div className="relative mx-auto mt-10 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tool (e.g. PDF Compressor, JSON Formatter, Password)..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-xl shadow-slate-200/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          {/* Search Results Dropdown */}
          {query.trim() !== "" && (
            <div className="absolute left-0 right-0 top-16 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl text-left max-h-72 overflow-y-auto">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-blue-50/60 transition group"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                        {tool.name}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">{tool.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100/60 px-2.5 py-1 rounded-md">
                      {tool.category}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="p-4 text-sm text-slate-500 text-center">No matching tools found.</p>
              )}
            </div>
          )}
        </div>

        {/* Value Highlights */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/80 pt-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Instant Execution</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <Lock className="h-4 w-4 text-emerald-500" />
            <span>100% Privacy Preserved</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <span>Browser-Based Engine</span>
          </div>
        </div>

      </div>
    </section>
  );
}