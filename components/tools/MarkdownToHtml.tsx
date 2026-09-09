"use client";

import React, { useState } from "react";
import { Code, Copy, Check, Trash2, Eye } from "lucide-react";

export default function MarkdownToHtml() {
    const [markdown, setMarkdown] = useState<string>(
        "# Welcome to ProTools Hub\n\nConvert **Markdown** to clean *HTML* code instantly.\n\n- Fast\n- Secure\n- Client-side"
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
        <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
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
    );
}