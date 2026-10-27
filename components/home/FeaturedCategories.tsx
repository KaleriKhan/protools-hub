"use client";

import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Type,
  Code2,
  ShieldCheck,
  Calculator,
  ArrowRight,
} from "lucide-react";

type CategoryItem = {
  title: string;
  description: string;
  icon: any;
  queryParam: string;
  color: string;
  bgColor: string;
};

const CATEGORIES: CategoryItem[] = [
  {
    title: "PDF Tools",
    description: "Convert, merge, compress and manage PDF files.",
    icon: FileText,
    queryParam: "PDF",
    color: "text-red-600",
    bgColor: "bg-red-50/80 border-red-100",
  },
  {
    title: "Image Tools",
    description: "Resize, compress and optimize your images.",
    icon: ImageIcon,
    queryParam: "Image",
    color: "text-blue-600",
    bgColor: "bg-blue-50/80 border-blue-100",
  },
  {
    title: "Text Tools",
    description: "Format, convert and work with text easily.",
    icon: Type,
    queryParam: "Text",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50/80 border-emerald-100",
  },
  {
    title: "Developer Tools",
    description: "Useful tools for developers and programmers.",
    icon: Code2,
    queryParam: "Developer",
    color: "text-purple-600",
    bgColor: "bg-purple-50/80 border-purple-100",
  },
  {
    title: "Security Tools",
    description: "Generate passwords, protect and encrypt your data.",
    icon: ShieldCheck,
    queryParam: "Security",
    color: "text-amber-600",
    bgColor: "bg-amber-50/80 border-amber-100",
  },
  {
    title: "Calculators & Converters",
    description: "Fast, accurate and simple online calculators.",
    icon: Calculator,
    queryParam: "Calculator",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50/80 border-indigo-100",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Explore Categories
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Find the right high-performance tool for your exact needs instantly.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.title}
                href={`/categories?category=${encodeURIComponent(cat.queryParam)}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${cat.bgColor} ${cat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                    >
                      <IconComponent className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center justify-center rounded-xl bg-slate-200/80 px-4 py-2 text-xs font-bold text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    Explore Category
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-600 group-hover:translate-x-1.5 transition-all duration-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}