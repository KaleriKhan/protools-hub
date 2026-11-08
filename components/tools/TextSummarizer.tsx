"use client";

import React, { useDeferredValue, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    FileText,
    Copy,
    Check,
    Trash2,
    Download,
    Upload,
    ShieldCheck,
    Zap,
    HelpCircle,
    CheckCircle2,
    Lightbulb,
    ListChecks,
    AlertTriangle,
    ArrowRight,
    Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Summarizer engine (pure functions, no network, no AI model)        */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set(
    (
        "a about above after again against all am an and any are as at be because been before being below between both but by " +
        "can could did do does doing down during each few for from further had has have having he her here hers him his how i if in " +
        "into is it its itself just me more most my no nor not now of off on once only or other our out over own same she should so " +
        "some such than that the their theirs them then there these they this those through to too under until up very was we were " +
        "what when where which while who whom why will with would you your yours also may might must shall however therefore thus " +
        "said says say one two like get got make made many much us per via"
    ).split(" ")
);

const ABBREVIATIONS = /(?:^|\s)(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|e\.g|i\.e|no|fig|inc|ltd|co|approx|dept|est|vol)\.$|(?:^|\s)[A-Z]\.$/i;

interface Sent {
    text: string;
    index: number;
    para: number;
    firstInPara: boolean;
    terms: string[]; // content words (lowercase)
    wordCount: number;
}

const tokenize = (s: string): string[] => s.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu) ?? [];

const isContent = (w: string) => !STOPWORDS.has(w) && (w.length > 2 || /\p{N}/u.test(w));

type SegmenterLike = { segment(input: string): Iterable<{ segment: string }> };

const getSegmenter = (): SegmenterLike | null => {
    try {
        const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => SegmenterLike })
            .Segmenter;
        return Seg ? new Seg(undefined, { granularity: "sentence" }) : null;
    } catch {
        return null;
    }
};

const splitLine = (line: string, seg: SegmenterLike | null): string[] => {
    let parts: string[];
    if (seg) {
        parts = Array.from(seg.segment(line), (s) => s.segment.trim()).filter(Boolean);
    } else {
        parts = line.split(/(?<=[.!?؟۔])["')\]]*\s+/).map((s) => s.trim()).filter(Boolean);
    }
    // glue back splits made after abbreviations such as "Dr." or "e.g."
    const merged: string[] = [];
    for (const p of parts) {
        const last = merged[merged.length - 1];
        if (last && ABBREVIATIONS.test(last)) merged[merged.length - 1] = last + " " + p;
        else merged.push(p);
    }
    return merged;
};

const toSentences = (text: string): Sent[] => {
    const seg = getSegmenter();
    const out: Sent[] = [];
    let para = 0;
    let firstInPara = true;
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line) {
            if (!firstInPara) para++;
            firstInPara = true;
            continue;
        }
        for (const s of splitLine(line, seg)) {
            const words = tokenize(s);
            out.push({
                text: s,
                index: out.length,
                para,
                firstInPara,
                terms: words.filter(isContent),
                wordCount: words.length,
            });
            firstInPara = false;
        }
    }
    return out;
};

const jaccard = (a: Set<string>, b: Set<string>) => {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    a.forEach((t) => {
        if (b.has(t)) inter++;
    });
    return inter / (a.size + b.size - inter);
};

interface SummaryResult {
    picked: Sent[];
    total: number;
    keywords: string[];
}

