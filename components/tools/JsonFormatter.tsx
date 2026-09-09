"use client";

import React, { useState } from "react";
import { Code2, Copy, Check, Trash2, AlignLeft, Minimize2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function JSONFormatter() {
  const [inputJson, setInputJson] = useState<string>('{\n  "name": "ProTools Hub",\n  "status": "active",\n  "toolsCount": 10\n}');
  const [outputJson, setOutputJson] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [indent, setIndent] = useState<number>(2);

  // Format JSON
  const handleFormat = () => {
    if (!inputJson.trim()) {
      setError("Please paste or type JSON data first.");
      setOutputJson("");
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      setOutputJson(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
      setOutputJson("");
    }
  };

  // Minify JSON
  const handleMinify = () => {
    if (!inputJson.trim()) {
      setError("Please paste or type JSON data first.");
      setOutputJson("");
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      setOutputJson(JSON.stringify(parsed));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
      setOutputJson("");
    }
  };

  const handleCopy = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputJson("");
    setOutputJson("");
    setError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
      
      {/* Tool Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">JSON Formatter & Validator</h3>
            <p className="text-xs text-slate-500">Format, validate, and minify JSON data directly in your browser.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <span className="px-2">Indent:</span>
            {[2, 4].map((spaces) => (
              <button
                key={spaces}
                onClick={() => setIndent(spaces)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  indent === spaces ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                }`}
              >
                {spaces} Spaces
              </button>
            ))}
          </div>

          <button
            onClick={handleFormat}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <AlignLeft className="h-4 w-4" />
            Format JSON
          </button>

          <button
            onClick={handleMinify}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Minimize2 className="h-4 w-4" />
            Minify
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Validation Alert Status */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {outputJson && !error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>Valid JSON Syntax! Ready to copy or download.</span>
        </div>
      )}

      {/* Split Input / Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Raw Input JSON
          </label>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            rows={14}
            placeholder="Paste your unformatted JSON here..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y"
          />
        </div>

        {/* Output Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Formatted Output
            </label>
            {outputJson && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Output"}
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={outputJson}
            rows={14}
            placeholder="Formatted or minified JSON result will appear here..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 focus:outline-none transition resize-y"
          />
        </div>

      </div>

    </div>
  );
}