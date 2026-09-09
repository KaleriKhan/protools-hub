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
    bgColor: "bg-red-50 border-red-100",
  },
  {
    title: "Image Tools",
    description: "Resize, compress and optimize your images.",
    icon: ImageIcon,
    queryParam: "Image",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
  },
  {
    title: "Text Tools",
    description: "Format, convert and work with text easily.",
    icon: Type,
    queryParam: "Text",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
  },
  {
    title: "Developer Tools",
    description: "Useful tools for developers and programmers.",
    icon: Code2,
    queryParam: "Developer",
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-100",
  },
  {
    title: "Security Tools",
    description: "Generate passwords, protect and encrypt your data.",
    icon: ShieldCheck,
    queryParam: "Security",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
  },
  {
    title: "Calculators & Converters",
    description: "Fast, accurate and simple online calculators.",
    icon: Calculator,
    queryParam: "Calculator",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-100",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="py-16 bg-slate-50/50 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Categories
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Find the right tool for your needs.
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
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200 cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${cat.bgColor} ${cat.color} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center justify-center rounded-xl bg-slate-100/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                    Explore Category
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}