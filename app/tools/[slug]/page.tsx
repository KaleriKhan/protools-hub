import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { tools } from "@/data/tools";

import JsonFormatter from "@/components/tools/JsonFormatter";
import ImageCompressor from "@/components/tools/ImageCompressor";
import QRCodeGenerator from "@/components/tools/QRCodeGenerator";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import TextCaseConverter from "@/components/tools/TextCaseConverter";
import WordCounter from "@/components/tools/WordCounter";
import PDFCompressor from "@/components/tools/PDFCompressor";
import PDFToWord from "@/components/tools/PDFToWord";
import MarkdownToHtml from "@/components/tools/MarkdownToHtml";
import LoremIpsumGenerator from "@/components/tools/LoremIpsumGenerator";

import {
  BookOpen,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers
} from "lucide-react";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const tool = tools.find((item) => item.slug === slug);

  if (!tool) {
    return {
      title: "Tool Not Found | ProTools Hub",
      description: "The requested tool could not be found.",
    };
  }

  return {
    title: `${tool.name} - Free Online Tool | ProTools Hub`,
    description: tool.description,
  };
}

export default async function ToolPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const tool = tools.find((item) => item.slug === slug);

  if (!tool) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Tool Header */}
      <div className="mx-auto max-w-3xl text-center mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 border border-blue-100">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          {tool.category} Utility
        </span>

        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {tool.name}
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-base sm:text-lg text-slate-600">
          {tool.description}
        </p>
      </div>

      {/* Main Interactive Tool Workspace */}
      <div className="mb-20">
        {slug === "json-formatter" ? (
          <JsonFormatter />
        ) : slug === "image-compressor" ? (
          <ImageCompressor />
        ) : slug === "qr-code-generator" ? (
          <QRCodeGenerator />
        ) : slug === "password-generator" ? (
          <PasswordGenerator />
        ) : slug === "pdf-compressor" ? (
          <PDFCompressor />
        ) : slug === "pdf-to-word" ? (
          <PDFToWord />
        ) : slug === "text-case-converter" ? (
          <TextCaseConverter />
        ) : slug === "word-counter" ? (
          <WordCounter />
        ) : slug === "markdown-to-html" ? (
          <MarkdownToHtml />
        ) : slug === "lorem-ipsum-generator" ? (
          <LoremIpsumGenerator />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-slate-600 font-medium">
              This tool component is loading...
            </p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODERN SaaS CONTENT / SEO SECTIONS FOR ALL TOOLS */}
      {/* ======================================================== */}

      {/* 1. JSON Formatter Section */}
      {slug === "json-formatter" && (
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                About JSON Formatter & Validator
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              ProTools Hub JSON Formatter is a powerful browser-based utility for formatting, validating, and minifying JSON data instantly. It parses complex JSON trees, formats messy code strings into human-readable structures, and identifies syntax errors with high accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3>How to Use</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Paste your raw or unformatted JSON into the input box.",
                  "Click 'Format JSON' to generate pretty-printed output.",
                  "Use 'Minify' to remove extra whitespaces for production.",
                  "Click 'Copy Output' to copy the formatted JSON code."
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Layers className="h-5 w-5 text-blue-600" />
                <h3>Key Features</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Instant syntax validation & error detection",
                  "2 Spaces and 4 Spaces indent formatting",
                  "Fast JSON minification for reduced payload",
                  "100% Client-Side parsing (Data never leaves browser)",
                  "Zero registration required"
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-8 text-slate-900 font-extrabold text-2xl">
              <HelpCircle className="h-6 w-6 text-indigo-600" />
              <h3>Frequently Asked Questions</h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">What is JSON?</h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  JSON (JavaScript Object Notation) is a lightweight data format widely used for storing and exchanging structured data between web clients and servers.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Is my JSON data uploaded to a server?</h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  No. The conversion and validation process happens entirely inside your web browser. Your private API payloads or JSON data are never sent to external servers.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Text Case Converter Section */}
      {slug === "text-case-converter" && (
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-rose-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                About Text Case Converter
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Easily transform text formatting into UPPERCASE, lowercase, Title Case, Sentence case, camelCase, and snake_case in one click. Perfect for writers, developers, and content creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Zap className="h-5 w-5 text-rose-500" />
                <h3>How to Use</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Paste or type your content into the input box.",
                  "Click any case style button (e.g., UPPERCASE or camelCase).",
                  "The text updates instantly in real-time.",
                  "Click 'Copy Text' to copy the transformed output."
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Layers className="h-5 w-5 text-rose-600" />
                <h3>Supported Formats</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "UPPERCASE & lowercase conversion",
                  "Title Case & Sentence case formatting",
                  "camelCase for programming variables",
                  "snake_case for code file names",
                  "Live Character & Word stats counter"
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 3. Word Counter Section */}
      {slug === "word-counter" && (
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-md shadow-teal-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                About Word & Character Counter
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Analyze your written content instantly with real-time metrics for word count, total character count, characters without spaces, sentences, paragraphs, and estimated reading time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Zap className="h-5 w-5 text-teal-500" />
                <h3>How to Use</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Paste your article, blog post, or essay into the text area.",
                  "All count metrics calculate automatically in real-time.",
                  "Review estimated reading time for content planning.",
                  "Click 'Copy' to grab your text when finished."
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Layers className="h-5 w-5 text-teal-600" />
                <h3>Features</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Real-time word & character calculation",
                  "Accurate character count without spaces",
                  "Sentence & paragraph structural analysis",
                  "Reading time estimator (200 words/min benchmark)",
                  "Private client-side processing"
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 4. Password Generator Section */}
      {slug === "password-generator" && (
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-600 text-white rounded-2xl shadow-md shadow-amber-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                About Strong Password Generator
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Create highly secure, uncrackable passwords instantly. Customize length, uppercase/lowercase characters, numbers, and symbols to meet strict security compliance standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3>How to Generate Passwords</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Select your required password length (6 to 32 chars).",
                  "Toggle character options (letters, numbers, symbols).",
                  "Click the regenerate button for new variations.",
                  "Click 'Copy' to store it in your clipboard securely."
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Layers className="h-5 w-5 text-amber-600" />
                <h3>Security Features</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Cryptographically secure character selection",
                  "Live strength meter feedback",
                  "Customizable character sets",
                  "Zero server storage or memory retention",
                  "One-click copy to clipboard"
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 5. QR Code Generator Section */}
      {slug === "qr-code-generator" && (
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-md shadow-purple-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                About Free QR Code Generator
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Convert URLs, text messages, or contact details into high-resolution, scannable QR codes instantly. Customize colors, adjust sizes, and download PNG images directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3>How to Create QR Codes</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Enter target URL or text payload.",
                  "Customize foreground & background colors.",
                  "Select image resolution size.",
                  "Click 'Download PNG Image' to save."
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Layers className="h-5 w-5 text-purple-600" />
                <h3>QR Code Features</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Real-time instant Canvas rendering",
                  "Full color palette customization",
                  "High resolution PNG export",
                  "Works 100% offline in browser",
                  "Unlimited free downloads"
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Generic fallback for remaining tools */}
      {["image-compressor", "pdf-compressor", "pdf-to-word", "markdown-to-html", "lorem-ipsum-generator"].includes(slug) && (
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                About {tool.name}
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {tool.description} Fast, secure, and browser-processed utility designed for seamless everyday productivity without registration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3>How to Use</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Input or select your target file / text.",
                  "Adjust tool parameters or options if available.",
                  "Click the action button to process.",
                  "Download or copy your final output instantly."
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 mt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 text-slate-900 font-extrabold text-xl">
                <Layers className="h-5 w-5 text-blue-600" />
                <h3>Key Advantages</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "100% Client-Side privacy assurance",
                  "No file size limits or hidden charges",
                  "Optimized for desktop and mobile devices",
                  "Instant response without queue waiting times"
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}