const summarize = (text: string, ratio: number, keepOrder: boolean): SummaryResult => {
    const all = toSentences(text);
    const total = all.length;

    // term statistics: how often a term appears, and in how many sentences
    const tf = new Map<string, number>();
    const df = new Map<string, number>();
    for (const s of all) {
        for (const t of s.terms) tf.set(t, (tf.get(t) ?? 0) + 1);
        new Set(s.terms).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1));
    }
    const weight = (t: string) => (1 + Math.log(tf.get(t) ?? 1)) * Math.log(1 + total / (df.get(t) ?? 1));

    const keywords = [...tf.entries()]
        .filter(([t, c]) => c > 1 && t.length > 2 && !/^\d+$/.test(t))
        .sort((a, b) => b[1] * weight(b[0]) - a[1] * weight(a[0]))
        .slice(0, 10)
        .map(([t]) => t);

    if (total < 3) return { picked: all, total, keywords };

    // sentence score: informative terms, a little credit for position, penalties for extremes
    const scored = all
        .map((s) => {
            const uniq = [...new Set(s.terms)];
            let score = uniq.reduce((a, t) => a + weight(t), 0) / Math.sqrt(uniq.length || 1);
            if (s.index === 0) score *= 1.25;
            else if (s.firstInPara) score *= 1.1;
            if (s.wordCount < 6) score *= 0.6;
            if (s.wordCount > 45) score *= 0.8;
            return { s, score, set: new Set(uniq) };
        })
        .filter((x) => x.s.wordCount >= 4);

    const pool = scored.length >= 2 ? scored : all.map((s) => ({ s, score: 1, set: new Set(s.terms) }));
    const target = Math.min(pool.length, Math.max(1, Math.round(total * ratio)), Math.max(1, total - 1));
    const maxScore = Math.max(...pool.map((p) => p.score)) || 1;

    // Only the best candidates can realistically be chosen; this keeps very long texts fast.
    const MAX_POOL = 400;
    const ranked = [...pool].sort((a, b) => b.score - a.score).slice(0, Math.max(MAX_POOL, target * 3));

    // pick sentences one by one, skipping ones that repeat what is already chosen.
    // maxSim[i] is updated only against the newest pick, so the work stays small.
    const chosen: typeof pool = [];
    const maxSim = new Array<number>(ranked.length).fill(0);
    const used = new Array<boolean>(ranked.length).fill(false);
    while (chosen.length < target) {
        let best = -1;
        let bestVal = -Infinity;
        for (let i = 0; i < ranked.length; i++) {
            if (used[i]) continue;
            const val = ranked[i].score / maxScore - 0.7 * maxSim[i];
            if (val > bestVal) {
                bestVal = val;
                best = i;
            }
        }
        if (best < 0) break;
        used[best] = true;
        chosen.push(ranked[best]);
        for (let i = 0; i < ranked.length; i++) {
            if (!used[i]) maxSim[i] = Math.max(maxSim[i], jaccard(ranked[i].set, ranked[best].set));
        }
    }

    const picked = chosen.map((c) => c.s);
    if (keepOrder) picked.sort((a, b) => a.index - b.index);
    return { picked, total, keywords };
};

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const MAX_CHARS = 200_000;
const MAX_UPLOAD_BYTES = 1024 * 1024;
const READING_WPM = 238;

const SAMPLE =
    "Solar power has grown faster than any other source of electricity over the last decade. Falling costs are the main reason. " +
    "The price of solar panels has dropped by roughly 90 percent since 2010, making solar the cheapest new source of power in many countries. " +
    "As a result, utilities and households are installing panels at record rates.\n\n" +
    "Storage is the next challenge. Solar panels only produce electricity when the sun shines, so grids need batteries to supply power at night. " +
    "Battery prices have also fallen sharply, and large storage projects are now being built alongside new solar farms. " +
    "Better storage lets grids rely on solar for a much larger share of demand.\n\n" +
    "Grid infrastructure is a third obstacle. Many transmission lines were built for large coal and gas plants, not for thousands of small solar sites. " +
    "Connecting new projects can take years, and in some regions the waiting list for a grid connection is longer than the time needed to build the plant. " +
    "Upgrading the grid will require significant investment and faster permitting.\n\n" +
    "Despite these challenges, analysts expect solar to supply a growing share of global electricity through the next decade. " +
    "Governments are adding incentives, manufacturers are scaling up, and new technologies such as more efficient cells promise further cost reductions.";

