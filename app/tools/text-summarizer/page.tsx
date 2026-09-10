"use client";

import { useState } from "react";

export default function TextSummarizer() {
    const [text, setText] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [mode, setMode] = useState<"summarize" | "paraphrase">("summarize");
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
        }, 600);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                    AI Text Summarizer & Paraphraser
                </h1>
                <p className="text-slate-600">
                    Summarize long text or rewrite articles quickly directly in your browser.
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setMode("summarize")}
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === "summarize" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                            }`}
                    >
                        Summarize
                    </button>
                    <button
                        onClick={() => setMode("paraphrase")}
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === "paraphrase" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                            }`}
                    >
                        Paraphrase
                    </button>
                </div>

                <textarea
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text here..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                />

                <button
                    onClick={handleProcess}
                    disabled={isLoading || !text.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    {isLoading ? "Processing..." : mode === "summarize" ? "Summarize Text" : "Paraphrase Text"}
                </button>

                {summary && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Result:</h3>
                        <div className="p-4 bg-slate-50 border rounded-lg text-slate-800 whitespace-pre-wrap">
                            {summary}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}