"use client";

import { useState } from "react";

export default function Base64EncoderTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const handleProcess = (text: string, currentMode: "encode" | "decode") => {
        setInput(text);
        setError("");
        if (!text.trim()) {
            setOutput("");
            return;
        }

        try {
            if (currentMode === "encode") {
                setOutput(btoa(text));
            } else {
                setOutput(atob(text));
            }
        } catch (err) {
            setError("Invalid Base64 string for decoding.");
            setOutput("");
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Top Header & Badge */}
            <div className="mb-10 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Developer Utility
                </span>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    Base64 Encoder & Decoder
                </h1>
                <p className="mt-3 text-base text-slate-600 sm:text-lg">
                    Convert text to Base64 format or decode Base64 strings without losing data integrity.
                </p>
            </div>

            {/* Main Interactive Tool Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Smart Base64 Converter</h2>
                        <p className="text-xs text-slate-500">Encode, decode, and parse strings locally without server uploads.</p>
                    </div>
                </div>

                {/* Action Toggle Switch */}
                <div className="mb-6 flex justify-center rounded-xl bg-slate-100 p-1">
                    <button
                        onClick={() => {
                            setMode("encode");
                            handleProcess(input, "encode");
                        }}
                        className={`w-1/2 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === "encode"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        Encode Plain Text
                    </button>
                    <button
                        onClick={() => {
                            setMode("decode");
                            handleProcess(input, "decode");
                        }}
                        className={`w-1/2 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === "decode"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        Decode Base64
                    </button>
                </div>

                {/* Input Box */}
                <div className="mb-5">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {mode === "encode" ? "Source Text:" : "Base64 String:"}
                    </label>
                    <textarea
                        value={input}
                        onChange={(e) => handleProcess(e.target.value, mode)}
                        placeholder={
                            mode === "encode"
                                ? "Enter or paste text to encode..."
                                : "Enter Base64 string to decode..."
                        }
                        rows={5}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-sm text-slate-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-medium text-red-600">
                        ⚠️ {error}
                    </div>
                )}

                {/* Output Box */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Output Result:
                        </label>
                        {output && (
                            <button
                                onClick={handleCopy}
                                className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                                {copied ? "✓ Copied!" : "Copy Output"}
                            </button>
                        )}
                    </div>
                    <textarea
                        readOnly
                        value={output}
                        placeholder="Result will appear here automatically..."
                        rows={5}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 focus:outline-none"
                    />
                </div>

                {/* Feature Badges Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-amber-50/60 p-4 ring-1 ring-inset ring-amber-500/10">
                        <span className="text-amber-600">⚡</span>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Instant Processing</h4>
                            <p className="text-[11px] text-slate-500">Client-side JavaScript rendering running locally.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-blue-50/60 p-4 ring-1 ring-inset ring-blue-500/10">
                        <span className="text-blue-600">🔄</span>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Dual Mode Support</h4>
                            <p className="text-[11px] text-slate-500">Seamlessly toggle between encoding and decoding.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/60 p-4 ring-1 ring-inset ring-emerald-500/10">
                        <span className="text-emerald-600">🛡️</span>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">100% Private</h4>
                            <p className="text-[11px] text-slate-500">No data bytes ever leave your client device.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-3 flex items-center gap-2 text-blue-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base font-bold text-slate-900">About Base64 Encoder & Decoder</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                    Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. Fast, secure, and browser-processed utility designed for developers, data analysts, and everyday productivity without registration.
                </p>
            </div>

            {/* How to Use & Key Advantages Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* How to Use */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-4 flex items-center gap-2 text-amber-500">
                        <span>⚡</span>
                        <h3 className="text-base font-bold text-slate-900">How to Use</h3>
                    </div>
                    <ol className="space-y-3 text-xs text-slate-600">
                        <li className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">1</span>
                            <span>Select either Encode or Decode mode above.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">2</span>
                            <span>Input or paste your text/Base64 string into the box.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">3</span>
                            <span>View output in real time as you type.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">4</span>
                            <span>Click 'Copy Output' to use your converted data.</span>
                        </li>
                    </ol>
                </div>

                {/* Key Advantages */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-4 flex items-center gap-2 text-blue-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h3 className="text-base font-bold text-slate-900">Key Advantages</h3>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-600">
                        <li className="flex items-center gap-2 text-emerald-600 font-medium">
                            <span>✓</span> <span className="text-slate-600">100% Client-Side privacy assurance</span>
                        </li>
                        <li className="flex items-center gap-2 text-emerald-600 font-medium">
                            <span>✓</span> <span className="text-slate-600">No file size limits or hidden charges</span>
                        </li>
                        <li className="flex items-center gap-2 text-emerald-600 font-medium">
                            <span>✓</span> <span className="text-slate-600">Optimized for desktop and mobile devices</span>
                        </li>
                        <li className="flex items-center gap-2 text-emerald-600 font-medium">
                            <span>✓</span> <span className="text-slate-600">Instant response without queue waiting times</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}