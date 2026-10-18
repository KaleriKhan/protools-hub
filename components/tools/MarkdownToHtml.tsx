"use client";

import React, { useState } from "react";
import { Code, Copy, Check, Trash2, Eye, HelpCircle, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function MarkdownToHtml() {
    const [markdown, setMarkdown] = useState<string>(
        "# Welcome to ProTools Hub\n\nConvert **Markdown** to clean *HTML* code instantly.\n\nFast\nSecure\nClient-side"
    );
    const [copied, setCopied] = useState(false);

    const convertMarkdownToHtml = (md: string) => {
        let html = md
            .replace(/^### (.*$)/gim, "<h3>$1</h3>")
            .replace(/^## (.*$)/gim, "<h2>$1</h2>")
            .replace(/^# (.*$)/gim, "<h1>$1</h1>")
            .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
            .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
            .replace(/\*(.*)\*/gim, "<em>$1</em>")
            .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
            .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
            .replace(/\n$/gim, "<br />");

        return html.trim();
    };

    const htmlResult = convertMarkdownToHtml(markdown);

    const handleCopy = () => {
        navigator.clipboard.writeText(htmlResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                            <Code className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Markdown to HTML Converter</h3>
                            <p className="text-xs text-slate-500">Live dual-panel Markdown parsing engine.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        disabled={!htmlResult}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied HTML!" : "Copy HTML"}
                    </button>
                </div>

                {/* Editor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Markdown Input
                        </label>
                        <textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            rows={12}
                            placeholder="Type markdown syntax here..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            HTML Output Code
                        </label>
                        <textarea
                            readOnly
                            value={htmlResult}
                            rows={12}
                            placeholder="HTML code will appear here..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-cyan-400 focus:outline-none transition resize-y"
                        />
                    </div>
                </div>
            </div>

            {/* About Tool Section */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">About Markdown to HTML Converter</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Convert Markdown syntax into clean, valid HTML code instantly with live dual-panel client-side parsing. Perfect for web developers and content creators looking for fast code generation.
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
                            <span>Type or paste your Markdown text into the left input editor box.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">2</span>
                            <span>View the auto-generated HTML output code in real-time on the right panel.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">3</span>
                            <span>Click &quot;Copy HTML&quot; to save the parsed markup code to your clipboard.</span>
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
                            <span>Live dual-panel layout for seamless previewing</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Zero cloud uploads, guaranteeing complete data privacy</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Lightning-fast client-side regex parsing engine</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}