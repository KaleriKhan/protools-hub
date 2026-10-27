"use client";

import React from "react";
import Link from "next/link";
import { tools } from "@/data/tools";
import {
  FileText,
  Image as ImageIcon,
  QrCode,
  KeyRound,
  Code2,
  Type,
  FileSearch,
  FileArchive,
  Code,
  AlignLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function FeaturedTools() {
  // Helper function to render unique icons for each tool slug
  const getToolIcon = (slug: string) => {
    switch (slug) {
      case "pdf-to-word":
        return <FileText className="h-6 w-6 text-blue-600" />;
      case "image-compressor":
        return <ImageIcon className="h-6 w-6 text-emerald-600" />;
      case "qr-code-generator":
        return <QrCode className="h-6 w-6 text-purple-600" />;
      case "password-generator":
        return <KeyRound className="h-6 w-6 text-amber-600" />;
      case "json-formatter":
        return <Code2 className="h-6 w-6 text-indigo-600" />;
      case "text-case-converter":
        return <Type className="h-6 w-6 text-rose-600" />;
      case "word-counter":
        return <FileSearch className="h-6 w-6 text-teal-600" />;
      case "pdf-compressor":
        return <FileArchive className="h-6 w-6 text-red-600" />;
      case "markdown-to-html":
        return <Code className="h-6 w-6 text-cyan-600" />;
      case "lorem-ipsum-generator":
        return <AlignLeft className="h-6 w-6 text-orange-600" />;
      default:
        return <Sparkles className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <section id="featured-tools" className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
            Powerful Utilities
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Explore Our Free Online Tools
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            Choose a utility below to start converting, compressing, formatting, or generating instantly.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div>
                {/* Header: Icon & Category */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                    {getToolIcon(tool.slug)}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-slate-200/80 px-3 py-1 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    {tool.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              {/* Card Footer Action */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Use Tool Now</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}