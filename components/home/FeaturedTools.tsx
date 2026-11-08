"use client";

import Link from "next/link";
import { tools } from "@/data/tools";
import {
  FileText, Image as ImageIcon, QrCode, KeyRound, Code2, Type, FileSearch, FileArchive, Code,
  AlignLeft, ArrowRight, Sparkles, Maximize2, Binary, Palette, FileJson, ScanSearch,
} from "lucide-react";
import type { ReactElement } from "react";

const cls = "h-6 w-6";
const ICONS: Record<string, ReactElement> = {
  "pdf-to-word": <FileText className={`${cls} text-blue-400`} />,
  "image-compressor": <ImageIcon className={`${cls} text-emerald-400`} />,
  "image-resizer": <Maximize2 className={`${cls} text-sky-400`} />,
  "image-upscaler": <ScanSearch className={`${cls} text-cyan-400`} />,
  "qr-code-generator": <QrCode className={`${cls} text-purple-400`} />,
  "password-generator": <KeyRound className={`${cls} text-amber-400`} />,
  "json-formatter": <Code2 className={`${cls} text-indigo-400`} />,
  "json-schema-generator": <FileJson className={`${cls} text-indigo-300`} />,
  "text-case-converter": <Type className={`${cls} text-rose-400`} />,
  "word-counter": <FileSearch className={`${cls} text-teal-400`} />,
  "pdf-compressor": <FileArchive className={`${cls} text-red-400`} />,
  "markdown-to-html": <Code className={`${cls} text-cyan-400`} />,
  "lorem-ipsum-generator": <AlignLeft className={`${cls} text-orange-400`} />,
  "base64-encoder": <Binary className={`${cls} text-lime-400`} />,
  "glassmorphism-generator": <Palette className={`${cls} text-pink-400`} />,
};

export default function FeaturedTools() {
  return (
    <section id="featured-tools" className="scroll-mt-4 border-b border-slate-800 bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-400">
            {tools.length} free tools
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">Explore our free online tools</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            Pick a tool to compress, convert, format or generate. Each tool page explains how it works and answers common questions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
            >
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/80 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-blue-500/40 group-hover:bg-blue-600/20">
                    {ICONS[tool.slug] ?? <Sparkles className={`${cls} text-blue-400`} />}
                  </div>
                  <span className="rounded-lg bg-slate-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300 transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-400">
                    {tool.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-200 transition-colors group-hover:text-blue-400">{tool.name}</h3>
                <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-400">{tool.description}</p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-bold text-blue-400">
                <span>Use tool</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/categories" className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-500/50 hover:text-white">
            Browse by category <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}