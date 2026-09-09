"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Image as ImageIcon,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Layers,
  Sliders,
  FileType,
  FileCode,
  QrCode,
} from "lucide-react";

type ToolCategory = "All" | "PDF" | "Image" | "Text" | "Developer" | "Security" | "Calculator";

type ToolItem = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  href: string;
  icon: any;
  badge: string;
  isPopular?: boolean;
};

const TOOLS: ToolItem[] = [
  {
    id: "image-compressor",
    name: "Image Compressor & Converter",
    description: "Compress image file size, resize dimensions, and convert between JPEG, PNG, WebP, and PDF.",
    category: "Image",
    href: "/tools/image-compressor",
    icon: ImageIcon,
    badge: "Client-Side",
    isPopular: true,
  },
  {
    id: "pdf-compressor",
    name: "PDF Compressor",
    description: "Reduce PDF file size right inside your browser using PDF.js and pdf-lib with zero quality loss.",
    category: "PDF",
    href: "/tools/pdf-compressor",
    icon: FileText,
    badge: "Fast Engine",
    isPopular: true,
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word Converter",
    description: "Convert normal and scanned PDFs into editable Word documents with English and Urdu OCR.",
    category: "PDF",
    href: "/tools/pdf-to-word",
    icon: FileText,
    badge: "OCR Enabled",
    isPopular: true,
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate ultra-secure, encrypted passwords locally in your browser.",
    category: "Security",
    href: "/tools/password-generator",
    icon: ShieldCheck,
    badge: "Encrypted",
    isPopular: true,
  },
  {
    id: "json-formatter",
    name: "JSON Formatter & Validator",
    description: "Format, validate, and beautify your JSON data with instant syntax error highlighting.",
    category: "Developer",
    href: "/tools/json-formatter",
    icon: FileCode,
    badge: "Dev Tool",
  },
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    description: "Generate custom QR codes instantly for links, Wi-Fi networks, text, and email addresses.",
    category: "Developer",
    href: "/tools/qr-code-generator",
    icon: QrCode,
    badge: "Instant",
  },
];

const CATEGORIES: ToolCategory[] = [
  "All",
  "PDF",
  "Image",
  "Text",
  "Developer",
  "Security",
  "Calculator",
];

function CategoriesContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-select filter if URL contains ?category=PDF / Security etc.
  useEffect(() => {
    if (categoryParam) {
      const matched = CATEGORIES.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched);
      }
    }
  }, [categoryParam]);

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory =
      selectedCategory === "All" ||
      tool.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tool Directory</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {selectedCategory === "All" ? "All Categories & Tools" : `${selectedCategory} Tools`}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Showing filtered web utilities based on your selection.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                {cat} Tools
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>
        </div>

        {/* Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                        <IconComponent className="h-6 w-6" />
                      </div>

                      <div className="flex items-center gap-2">
                        {tool.isPopular && (
                          <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                          {tool.badge}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {tool.name}
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {tool.category} Tools
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1.5 transition-transform">
                      <span>Open Tool</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">No Tools Found in {selectedCategory}</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading categories...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}