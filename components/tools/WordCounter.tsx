"use client";

import React, { useState } from "react";
import { FileSearch, Copy, Check, Clock, AlignLeft, Hash, HelpCircle, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function WordCounter() {
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, "").length;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0;
    const readingTime = Math.ceil(words / 200);

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                            <FileSearch className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Word & Character Counter</h3>
                            <p className="text-xs text-slate-500">Instant real-time text analysis and reading time calculation.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        disabled={!text}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
                        <span className="text-2xl font-black text-slate-900">{words}</span>
                        <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">Words</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
                        <span className="text-2xl font-black text-slate-900">{chars}</span>
                        <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">Characters</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
                        <span className="text-2xl font-black text-slate-900">{charsNoSpaces}</span>
                        <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">No Spaces</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
                        <span className="text-2xl font-black text-slate-900">{sentences}</span>
                        <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">Sentences</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
                        <span className="text-2xl font-black text-teal-600">{readingTime} min</span>
                        <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">Reading Time</p>
                    </div>
                </div>

                {/* Textarea */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    placeholder="Type or paste your content here to calculate stats instantly..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y"
                />

            </div>

            {/* About Tool Section */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">About Word & Character Counter</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Analyze your text in real-time with instant word count, character count, sentence count, and reading time estimation directly inside your browser. Perfect for bloggers, students, and content writers.
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
                            <span>Type or paste your article, essay, or text content into the text area box.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">2</span>
                            <span>View real-time statistics for words, characters, sentences, and reading time instantly.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">3</span>
                            <span>Click the copy button to copy your text to the clipboard when ready.</span>
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
                            <span>Instant real-time analytics calculation as you type</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Zero cloud uploads, guaranteeing maximum privacy</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Built-in reading time estimation for content creators</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}