const FAQS: { q: string; a: string }[] = [
    {
        q: "Is this an AI summarizer?",
        a: "No. It is an extractive summarizer that runs entirely in your browser with a classic text-analysis algorithm. It scores every sentence by how many important, non-repeated terms it contains, then selects the highest-scoring sentences and returns them word for word. It does not write new sentences, interpret meaning or understand context the way a large language model does.",
    },
    {
        q: "What is the difference between extractive and abstractive summarization?",
        a: "An extractive summary is built from the original document's own sentences, so every word in the result was written by the author. An abstractive summary, which AI models produce, rewrites the ideas in new words. Extractive summaries are faster, predictable and never invent facts, but they can read less smoothly because the chosen sentences were not written to sit next to each other.",
    },
    {
        q: "Is my text uploaded or stored?",
        a: "No. The text is analysed by JavaScript running on your own device and is never sent to our servers or any third party. Nothing is saved, so closing or refreshing the page removes it. You can check this in your browser's network tab.",
    },
    {
        q: "How does it decide which sentences matter?",
        a: "Common words such as the, and and of are ignored. For the remaining words, the tool measures how often each appears in the whole text and how concentrated it is, so words that recur but are not in every sentence count more. A sentence's score is the sum of its important words, adjusted for length. The opening sentence and the first sentence of each paragraph get a small boost, and a sentence that repeats an already selected one is skipped.",
    },
    {
        q: "What kind of text works best?",
        a: "Well-structured prose: news articles, essays, reports, blog posts, research abstracts and meeting notes. It works poorly on dialogue, poetry, lists of short fragments, tables, code and text with very few sentences. The summary can only be as good as the source: rambling or repetitive text produces a rambling summary.",
    },
    {
        q: "Does it work for languages other than English?",
        a: "It splits and scores sentences in any language that uses spaces between words, including Urdu, Arabic, Spanish and French, because the scoring relies on word frequency rather than an English dictionary. The built-in list of ignored common words is English only, so results for other languages are usually a little rougher.",
    },
    {
        q: "Can I use the summary for homework, articles or research?",
        a: "Use it to get oriented quickly, but always read the source before relying on it. Because the output is copied sentences, quoting it without attribution is plagiarism of the original author, and an extractive summary can miss nuance, conditions or counterarguments that matter. Cite the original document.",
    },
    {
        q: "How long should the summary be?",
        a: "The slider sets the share of sentences kept, from 5% to 70%. About 20 to 30% suits most articles. Very short texts of just a few sentences cannot be shortened meaningfully, and the tool will say so.",
    },
];

