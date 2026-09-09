"use client";

import React, { useState } from "react";
import { Type, Copy, Check, Trash2, ArrowRightLeft } from "lucide-react";

export default function TextCaseConverter() {
  const [text, setText] = useState("hello world! welcome to protools hub.");
  const [copied, setCopied] = useState(false);

  const toUppercase = () => setText(text.toUpperCase());
  const toLowercase = () => setText(text.toLowerCase());
  const toTitleCase = () => {
    setText(
      text.toLowerCase().replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase())
    );
  };
  const toSentenceCase = () => {
    setText(
      text.toLowerCase().replace(/(^\s*|\.\s*)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase())
    );
  };
  const toCamelCase = () => {
    setText(
      text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, "")
    );
  };
  const toSnakeCase = () => {
    setText(
      text
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join("_") || text
    );
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
      
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
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
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
  );
}