"use client";

import React, { useState } from "react";
import { AlignLeft, Copy, Check, Sparkles, HelpCircle, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

const LOREM_WORDS = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit"
];

export default function LoremIpsumGenerator() {
    const [count, setCount] = useState<number>(3);
    const [type, setType] = useState<"paragraphs" | "words">("paragraphs");
    const [output, setOutput] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const generateText = () => {
        if (type === "words") {
            let result = [];
            for (let i = 0; i < count; i++) {
                result.push(LOREM_WORDS[i % LOREM_WORDS.length]);
            }
            setOutput(result.join(" "));
        } else {
            let paragraphs = [];
            for (let i = 0; i < count; i++) {
                let para = [];
                for (let j = 0; j < 35; j++) {
                    para.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
                }
                paragraphs.push(para.join(" ") + ".");
            }
            setOutput(paragraphs.join("\n\n"));
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 border border-orange-100">
                        <AlignLeft className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Lorem Ipsum Generator</h3>
                        <p className="text-xs text-slate-500">Generate dummy placeholder text for UI/UX designs and mockups.</p>
                    </div>
                </div>

                {/* Control Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Quantity</label>
                        <input
                            type="number"
                            min={1}
                            max={50}
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-24 rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as "paragraphs" | "words")}
                            className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="paragraphs">Paragraphs</option>
                            <option value="words">Words</option>
                        </select>
                    </div>

                    <div className="pt-5">
                        <button
                            onClick={generateText}
                            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-700 transition"
                        >
                            <Sparkles className="h-4 w-4" />
                            Generate Text
                        </button>
                    </div>
                </div>

                {/* Output */}
                {output && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Generated Dummy Content</span>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={output}
                            rows={8}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-sans text-sm text-slate-800 focus:outline-none transition resize-y"
                        />
                    </div>
                )}
            </div>

            {/* About Tool Section */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">About Lorem Ipsum Generator</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Generate standard dummy placeholder text instantly for UI/UX wireframes, layouts, and web design mockups. Fully customizable by paragraphs or words with complete client-side execution.
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
                            <span>Specify your desired quantity amount in the input number box.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">2</span>
                            <span>Select whether you want to generate paragraphs or individual words.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">3</span>
                            <span>Click &quot;Generate Text&quot; and copy your placeholder content instantly.</span>
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
                            <span>Flexible paragraph and word count options</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Zero cloud uploads, guaranteeing total local execution</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Lightning-fast dummy content generation for designers</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}