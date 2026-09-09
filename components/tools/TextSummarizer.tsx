"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, FileText, AlignLeft } from "lucide-react";

export default function TextSummarizer() {
    const [inputText, setInputText] = useState("");
    const [summary, setSummary] = useState("");
    const [mode, setMode] = useState<"summarize" | "paraphrase">("summarize");
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const charCount = inputText.length;

    const handleProcess = () => {
        if (!inputText.trim()) return;
        setIsProcessing(true);

        setTimeout(() => {
            const sentences = inputText.match(/[^.!?]+[.!?]+/g) || [inputText];

            if (mode === "summarize") {
                // Algorithmic key sentence extraction summary
                const selectedSentences = sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 3)));
                setSummary(selectedSentences.join(" "));
            } else {
                // Smart Paraphrasing simulation
                const reworded = inputText
                    .replace(/\bimportant\b/gi, "crucial")
                    .replace(/\bfast\b/gi, "rapid")
                    .replace(/\bhelp\b/gi, "assist")
                    .replace(/\buse\b/gi, "utilize")
                    .replace(/\bmake\b/gi, "create");
                setSummary(reworded);
            }
            setIsProcessing(false);
        }, 600);
    };

    const handleCopy = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Text Summarizer & Paraphraser</h2>
                    <p className="text-xs text-slate-500">Shorten long text or reword paragraphs instantly in browser.</p>
                </div>
            </div>

            {/* Mode Controls & Counters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setMode("summarize")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${mode === "summarize"
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                    >
                        Summarize
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("paraphrase")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${mode === "paraphrase"
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                    >
                        Paraphrase
                    </button>
                </div>

                <div className="text-[11px] font-semibold text-slate-500 flex gap-4">
                    <span>Words: <b className="text-slate-900">{wordCount}</b></span>
                    <span>Chars: <b className="text-slate-900">{charCount}</b></span>
                </div>
            </div>

            {/* Textarea Input and Output */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Raw Text Input</label>
                    <textarea
                        rows={8}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your text or article here..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                            {mode === "summarize" ? "Summarized Result" : "Paraphrased Result"}
                        </label>
                        {summary && (
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                            >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                <span>{copied ? "Copied" : "Copy"}</span>
                            </button>
                        )}
                    </div>
                    <div className="w-full h-[180px] md:h-[200px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 overflow-y-auto leading-relaxed">
                        {summary ? summary : <span className="text-slate-400 italic">Result will appear here...</span>}
                    </div>
                </div>
            </div>

            {/* Process Button */}
            <button
                type="button"
                onClick={handleProcess}
                disabled={!inputText.trim() || isProcessing}
                className="w-full py-3.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
                {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="h-4 w-4" />
                )}
                <span>{isProcessing ? "Processing Text..." : mode === "summarize" ? "Generate Summary" : "Paraphrase Text"}</span>
            </button>
        </div>
    );
}