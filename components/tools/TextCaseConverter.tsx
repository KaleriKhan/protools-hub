"use client";

import React, { useState } from "react";
import { Type, Copy, Check, RefreshCcw, HelpCircle, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function TextCaseConverter() {
  const [text, setText] = useState("hello world! welcome to protools hub.");
  // Original text state taake jab bhi case change ho, asal text safe rahay
  const [originalText, setOriginalText] = useState("hello world! welcome to protools hub.");
  const [copied, setCopied] = useState(false);

  // Jab user textarea mein khud kuch type ya paste kare
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    setOriginalText(val);
  };

  const toUppercase = () => {
    setText(originalText.toUpperCase());
  };

  const toLowercase = () => {
    setText(originalText.toLowerCase());
  };

  const toTitleCase = () => {
    setText(
      originalText.toLowerCase().replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase())
    );
  };

  const toSentenceCase = () => {
    setText(
      originalText.toLowerCase().replace(/(^\s*|\.\s*)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase())
    );
  };

  const toCamelCase = () => {
    setText(
      originalText
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, "")
    );
  };

  const toSnakeCase = () => {
    setText(
      originalText
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join("_") || originalText
    );
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setText(originalText);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <Type className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Text Case Converter</h3>
            <p className="text-xs text-slate-500">Transform text into UPPERCASE, lowercase, titleCase, camelCase & snake_case.</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stats: {text.length} Chars | {text.trim() ? text.trim().split(/\s+/).length : 0} Words
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                title="Reset Text"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                onClick={handleCopy}
                disabled={!text}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Text"}
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={handleTextChange}
            rows={7}
            placeholder="Type or paste your text here..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y"
          />

          {/* Action Transformation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
            <button onClick={toUppercase} className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
              UPPERCASE
            </button>
            <button onClick={toLowercase} className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
              lowercase
            </button>
            <button onClick={toTitleCase} className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
              Title Case
            </button>
            <button onClick={toSentenceCase} className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
              Sentence case
            </button>
            <button onClick={toCamelCase} className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
              camelCase
            </button>
            <button onClick={toSnakeCase} className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
              snake_case
            </button>
          </div>
        </div>

      </div>

      {/* About Tool Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">About Text Case Converter</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Transform your text instantly between uppercase, lowercase, title case, sentence case, camelCase, and snake_case directly inside your browser. Fast, secure, and designed for seamless content editing and programming needs.
        </p>
      </div>

      {/* How to Use & Key Advantages Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">How to Use</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">1</span>
              <span>Type or paste your content into the text area box.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">2</span>
              <span>Click on any case transformation button (e.g., UPPERCASE, Title Case, camelCase).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">3</span>
              <span>Copy your converted text instantly with the copy action button.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Key Advantages</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>100% free with no registration or limits</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Real-time character and word count statistics</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Zero server uploads, ensuring complete local privacy</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Supports multiple developer and writing formats</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}