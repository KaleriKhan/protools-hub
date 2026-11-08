"use client";

import React, { useDeferredValue, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    FileSearch,
    Copy,
    Check,
    Trash2,
    Upload,
    Download,
    Clock,
    Mic,
    Target,
    HelpCircle,
    Zap,
    ShieldCheck,
    CheckCircle2,
    Lightbulb,
    ArrowRight,
    AlertTriangle,
    BookOpen,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Analysis (pure functions)                                          */
/* ------------------------------------------------------------------ */
// ANALYSIS START

type Granularity = "grapheme" | "word" | "sentence";

interface SegmenterLike {
    segment(input: string): Iterable<{ segment: string; isWordLike?: boolean }>;
}
type SegmenterCtor = new (locale?: string, options?: { granularity: Granularity }) => SegmenterLike;

const segmenterCache: Partial<Record<Granularity, SegmenterLike | null>> = {};

const getSegmenter = (g: Granularity): SegmenterLike | null => {
    if (g in segmenterCache) return segmenterCache[g] ?? null;
    let seg: SegmenterLike | null = null;
    try {
        const C = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
        if (C) seg = new C(undefined, { granularity: g });
    } catch {
        seg = null;
    }
    segmenterCache[g] = seg;
    return seg;
};

const WORD_CHAR = /[\p{L}\p{N}]/u;

// Words: Intl.Segmenter understands apostrophes, numbers like 3.14 and
// scripts without spaces (Chinese, Japanese, Thai). Falls back to whitespace.
const segmentWords = (text: string): string[] => {
    if (!text.trim()) return [];
    const seg = getSegmenter("word");
    if (seg) {
        const out: string[] = [];
        for (const s of seg.segment(text)) if (s.isWordLike) out.push(s.segment);
        return out;
    }
    return text.split(/\s+/).filter((w) => WORD_CHAR.test(w));
};

const ABBREVIATION =
    /(?:^|[\s(“"'])(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|e\.g|i\.e|no|fig|inc|ltd|co|approx)\.$|(?:^|\s)\p{Lu}\.$/iu;

const splitSentences = (text: string): string[] => {
    let parts: string[];
    const seg = getSegmenter("sentence");
    if (seg) {
        parts = [];
        for (const s of seg.segment(text)) parts.push(s.segment);
    } else {
        parts = text.split(/(?<=[.!?…۔؟。！？])\s+/);
    }
    // glue back pieces that were cut after an abbreviation such as "Dr." or "e.g."
    const merged: string[] = [];
    let buffer = "";
    for (const p of parts) {
        buffer += p;
        if (ABBREVIATION.test(buffer.trimEnd())) continue;
        merged.push(buffer);
        buffer = "";
    }
    if (buffer) merged.push(buffer);
    return merged.filter((s) => WORD_CHAR.test(s));
};

const countSentences = (text: string): number => (text.trim() ? splitSentences(text).length : 0);

// Characters as a person sees them: an emoji or "é" counts as one.
const countChars = (text: string): number => {
    if (!text) return 0;
    const seg = text.length <= 300_000 ? getSegmenter("grapheme") : null;
    if (seg) {
        let n = 0;
        for (const _ of seg.segment(text)) n++;
        return n;
    }
    return Array.from(text).length;
};

const formatDuration = (seconds: number): string => {
    const total = Math.round(seconds);
    if (total <= 0) return "0 sec";
    if (total < 60) return `${total} sec`;
    const minutes = Math.floor(total / 60);
    const rem = total % 60;
    if (minutes < 10) return rem ? `${minutes} min ${rem} sec` : `${minutes} min`;
    return `${Math.round(total / 60)} min`;
};

const READING_WPM = 238;
const SPEAKING_WPM = 130;

const STOPWORDS = new Set(
    (
        "a about above after again against all am an and any are as at be because been before being below between both " +
        "but by can could did do does doing down during each few for from further had has have having he her here hers " +
        "herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on " +
        "once only or other our ours ourselves out over own same she should so some such than that the their theirs them " +
        "themselves then there these they this those through to too under until up very was we were what when where which " +
        "while who whom why will with would you your yours yourself yourselves also may might must shall us one get got " +
        "like said say says would"
    ).split(/\s+/)
);

const cleanToken = (w: string) => w.toLowerCase().replace(/^['’]+|['’]+$/g, "");

interface KeywordRow {
    term: string;
    count: number;
    density: number;
}

const topKeywords = (
    wordsLower: string[],
    filterStopwords: boolean
): { single: KeywordRow[]; phrases: KeywordRow[] } => {
    const total = wordsLower.length;
    if (!total) return { single: [], phrases: [] };
    const tokens = wordsLower.map(cleanToken);

    const single = new Map<string, number>();
    for (const t of tokens) {
        if (!t || /^\d+$/.test(t)) continue;
        if (filterStopwords && (STOPWORDS.has(t) || Array.from(t).length < 2)) continue;
        single.set(t, (single.get(t) ?? 0) + 1);
    }

    const pairs = new Map<string, number>();
    for (let i = 0; i < tokens.length - 1; i++) {
        const a = tokens[i];
        const b = tokens[i + 1];
        if (!a || !b || /^\d+$/.test(a) || /^\d+$/.test(b)) continue;
        if (filterStopwords && (STOPWORDS.has(a) || STOPWORDS.has(b))) continue;
        const key = `${a} ${b}`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
    }

    const toRows = (m: Map<string, number>, min: number): KeywordRow[] =>
        [...m.entries()]
            .filter(([, c]) => c >= min)
            .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
            .slice(0, 10)
            .map(([term, count]) => ({ term, count, density: (count / total) * 100 }));

    return { single: toRows(single, 1), phrases: toRows(pairs, 2) };
};

// Rough English syllable estimate. Good enough for an approximate score.
const countSyllables = (word: string): number => {
    let w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
    const groups = w.match(/[aeiouy]{1,2}/g);
    return Math.max(1, groups ? groups.length : 1);
};

interface Readability {
    ready: boolean;
    reason?: string;
    ease?: number;
    grade?: number;
    label?: string;
}

const readability = (words: string[], sentences: number): Readability => {
    const latin = words.filter((w) => /[A-Za-z]/.test(w));
    if (words.length < 30 || sentences < 1) {
        return { ready: false, reason: "Add at least 30 words for a meaningful score." };
    }
    if (latin.length / words.length < 0.7) {
        return { ready: false, reason: "The Flesch formulas only work for English text." };
    }
    let syllables = 0;
    for (const w of latin) syllables += countSyllables(w);
    const wps = latin.length / sentences;
    const spw = syllables / latin.length;
    const ease = 206.835 - 1.015 * wps - 84.6 * spw;
    const grade = 0.39 * wps + 11.8 * spw - 15.59;
    const label =
        ease >= 90 ? "Very easy" :
            ease >= 80 ? "Easy" :
                ease >= 70 ? "Fairly easy" :
                    ease >= 60 ? "Plain English" :
                        ease >= 50 ? "Fairly difficult" :
                            ease >= 30 ? "Difficult" : "Very difficult";
    return { ready: true, ease: Math.max(0, Math.min(100, ease)), grade: Math.max(0, grade), label };
};

const analyze = (text: string) => {
    const words = segmentWords(text);
    const wordsLower = words.map((w) => w.toLowerCase());
    const wordCount = words.length;
    const sentences = countSentences(text);

    let letters = 0;
    let longest = "";
    let longestLen = 0;
    for (const w of words) {
        const len = Array.from(w).length;
        letters += len;
        if (len > longestLen) {
            longest = w;
            longestLen = len;
        }
    }

    return {
        words,
        wordsLower,
        wordCount,
        chars: countChars(text),
        charsNoSpaces: countChars(text.replace(/\s+/g, "")),
        sentences,
        paragraphs: text.split(/\r?\n\s*\r?\n/).filter((p) => p.trim()).length,
        lines: text.split(/\r?\n/).filter((l) => l.trim()).length,
        unique: new Set(wordsLower.map(cleanToken)).size,
        avgWordLength: wordCount ? letters / wordCount : 0,
        longest,
        avgWordsPerSentence: sentences ? wordCount / sentences : 0,
        readSeconds: (wordCount / READING_WPM) * 60,
        speakSeconds: (wordCount / SPEAKING_WPM) * 60,
        readability: readability(words, sentences),
    };
};

// ANALYSIS END

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const MAX_ANALYZE_CHARS = 1_000_000;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const LIMITS: { label: string; max: number; note: string }[] = [
    { label: "X (Twitter) post", max: 280, note: "Standard accounts" },
    { label: "SMS (single message)", max: 160, note: "Plain Latin text" },
    { label: "SEO meta title", max: 60, note: "Guideline, not a hard rule" },
    { label: "SEO meta description", max: 160, note: "Guideline, not a hard rule" },
    { label: "Instagram caption", max: 2200, note: "Hard limit" },
    { label: "LinkedIn post", max: 3000, note: "Hard limit" },
];

const SAMPLE =
    "Counting words sounds simple until you try it. Is 3.14 one word or two? What about e.g. or Dr. Smith's notes? " +
    "A good counter treats numbers, apostrophes and abbreviations the way a reader would.\n\n" +
    "This sample has two paragraphs, three kinds of punctuation and a few repeated ideas. " +
    "Paste your own writing to see the word count, reading time and the keywords you use most.";

const FAQS: { q: string; a: string }[] = [
    {
        q: "Is the text I paste kept private?",
        a: "Yes. Counting happens entirely in your browser. Your text is never sent to ProTools Hub or stored anywhere, and it disappears when you close or refresh the page. Uploaded .txt files are read locally in the same way.",
    },
    {
        q: "Why is my count different from Microsoft Word or Google Docs?",
        a: "There is no single official definition of a word. Programs differ on hyphenated words, numbers, URLs, symbols standing alone (such as an ampersand or a dash) and non-English scripts. Differences of one or two percent are normal. If you must hit a limit set by a school or a publisher, check with the program they will use.",
    },
    {
        q: "How are words counted in Chinese, Japanese or Thai?",
        a: "These languages do not put spaces between words. In browsers that support it, we use the built-in Intl.Segmenter dictionary to find word boundaries, which gives a good estimate. In an older browser we fall back to splitting on spaces, which undercounts such text. The character count is accurate in every case.",
    },
    {
        q: "How is reading time calculated?",
        a: "We divide your word count by 238 words per minute, the average adult silent-reading speed for non-fiction found in a large 2019 review of reading research. Speaking time uses about 130 words per minute, a comfortable presentation pace. Real speeds vary a lot between people and between easy and technical material, so treat both as estimates.",
    },
    {
        q: "What is the Flesch Reading Ease score?",
        a: "It is a formula that rates English text using the average sentence length and the average number of syllables per word. Higher scores are easier: around 60 to 70 is plain English, below 30 is very difficult. We estimate syllables with a simple rule, so the score is approximate. It does not work for other languages, and we hide it for non-English text.",
    },
    {
        q: "Is there an ideal word count for SEO?",
        a: "No. Google has said there is no minimum or ideal word count. Pages rank because they answer the search well, not because they reach a length. Use the count to check that you have covered the topic and to meet a client or platform requirement, never as a target in itself.",
    },
    {
        q: "Are the character limits exact?",
        a: "They count characters as you see them, with an emoji counting as one. Platforms apply their own rules: X counts every link as a fixed length and gives some characters more weight, SMS drops to 70 characters per message when text includes non-Latin letters or emoji, and search engines truncate titles and descriptions by pixel width, not by character count. Use the bars as a close guide and test in the real platform for anything critical.",
    },
    {
        q: "What does the keyword table tell me?",
        a: "It lists the words and two-word phrases you use most, with how often they appear and what share of your text they make up. By default common filler words such as the, and and of are hidden. It is useful for spotting accidental repetition or checking that a topic term appears naturally. A very high density usually means the writing is repetitive, not better optimized.",
    },
];

const METRICS: { name: string; how: string }[] = [
    { name: "Words", how: "Sequences of letters or digits. Numbers such as 3.14 and contractions such as don't count once. Emoji and stand-alone punctuation are not words." },
    { name: "Characters", how: "Everything you typed, including spaces and line breaks. An emoji or an accented letter counts as one character." },
    { name: "Characters without spaces", how: "The same count after removing every space, tab and line break." },
    { name: "Sentences", how: "Text ended by a full stop, question mark or exclamation mark. Abbreviations such as Dr., e.g. and decimals such as 3.14 are not treated as the end of a sentence." },
    { name: "Paragraphs", how: "Blocks of text separated by at least one blank line. A single line break does not start a new paragraph." },
    { name: "Lines", how: "Non-empty lines, whatever their length." },
    { name: "Unique words", how: "Distinct words after ignoring capital letters, so The and the count as the same word." },
    { name: "Reading and speaking time", how: "Word count divided by 238 words per minute for reading and 130 for speaking aloud." },
    { name: "Keyword density", how: "How often a word or phrase appears divided by your total word count, as a percentage." },
];

const TIPS: { type: string; target: string; note: string }[] = [
    { type: "X (Twitter) post", target: "280 characters", note: "Hard limit for standard accounts" },
    { type: "SEO meta title", target: "about 50 to 60 characters", note: "Longer titles may be cut off in search results" },
    { type: "SEO meta description", target: "about 120 to 160 characters", note: "Shown truncated by pixel width" },
    { type: "Instagram caption", target: "2,200 characters", note: "Hard limit; only the first lines show before More" },
    { type: "LinkedIn post", target: "3,000 characters", note: "Hard limit" },
    { type: "Common App college essay", target: "250 to 650 words", note: "650 is the stated maximum" },
    { type: "Typical blog post", target: "800 to 2,000 words", note: "A common range, not a rule: match the topic" },
    { type: "Short summary or abstract", target: "150 to 250 words", note: "Check the specific requirement" },
];

const WRITING_TIPS: string[] = [
    "Count first, edit second. Write freely, then trim to the limit so you cut the weakest sentences instead of the ones nearest the end.",
    "Watch average sentence length. Around 15 to 20 words per sentence reads comfortably; consistently above 25 is hard going.",
    "Use the keyword table to spot repetition. If your top word is a filler such as very or really, rewrite those lines.",
    "For social posts and meta text, aim just below the limit rather than exactly on it, since platforms count some characters differently.",
    "Read your piece aloud against the speaking time. If a two-minute talk comes out at four, it needs cutting.",
    "Do not pad. Search engines and readers prefer a complete, direct answer to a long one.",
];

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";

const Tile = ({
    label,
    value,
    sub,
    accent,
}: {
    label: string;
    value: React.ReactNode;
    sub?: string;
    accent?: boolean;
}) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center">
        <div className={`text-2xl font-black ${accent ? "text-cyan-300" : "text-slate-100"}`}>{value}</div>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
        {sub && <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>}
    </div>
);

const KeywordTable = ({ title, rows, empty }: { title: string; rows: KeywordRow[]; empty: string }) => (
    <div>
        <h3 className="mb-2 text-sm font-bold text-slate-100">{title}</h3>
        {rows.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-500">{empty}</p>
        ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400">
                        <tr>
                            <th className="px-3 py-2 font-bold">Term</th>
                            <th className="px-3 py-2 text-right font-bold">Count</th>
                            <th className="px-3 py-2 text-right font-bold">Density</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                        {rows.map((r) => (
                            <tr key={r.term}>
                                <td dir="auto" className="px-3 py-2 font-semibold text-slate-100">{r.term}</td>
                                <td className="px-3 py-2 text-right">{r.count}</td>
                                <td className="px-3 py-2 text-right">{r.density.toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WordCounter() {
    const [text, setText] = useState("");
    const [hideStopwords, setHideStopwords] = useState(true);
    const [goal, setGoal] = useState("");
    const [copied, setCopied] = useState(false);
    const [notice, setNotice] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    // keeps typing responsive on long documents
    const deferred = useDeferredValue(text);
    const tooLong = deferred.length > MAX_ANALYZE_CHARS;
    const analyzed = tooLong ? deferred.slice(0, MAX_ANALYZE_CHARS) : deferred;

    const a = useMemo(() => analyze(analyzed), [analyzed]);
    const keywords = useMemo(() => topKeywords(a.wordsLower, hideStopwords), [a.wordsLower, hideStopwords]);

    const goalNum = Number(goal);
    const hasGoal = goal.trim() !== "" && Number.isFinite(goalNum) && goalNum > 0;
    const goalPct = hasGoal ? Math.min(100, (a.wordCount / goalNum) * 100) : 0;

    const copy = async () => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard blocked */
        }
    };

    const clear = () => {
        setText("");
        setNotice("");
        if (fileRef.current) fileRef.current.value = "";
    };

    const download = () => {
        if (!text) return;
        const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "text.txt";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    };

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > MAX_UPLOAD_BYTES) {
            setNotice("That file is larger than 2 MB. Please choose a smaller .txt file.");
        } else if (!/\.txt$/i.test(f.name) && f.type !== "text/plain") {
            setNotice("Please choose a plain text (.txt) file.");
        } else {
            try {
                setText(await f.text());
                setNotice("");
            } catch {
                setNotice("That file could not be read.");
            }
        }
        e.target.value = "";
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

    const r = a.readability;
    const iconBtn =
        "inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-100 transition hover:bg-slate-700 disabled:opacity-40";

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

            {/* ---------------- Tool ---------------- */}
            <div className={`${card} shadow-xl shadow-black/20`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-400">
                            <FileSearch className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Word and Character Counter</h2>
                            <p className="text-xs text-slate-400">
                                Live word count, reading time, keyword analysis and character limits.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Your text never leaves your device
                    </div>
                </div>

                {/* Editor */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className={iconBtn}>
                        <Upload className="h-3.5 w-3.5" />
                        Upload .txt
                    </button>
                    <input ref={fileRef} type="file" accept=".txt,text/plain" onChange={onUpload} className="hidden" />
                    <button type="button" onClick={download} disabled={!text} className={iconBtn}>
                        <Download className="h-3.5 w-3.5" />
                        Download
                    </button>
                    <button type="button" onClick={copy} disabled={!text} className={iconBtn}>
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                        type="button"
                        onClick={clear}
                        disabled={!text}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-3.5 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-40"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear
                    </button>
                    {!text && (
                        <button
                            type="button"
                            onClick={() => setText(SAMPLE)}
                            className="ml-auto text-xs font-semibold text-cyan-300 underline-offset-4 hover:underline"
                        >
                            Try a sample
                        </button>
                    )}
                </div>

                <label htmlFor="wc-text" className="sr-only">
                    Text to analyze
                </label>
                <textarea
                    id="wc-text"
                    dir="auto"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={12}
                    spellCheck
                    placeholder="Type or paste your text here. The counts update as you type."
                    className="w-full resize-y rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />

                {notice && (
                    <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        {notice}
                    </div>
                )}
                {tooLong && (
                    <div role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        Your text has {text.length.toLocaleString()} characters. To keep the page fast, only the first{" "}
                        {MAX_ANALYZE_CHARS.toLocaleString()} are analyzed.
                    </div>
                )}

                {/* Main stats */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Tile label="Words" value={a.wordCount.toLocaleString()} accent />
                    <Tile label="Characters" value={a.chars.toLocaleString()} accent />
                    <Tile label="No spaces" value={a.charsNoSpaces.toLocaleString()} />
                    <Tile label="Sentences" value={a.sentences.toLocaleString()} />
                    <Tile label="Paragraphs" value={a.paragraphs.toLocaleString()} />
                    <Tile label="Lines" value={a.lines.toLocaleString()} />
                    <Tile label="Reading time" value={formatDuration(a.readSeconds)} sub="at 238 words per minute" />
                    <Tile label="Speaking time" value={formatDuration(a.speakSeconds)} sub="at 130 words per minute" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Tile label="Unique words" value={a.unique.toLocaleString()} />
                    <Tile label="Avg word length" value={a.avgWordLength ? a.avgWordLength.toFixed(1) : "0"} sub="letters" />
                    <Tile label="Words per sentence" value={a.avgWordsPerSentence ? a.avgWordsPerSentence.toFixed(1) : "0"} sub="average" />
                    <Tile
                        label="Longest word"
                        value={<span dir="auto" className="block truncate text-base">{a.longest || "-"}</span>}
                    />
                </div>
            </div>

            {/* ---------------- Goal + readability ---------------- */}
            <div className="grid gap-6 md:grid-cols-2">
                <section className={card}>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                            <Target className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100">Word Goal</h2>
                    </div>
                    <label htmlFor="wc-goal" className={`${fieldLabel} mb-1 block`}>
                        Target number of words
                    </label>
                    <input
                        id="wc-goal"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm font-semibold text-slate-200 placeholder:font-normal placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                    {hasGoal ? (
                        <div className="mt-4">
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-200">
                                    {a.wordCount.toLocaleString()} of {goalNum.toLocaleString()} words
                                </span>
                                <span className={a.wordCount > goalNum ? "font-bold text-amber-300" : "font-bold text-cyan-300"}>
                                    {a.wordCount > goalNum
                                        ? `${(a.wordCount - goalNum).toLocaleString()} over`
                                        : `${(goalNum - a.wordCount).toLocaleString()} to go`}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className={`h-full transition-all duration-300 ${a.wordCount > goalNum ? "bg-amber-400" : "bg-cyan-400"}`}
                                    style={{ width: `${goalPct}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="mt-3 text-[11px] text-slate-500">
                            Set a target for an essay, article or assignment and watch your progress.
                        </p>
                    )}
                </section>

                <section className={card}>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100">Readability (English only)</h2>
                    </div>
                    {r.ready && r.ease !== undefined && r.grade !== undefined ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Tile label="Flesch ease" value={r.ease.toFixed(0)} sub={r.label} accent />
                                <Tile label="Grade level" value={r.grade.toFixed(1)} sub="US school grade" />
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${r.ease}%` }} />
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-500">
                                Approximate. Syllables are estimated with a simple rule, so treat this as a guide to compare drafts, not a precise grade.
                            </p>
                        </div>
                    ) : (
                        <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                            {r.reason}
                        </p>
                    )}
                </section>
            </div>

            {/* ---------------- Limits ---------------- */}
            <section className={card}>
                <h2 className="mb-1 text-lg font-bold text-slate-100">Character Limits</h2>
                <p className="mb-5 text-xs text-slate-400">
                    See how your text measures up against common limits. Platforms count some characters differently, so use these as a close guide.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    {LIMITS.map((l) => {
                        const pct = Math.min(100, (a.chars / l.max) * 100);
                        const over = a.chars - l.max;
                        const color = over > 0 ? "bg-rose-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-400";
                        return (
                            <div key={l.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                                <div className="mb-2 flex items-baseline justify-between gap-2">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-100">{l.label}</div>
                                        <div className="text-[10px] text-slate-500">{l.note}</div>
                                    </div>
                                    <div className={`text-xs font-bold ${over > 0 ? "text-rose-300" : "text-slate-300"}`}>
                                        {a.chars.toLocaleString()} / {l.max.toLocaleString()}
                                    </div>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                                    <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
                                </div>
                                {over > 0 && (
                                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-300">
                                        <AlertTriangle className="h-3 w-3" />
                                        Over by {over.toLocaleString()} character{over === 1 ? "" : "s"}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ---------------- Keywords ---------------- */}
            <section className={card}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-slate-100">Top Keywords</h2>
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-300">
                        <input
                            type="checkbox"
                            checked={hideStopwords}
                            onChange={(e) => setHideStopwords(e.target.checked)}
                            className="h-4 w-4 accent-cyan-500"
                        />
                        Hide common words (the, and, of)
                    </label>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <KeywordTable
                        title="Single words"
                        rows={keywords.single}
                        empty="Start typing to see which words you use most."
                    />
                    <KeywordTable
                        title="Two-word phrases"
                        rows={keywords.phrases}
                        empty="Phrases appear here once a pair of words is used at least twice."
                    />
                </div>
                <p className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Density is the share of your total word count. Very high density usually signals repetition, not better optimization.
                </p>
            </section>

            {/* ---------------- About ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-400">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">About the Word and Character Counter</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        Whether you are keeping an essay under a limit, trimming a social post, writing a meta description or
                        timing a speech, you need accurate numbers fast. This counter updates as you type and goes beyond
                        a simple total: it estimates reading and speaking time, lists your most repeated words and phrases,
                        checks your text against common character limits and, for English, scores how easy it is to read.
                    </p>
                    <p>
                        Counting is smarter than splitting on spaces. Numbers like 3.14 and abbreviations such as Dr. or e.g.
                        are not mistaken for sentence endings, emoji count as single characters, and text in Urdu, Arabic or
                        Chinese is handled with your browser&apos;s built-in language rules where available. Everything runs
                        on your device, so your drafts stay private.
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
                            "Type or paste your text into the box, or upload a .txt file up to 2 MB.",
                            "Read the live counts. Optionally set a word goal to track progress.",
                            "Check the character limit bars for the platform you are writing for.",
                            "Review the keyword table to spot repetition, then copy or download your text.",
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
                            <Mic className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100">Key Features</h2>
                    </div>
                    <ul className="space-y-2.5 text-sm text-slate-300">
                        {[
                            "Words, characters, sentences, paragraphs and lines",
                            "Reading time and speaking time estimates",
                            "Top keywords and two-word phrases with density",
                            "Character limit bars for X, SMS, SEO and social posts",
                            "Word goal tracker and Flesch readability for English",
                            "Works with right-to-left and non-Latin scripts",
                            "Private, free, no sign-up, and no word limit to speak of",
                        ].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ---------------- How counted ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">How Each Number Is Counted</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[560px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">Metric</th>
                                <th className="px-4 py-3 font-bold">How it is calculated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {METRICS.map((m) => (
                                <tr key={m.name}>
                                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-200">{m.name}</td>
                                    <td className="px-4 py-3">{m.how}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                    Other programs may count slightly differently, especially around hyphens, URLs and symbols. Expect small differences.
                </p>
            </section>

            {/* ---------------- Typical lengths ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Typical Lengths for Common Writing</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[560px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">Type</th>
                                <th className="px-4 py-3 font-bold">Length</th>
                                <th className="px-4 py-3 font-bold">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {TIPS.map((t) => (
                                <tr key={t.type}>
                                    <td className="px-4 py-3 font-semibold text-slate-200">{t.type}</td>
                                    <td className="px-4 py-3">{t.target}</td>
                                    <td className="px-4 py-3 text-slate-400">{t.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                    Always follow the instructions of your school, publisher or platform. Limits and guidelines change.
                </p>
            </section>

            {/* ---------------- Writing tips ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Tips for Tighter Writing</h2>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                    {WRITING_TIPS.map((t) => (
                        <li key={t} className="flex items-start gap-2.5">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            <span>{t}</span>
                        </li>
                    ))}
                </ul>
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
                <h2 className="mb-4 text-base font-bold text-slate-100">More Free Tools</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        { href: "/tools/json-formatter", t: "JSON Formatter", d: "Format, validate and minify JSON." },
                        { href: "/tools/lorem-ipsum-generator", t: "Lorem Ipsum Generator", d: "Placeholder text for designs and mockups." },
                        { href: "/tools/image-compressor", t: "Image Compressor", d: "Shrink image file sizes in your browser." },
                        { href: "/tools/image-resizer", t: "Image Resizer", d: "Resize images to exact dimensions." },
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