const TIPS: string[] = [
    "Paste clean text without menus, ads or comment sections; navigation text confuses sentence scoring.",
    "Start at about 25% and adjust. If the summary feels disconnected, raise the length a little.",
    "Turn on Keep original order for a readable narrative, or turn it off to see the most important sentence first.",
    "Use Bullet points for quick notes and Paragraph when you want something you can paste into an email.",
    "Check the Key terms list: if the words look wrong for your topic, your text may need cleaning.",
    "For legal, medical or financial documents, summaries are a reading aid only. Read the original for decisions.",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";

const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export default function TextSummarizer() {
    const [text, setText] = useState("");
    const [percent, setPercent] = useState(25);
    const [style, setStyle] = useState<"paragraph" | "bullets">("paragraph");
    const [keepOrder, setKeepOrder] = useState(true);
    const [copied, setCopied] = useState(false);
    const [note, setNote] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const limited = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
    const deferred = useDeferredValue(limited);

    const result = useMemo(() => {
        if (!deferred.trim()) return null;
        return summarize(deferred, percent / 100, keepOrder);
    }, [deferred, percent, keepOrder]);

    const tooShort = !!result && result.total < 3;

    const output = useMemo(() => {
        if (!result || tooShort) return "";
        return style === "bullets"
            ? result.picked.map((s) => `• ${s.text}`).join("\n")
            : result.picked.map((s) => s.text).join(" ");
    }, [result, style, tooShort]);

    const inWords = countWords(text);
    const outWords = countWords(output);
    const reduction = inWords && outWords ? Math.max(0, Math.round((1 - outWords / inWords) * 100)) : 0;
    const readSave = Math.max(0, Math.round((inWords - outWords) / READING_WPM));

    const copy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard blocked */
        }
    };

    const download = () => {
        if (!output) return;
        const url = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "summary.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    };

    const onFile = async (f: File | undefined) => {
        if (!f) return;
        if (f.size > MAX_UPLOAD_BYTES) {
            setNote("That file is larger than 1 MB. Please choose a smaller text file.");
            return;
        }
        if (!/\.(txt|md|text)$/i.test(f.name) && !f.type.startsWith("text/")) {
            setNote("Please choose a plain text (.txt or .md) file. For PDFs, copy the text out first.");
            return;
        }
        setText(await f.text());
        setNote("");
        if (fileRef.current) fileRef.current.value = "";
    };

    const jsonLd = useMemo(
        () =>
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
            }).replace(/</g, "\\u003c"),
        []
    );

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

            {/* ---------------- Tool ---------------- */}
            <div className={`${card} shadow-xl shadow-black/20`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Text Summarizer</h2>
                            <p className="text-xs text-slate-400">
                                Shorten articles and documents by keeping their most important sentences.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Your text never leaves your device
                    </div>
                </div>

                <div className="mb-6 flex items-start gap-2 rounded-2xl border border-slate-700 bg-slate-950/60 p-3.5 text-xs leading-relaxed text-slate-300">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <span>
                        This is an <strong className="text-slate-100">extractive</strong> summarizer: it selects the most important
                        sentences from your text and returns them unchanged. It does not use AI and does not rewrite or
                        paraphrase.
                    </span>
                </div>

                {/* Input */}
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="sum-input" className={fieldLabel}>
                            Your text
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400">
                                {inWords.toLocaleString()} words, {text.length.toLocaleString()} characters
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setText(SAMPLE);
                                    setNote("");
                                }}
                                className="rounded-lg border border-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-200 transition hover:bg-slate-800"
                            >
                                Use sample
                            </button>
                            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-200 transition hover:bg-slate-800">
                                <Upload className="h-3.5 w-3.5" />
                                Upload .txt
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".txt,.md,.text,text/plain"
                                    onChange={(e) => onFile(e.target.files?.[0])}
                                    className="hidden"
                                />
                            </label>
                            {text && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setText("");
                                        setNote("");
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-[11px] font-bold text-rose-300 transition hover:bg-rose-500/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <textarea
                        id="sum-input"
                        dir="auto"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setNote("");
                        }}
                        rows={9}
                        placeholder="Paste an article, essay, report or any long text here…"
                        className="w-full resize-y rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                    {text.length > MAX_CHARS && (
                        <p className="text-[11px] text-amber-300">
                            Only the first {MAX_CHARS.toLocaleString()} characters are summarized.
                        </p>
                    )}
                    {note && <p className="text-xs text-amber-300">{note}</p>}
                </div>

                {/* Options */}
                <div className="mt-6 grid gap-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <div className="mb-2 flex items-center justify-between">
                            <label htmlFor="sum-length" className={fieldLabel}>
                                Summary length
                            </label>
                            <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-extrabold text-cyan-300">
                                {percent}%
                            </span>
                        </div>
                        <input
                            id="sum-length"
                            type="range"
                            min={5}
                            max={70}
                            step={5}
                            value={percent}
                            onChange={(e) => setPercent(Number(e.target.value))}
                            className="w-full cursor-pointer accent-cyan-500"
                        />
                        <div className="mt-2 flex gap-2">
                            {[
                                ["Short", 15],
                                ["Medium", 30],
                                ["Long", 50],
                            ].map(([l, v]) => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => setPercent(v as number)}
                                    className={`flex-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition ${percent === v
                                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                                        : "border-slate-700 text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className={`${fieldLabel} mb-2`}>Output style</div>
                        <div role="tablist" className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
                            {(
                                [
                                    ["paragraph", "Paragraph"],
                                    ["bullets", "Bullet points"],
                                ] as const
                            ).map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    role="tab"
                                    aria-selected={style === id}
                                    onClick={() => setStyle(id)}
                                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${style === id ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 self-end">
                        <input
                            type="checkbox"
                            checked={keepOrder}
                            onChange={(e) => setKeepOrder(e.target.checked)}
                            className="mt-0.5 h-4 w-4 accent-cyan-500"
                        />
                        <span>
                            <span className="block text-xs font-semibold text-slate-200">Keep original order</span>
                            <span className="block text-[11px] text-slate-500">Off = most important sentence first</span>
                        </span>
                    </label>
                </div>

                {/* Output */}
                <div className="mt-6">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className={fieldLabel}>Summary</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={copy}
                                disabled={!output}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-[11px] font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
                            >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                            <button
                                type="button"
                                onClick={download}
                                disabled={!output}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-1.5 text-[11px] font-bold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
                            >
                                <Download className="h-3.5 w-3.5" />
                                .txt
                            </button>
                        </div>
                    </div>

                    {tooShort ? (
                        <div className="flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                                This text has fewer than three sentences, so there is nothing meaningful to cut. Paste a longer
                                text to summarize it.
                            </span>
                        </div>
                    ) : (
                        <div
                            dir="auto"
                            aria-live="polite"
                            className="min-h-[7rem] whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"
                        >
                            {output || <span className="text-slate-600">Your summary will appear here as you type.</span>}
                        </div>
                    )}

                    {output && result && (
                        <>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { l: "Sentences kept", v: `${result.picked.length} of ${result.total}` },
                                    { l: "Words", v: `${inWords.toLocaleString()} → ${outWords.toLocaleString()}` },
                                    { l: "Shorter by", v: `${reduction}%` },
                                    { l: "Reading time saved", v: `${readSave} min` },
                                ].map((s) => (
                                    <div key={s.l} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
                                        <div className="mt-0.5 text-sm font-bold text-slate-100">{s.v}</div>
                                    </div>
                                ))}
                            </div>

                            {result.keywords.length > 0 && (
                                <div className="mt-4">
                                    <div className={`${fieldLabel} mb-2`}>Key terms</div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.keywords.map((k) => (
                                            <span
                                                key={k}
                                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200"
                                            >
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ---------------- About ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">About the Text Summarizer</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        Most of us read more than we have time for: long articles, reports, study material, emails and meeting
                        notes. This tool gives you a quick overview by pulling out the sentences that carry the most
                        information, so you can decide what deserves a full read. You choose how short the result should be
                        and whether to see it as a paragraph or as bullet points.
                    </p>
                    <p>
                        It is deliberately simple and transparent. There is no hidden AI service and no upload: the text is
                        analysed by a standard word-frequency method that runs in your browser. Because it only selects
                        existing sentences, it cannot make up facts, but it also cannot rephrase or understand context. The
                        sections below explain exactly how it works and where it falls short.
                    </p>
                </div>
            </section>

            {/* ---------------- How to / features ---------------- */}
            <div className="grid gap-6 md:grid-cols-2">
                <section className={`${card} space-y-4`}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100">How to Use</h2>
                    </div>
                    <ol className="space-y-3 text-sm text-slate-300">
                        {[
                            "Paste your text into the box, or upload a .txt file. Try the sample to see how it behaves.",
                            "Move the length slider. About 25% suits most articles; pick Short, Medium or Long for a quick start.",
                            "Choose paragraph or bullet points, and whether to keep the original sentence order.",
                            "Copy the summary or download it as a text file. The result updates live as you change settings.",
                        ].map((t, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">
                                    {i + 1}
                                </span>
                                <span>{t}</span>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className={`${card} space-y-4`}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100">Key Features</h2>
                    </div>
                    <ul className="space-y-2.5 text-sm text-slate-300">
                        {[
                            "Private: analysis runs in your browser and nothing is stored",
                            "Real sentence scoring, not just the first few sentences",
                            "Skips repeated points so the summary stays varied",
                            "Adjustable length from 5% to 70% of the original",
                            "Paragraph or bullet-point output, original or ranked order",
                            "Shows words saved, reading time saved and key terms",
                            "Works with Urdu, Arabic and other languages that use spaces",
                        ].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ---------------- How it works ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <ListChecks className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">How the Summary Is Chosen</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { t: "1. Split", b: "The text is divided into sentences, with care for abbreviations such as Dr. and e.g., and paragraphs are noted." },
                        { t: "2. Weigh words", b: "Everyday words are ignored. The remaining words are weighted by how often they recur and how unevenly they are spread." },
                        { t: "3. Score", b: "Each sentence is scored by its important words, with a small boost for openings and a penalty for very short or very long sentences." },
                        { t: "4. Select", b: "The best sentences are picked one by one, skipping any that repeat a point already chosen, until your length target is met." },
                    ].map((s) => (
                        <div key={s.t} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                            <h3 className="mb-1.5 text-sm font-bold text-slate-100">{s.t}</h3>
                            <p className="text-xs leading-relaxed text-slate-400">{s.b}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Extractive vs abstractive ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Extractive vs. AI (Abstractive) Summaries</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[560px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">&nbsp;</th>
                                <th className="px-4 py-3 font-bold">This tool (extractive)</th>
                                <th className="px-4 py-3 font-bold">AI summarizers (abstractive)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {[
                                ["Wording", "Original sentences, unchanged", "New sentences written by a model"],
                                ["Can invent facts", "No", "Yes, a known risk"],
                                ["Reads smoothly", "Sometimes choppy", "Usually fluent"],
                                ["Privacy", "Stays in your browser", "Text is usually sent to a server"],
                                ["Speed and cost", "Instant and free", "Slower and often limited"],
                                ["Understands context", "No", "To a degree"],
                            ].map((r) => (
                                <tr key={r[0]}>
                                    <td className="px-4 py-3 font-semibold text-slate-200">{r[0]}</td>
                                    <td className="px-4 py-3">{r[1]}</td>
                                    <td className="px-4 py-3 text-slate-400">{r[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---------------- Tips ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Tips for Better Summaries</h2>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                    {TIPS.map((t) => (
                        <li key={t} className="flex items-start gap-2.5">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            <span>{t}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ---------------- Use cases ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Who Uses a Text Summarizer?</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { t: "Students", b: "Skim long readings and chapter notes to find the key arguments before studying them closely." },
                        { t: "Professionals", b: "Get the gist of reports, long emails and meeting transcripts, then read the full parts that matter." },
                        { t: "Writers and researchers", b: "Scan sources quickly, spot recurring terms, and pick which articles are worth a full read." },
                    ].map((c) => (
                        <div key={c.t} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                            <h3 className="mb-1.5 text-sm font-bold text-slate-100">{c.t}</h3>
                            <p className="text-xs leading-relaxed text-slate-400">{c.b}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                    A summary is a reading aid, not a replacement for the source. Always cite the original author and check
                    important details in the full text.
                </p>
            </section>

            {/* ---------------- FAQ ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {FAQS.map((f) => (
                        <details
                            key={f.q}
                            className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-4 open:border-slate-700"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-100">
                                {f.q}
                                <span className="text-slate-500 transition group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-xs leading-relaxed text-slate-400">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ---------------- Related ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-base font-bold text-slate-100">Related Free Tools</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        { href: "/tools/word-counter", t: "Word Counter", d: "Count words, sentences and reading time." },
                        { href: "/tools/text-case-converter", t: "Text Case Converter", d: "Change text to upper, lower, title or sentence case." },
                    ].map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40"
                        >
                            <span>
                                <span className="block text-sm font-semibold text-slate-100">{l.t}</span>
                                <span className="block text-xs text-slate-400">{l.d}</span>
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}