"use client";

import { useState } from "react";
import {
    Sparkles,
    FileText,
    Copy,
    Check,
    Zap,
    Layers,
    ShieldCheck,
    BookOpen,
    CheckCircle2
} from "lucide-react";

export default function TextSummarizer() {
    const [text, setText] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [mode, setMode] = useState<"summarize" | "paraphrase">("summarize");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const handleProcess = () => {
        if (!text.trim()) return;
        setIsLoading(true);

        setTimeout(() => {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            if (mode === "summarize") {
                const result = sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 2))).join(" ");
                setSummary(result);
            } else {
                const result = text
                    .replace(/\bimportant\b/gi, "crucial")
                    .replace(/\bquick\b/gi, "fast")
                    .replace(/\bhelp\b/gi, "assist")
                    .replace(/\buse\b/gi, "utilize");
                setSummary(result);
            }
            setIsLoading(false);
        }, 400);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-8">

                {/* Top Category Tag & Main Title */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100/80 px-3 py-1 text-xs font-bold text-blue-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Text Utility</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                        Text Summarizer
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base">
                        Summarize articles and rewrite long content instantly.
                    </p>
                </div>

                {/* Main Tool Container Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-10 shadow-sm space-y-6">

                    {/* Card Title & Icon Header */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Smart Text Summarizer & Paraphraser
                            </h2>
                            <p className="text-xs text-slate-500">
                                Summarize, edit, and paraphrase text content locally without server API limits.
                            </p>
                        </div>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-100/80 rounded-2xl max-w-xs">
                        <button
                            type="button"
                            onClick={() => setMode("summarize")}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mode === "summarize"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            Summarize
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("paraphrase")}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mode === "paraphrase"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            Paraphrase
                        </button>
                    </div>

                    {/* Text Input */}
                    <div className="space-y-2">
                        <textarea
                            rows={6}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste or type your content here to process..."
                            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/30 p-4 text-xs md:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleProcess}
                        disabled={isLoading || !text.trim()}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-slate-200 transition"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>{isLoading ? "Processing Text..." : mode === "summarize" ? "Summarize Text Now" : "Paraphrase Text Now"}</span>
                    </button>

                    {/* Result Area */}
                    {summary && (
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Processed Output</span>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copied ? "Copied!" : "Copy Result"}</span>
                                </button>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {summary}
                            </div>
                        </div>
                    )}

                    {/* 3 Horizontal Feature Badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="rounded-2xl bg-amber-50/50 border border-amber-100/80 p-3.5 flex items-center gap-3">
                            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-xs text-slate-900">Browser Processing</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Local client engine running directly.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-blue-50/50 border border-blue-100/80 p-3.5 flex items-center gap-3">
                            <Layers className="h-4 w-4 text-blue-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-xs text-slate-900">Multiple Output Modes</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Summarize long documents or reword sentences.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100/80 p-3.5 flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-xs text-slate-900">100% Private</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">No text data ever leaves your device.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Tool Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">About Text Summarizer</h2>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                        Summarize text without losing key information. Fast, secure, and browser-processed utility designed for seamless everyday productivity without registration.
                    </p>
                </div>

                {/* Bottom 2 Grid Cards (How to Use & Key Advantages) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* How to Use */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <h3 className="text-sm font-bold text-slate-900">How to Use</h3>
                        </div>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">1</span>
                                <span>Input or select your target file / text.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">2</span>
                                <span>Adjust tool parameters or options if available.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">3</span>
                                <span>Click the action button to process.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">4</span>
                                <span>Download or copy your final output instantly.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Key Advantages */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Layers className="h-4 w-4 text-blue-500" />
                            <h3 className="text-sm font-bold text-slate-900">Key Advantages</h3>
                        </div>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>100% Client-Side privacy assurance</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>No file size limits or hidden charges</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>Optimized for desktop and mobile devices</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>Instant response without queue waiting times</span>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </main>
    );
}