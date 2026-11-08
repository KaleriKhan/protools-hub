"use client";

import Link from "next/link";
import { tools } from "@/data/tools";
import { FileText, Image as ImageIcon, Type, Code2, ShieldCheck, ArrowRight, type LucideIcon } from "lucide-react";

type CategoryItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  queryParam: string;
  color: string;
  bgColor: string;
};

const CATEGORIES: CategoryItem[] = [
  { title: "PDF Tools", description: "Compress PDFs and convert them to editable Word documents, including scanned files with OCR.", icon: FileText, queryParam: "PDF", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
  { title: "Image Tools", description: "Resize, compress and convert images between JPEG, PNG and WebP without uploading them.", icon: ImageIcon, queryParam: "Image", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  { title: "Text Tools", description: "Count words, change text case and summarize long passages in seconds.", icon: Type, queryParam: "Text", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  { title: "Developer Tools", description: "Format JSON, encode Base64, convert Markdown, generate QR codes and build CSS effects.", icon: Code2, queryParam: "Developer", color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20" },
  { title: "Security Tools", description: "Create strong random passwords using your browser's secure random generator.", icon: ShieldCheck, queryParam: "Security", color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20" },
];

export default function FeaturedCategories() {
  const count = (param: string) => tools.filter((t) => t.category.toLowerCase().includes(param.toLowerCase())).length;

  return (
    <section className="border-y border-slate-800 bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Explore categories</h2>
          <p className="text-sm leading-relaxed text-slate-400 md:text-base">Not sure which tool you need? Start with the kind of task you want to finish.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const n = count(cat.queryParam);
            if (n === 0) return null;
            return (
              <Link
                key={cat.title}
                href={`/categories?category=${encodeURIComponent(cat.queryParam)}`}
                className="group flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-110 ${cat.bgColor} ${cat.color}`}>
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                      {n} {n === 1 ? "tool" : "tools"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-200 transition-colors group-hover:text-blue-400">{cat.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{cat.description}</p>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">Explore category</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-blue-400" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}