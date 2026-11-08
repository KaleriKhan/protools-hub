"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    AlignLeft,
    Copy,
    Check,
    Download,
    RefreshCw,
    HelpCircle,
    Zap,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Layers,
    Lightbulb,
    Users,
} from "lucide-react";

type Unit = "paragraphs" | "sentences" | "words" | "list";
type Format = "text" | "html";
type Length = "short" | "medium" | "long";

type Options = {
    unit: Unit;
    count: number;
    classicStart: boolean;
    format: Format;
    length: Length;
};

const WORDS = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit",
    "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
    "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
    "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos", "accusamus",
    "iusto", "odio", "dignissimos", "ducimus", "blanditiis", "praesentium",
    "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores", "quas",
    "molestias", "excepturi", "occaecati", "cupiditate", "provident", "similique",
    "mollitia", "animi", "perspiciatis", "unde", "omnis", "iste", "natus", "error",
    "voluptatem", "accusantium", "doloremque", "laudantium", "totam", "rem",
    "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis",
    "quasi", "architecto", "beatae", "vitae", "dicta", "explicabo", "nemo", "ipsam",
    "quia", "voluptas", "aspernatur", "aut", "odit", "fugit", "consequuntur", "magni",
];

const CLASSIC_WORDS = WORDS.slice(0, 19);
const CLASSIC_SENTENCE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const SENTENCE_LENGTH: Record<Length, [number, number]> = {
    short: [5, 9],
    medium: [8, 16],
    long: [14, 24],
};

const LIMITS: Record<Unit, number> = {
    paragraphs: 50,
    sentences: 200,
    words: 5000,
    list: 100,
};

const UNIT_LABEL: Record<Unit, string> = {
    paragraphs: "Paragraphs",
    sentences: "Sentences",
    words: "Words",
    list: "List items",
};

const FAQS = [
    {
        q: "What is Lorem Ipsum?",
        a: "Lorem Ipsum is placeholder text used by designers, developers and printers to fill a layout before the final content is ready. It looks like normal text, so the design can be judged on spacing, typography and structure instead of on the meaning of the words.",
    },
    {
        q: "Is Lorem Ipsum real Latin?",
        a: "It is based on real Latin, but it is scrambled and does not make sense as written. The standard passage is adapted from a work by the Roman writer Cicero, written in 45 BC. Many of its words are genuine Latin, but the order and endings were altered over the centuries, so it reads as nonsense.",
    },
    {
        q: "Why not just copy and paste the same text everywhere?",
        a: "Repeating one block makes a layout look artificially uniform and can hide real problems. Generated text with varied sentence and paragraph lengths gives a more realistic preview of how real content will wrap, break and fill space.",
    },
    {
        q: "What does 'Start with Lorem ipsum' do?",
        a: "When it is on, the output begins with the familiar opening line, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' The rest is generated randomly from the same word list. Turn it off if you want entirely random text.",
    },
    {
        q: "Can I use the generated text commercially?",
        a: "Yes. Placeholder text is not copyrighted material, and you can use the generated output in any project, including commercial ones. You do not need to give credit.",
    },
    {
        q: "Should I leave Lorem Ipsum on a live website?",
        a: "No. Placeholder text on a published page gives visitors nothing useful, and search engines may treat the page as low-quality or unfinished. Replace all placeholder text with real content before you launch.",
    },
    {
        q: "What is the HTML output option?",
        a: "It wraps the text in standard HTML tags: paragraphs become p elements and lists become a ul with li items. You can paste it straight into an HTML file, a CMS editor or a component without adding the tags by hand.",
    },
    {
        q: "Is my data uploaded anywhere?",
        a: "No. The text is generated in your browser using JavaScript, and nothing you do in this tool is sent to our servers. Please note that the website itself uses analytics and advertising scripts, as described in our privacy policy.",
    },
];

const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const randomWords = (n: number) => {
    const out: string[] = [];
    let previous = "";
    for (let i = 0; i < n; i++) {
        let word = WORDS[rand(0, WORDS.length - 1)];
        if (word === previous) word = WORDS[rand(0, WORDS.length - 1)];
        out.push(word);
        previous = word;
    }
    return out;
};

const makeSentence = (range: [number, number]) => {
    const n = rand(range[0], range[1]);
    const words = randomWords(n);

    if (n >= 9 && Math.random() < 0.7) {
        words[rand(2, n - 4)] += ",";
    }
    if (n >= 17 && Math.random() < 0.5) {
        const i = rand(2, n - 4);
        if (!words[i].endsWith(",")) words[i] += ",";
    }

    return cap(words.join(" ")) + ".";
};

const generateLorem = (opts: Options): string => {
    const range = SENTENCE_LENGTH[opts.length];

    if (opts.unit === "paragraphs") {
        const paragraphs: string[] = [];
        for (let i = 0; i < opts.count; i++) {
            const sentenceCount = rand(4, 7);
            const sentences: string[] = [];
            for (let j = 0; j < sentenceCount; j++) {
                sentences.push(
                    i === 0 && j === 0 && opts.classicStart
                        ? CLASSIC_SENTENCE
                        : makeSentence(range)
                );
            }
            paragraphs.push(sentences.join(" "));
        }
        return opts.format === "html"
            ? paragraphs.map((p) => `<p>${p}</p>`).join("\n")
            : paragraphs.join("\n\n");
    }

    if (opts.unit === "sentences") {
        const sentences: string[] = [];
        for (let i = 0; i < opts.count; i++) {
            sentences.push(
                i === 0 && opts.classicStart ? CLASSIC_SENTENCE : makeSentence(range)
            );
        }
        const text = sentences.join(" ");
        return opts.format === "html" ? `<p>${text}</p>` : text;
    }

    if (opts.unit === "words") {
        const words: string[] = [];
        if (opts.classicStart) {
            words.push(...CLASSIC_WORDS.slice(0, Math.min(opts.count, CLASSIC_WORDS.length)));
        }
        if (words.length < opts.count) {
            words.push(...randomWords(opts.count - words.length));
        }
        const text = cap(words.join(" ")) + ".";
        return opts.format === "html" ? `<p>${text}</p>` : text;
    }

    // list
    const items: string[] = [];
    for (let i = 0; i < opts.count; i++) {
        if (i === 0 && opts.classicStart) {
            items.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit");
        } else {
            items.push(cap(randomWords(rand(4, 10)).join(" ")));
        }
    }
    return opts.format === "html"
        ? `<ul>\n${items.map((item) => `  <li>${item}</li>`).join("\n")}\n</ul>`
        : items.map((item) => `- ${item}`).join("\n");
};

export default function LoremIpsumGenerator() {
    const [unit, setUnit] = useState<Unit>("paragraphs");
    const [countInput, setCountInput] = useState("3");
    const [classicStart, setClassicStart] = useState(true);
    const [format, setFormat] = useState<Format>("text");
    const [length, setLength] = useState<Length>("medium");
    const [nonce, setNonce] = useState(0);

    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");

    const max = LIMITS[unit];
    const rawCount = Math.floor(Number(countInput));
    const countValid = Number.isFinite(rawCount) && rawCount >= 1;
    const count = countValid ? Math.min(rawCount, max) : 1;
    const wasClamped = countValid && rawCount > max;

    useEffect(() => {
        setOutput(generateLorem({ unit, count, classicStart, format, length }));
    }, [unit, count, classicStart, format, length, nonce]);

    const plain = output
        .replace(/<[^>]+>/g, " ")
        .replace(/^- /gm, "")
        .replace(/\s+/g, " ")
        .trim();
    const wordCount = plain ? plain.split(" ").length : 0;
    const charCount = plain.length;

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setCopyError("");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopyError("Copy failed. Select the text and copy it manually (Ctrl + C).");
        }
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], {
            type: format === "html" ? "text/html" : "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `lorem-ipsum.${format === "html" ? "html" : "txt"}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const inputClass =
        "rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 p-4 md:p-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* ================= TOOL CARD ================= */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <AlignLeft className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                Lorem Ipsum Generator
                            </h1>
                            <p className="text-sm text-slate-400">
                                Generate placeholder text for designs, mockups and layouts as
                                plain text or HTML.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Runs in your browser</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-5">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label
                                htmlFor="lorem-count"
                                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                            >
                                Quantity
                            </label>
                            <input
                                id="lorem-count"
                                type="number"
                                min={1}
                                max={max}
                                value={countInput}
                                onChange={(e) => setCountInput(e.target.value)}
                                className={`${inputClass} w-28`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="lorem-unit"
                                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                            >
                                Unit
                            </label>
                            <select
                                id="lorem-unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value as Unit)}
                                className={inputClass}
                            >
                                {(Object.keys(UNIT_LABEL) as Unit[]).map((key) => (
                                    <option key={key} value={key}>
                                        {UNIT_LABEL[key]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="lorem-length"
                                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                            >
                                Sentence length
                            </label>
                            <select
                                id="lorem-length"
                                value={length}
                                onChange={(e) => setLength(e.target.value as Length)}
                                disabled={unit === "words" || unit === "list"}
                                className={`${inputClass} disabled:opacity-40`}
                            >
                                <option value="short">Short</option>
                                <option value="medium">Medium</option>
                                <option value="long">Long</option>
                            </select>
                        </div>

                        <div>
                            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                Format
                            </span>
                            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
                                {(
                                    [
                                        ["text", "Plain text"],
                                        ["html", "HTML"],
                                    ] as const
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setFormat(value)}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition cursor-pointer ${format === value
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-slate-400 hover:text-white"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300">
                            <input
                                type="checkbox"
                                checked={classicStart}
                                onChange={(e) => setClassicStart(e.target.checked)}
                                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                            />
                            Start with &quot;Lorem ipsum dolor sit amet…&quot;
                        </label>

                        <button
                            type="button"
                            onClick={() => setNonce((n) => n + 1)}
                            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-500 transition cursor-pointer"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Regenerate
                        </button>
                    </div>

                    <div aria-live="polite">
                        {!countValid && (
                            <p className="flex items-center gap-2 text-xs font-medium text-amber-400">
                                <AlertCircle className="h-4 w-4" />
                                Enter a number of 1 or more. Using 1 for now.
                            </p>
                        )}
                        {wasClamped && (
                            <p className="flex items-center gap-2 text-xs font-medium text-amber-400">
                                <AlertCircle className="h-4 w-4" />
                                The maximum for {UNIT_LABEL[unit].toLowerCase()} is {max}. Showing{" "}
                                {max}.
                            </p>
                        )}
                    </div>
                </div>

                {/* Output */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                            htmlFor="lorem-output"
                            className="text-xs font-bold uppercase tracking-wider text-slate-400"
                        >
                            Generated text{" "}
                            <span className="font-normal normal-case text-slate-500">
                                • {wordCount.toLocaleString()} words •{" "}
                                {charCount.toLocaleString()} characters
                            </span>
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={!output}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download
                            </button>
                            <button
                                type="button"
                                onClick={handleCopy}
                                disabled={!output}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition disabled:opacity-40 cursor-pointer"
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <textarea
                        id="lorem-output"
                        readOnly
                        value={output}
                        rows={12}
                        spellCheck={false}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-200 outline-none transition resize-y"
                    />

                    {copyError && (
                        <p className="text-xs font-medium text-rose-400">{copyError}</p>
                    )}
                </div>
            </div>

            {/* ================= CONTENT SECTIONS ================= */}

            {/* About */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                        About the Lorem Ipsum Generator
                    </h2>
                </div>
                <p className="text-slate-300 text-base leading-relaxed">
                    The ProTools Hub Lorem Ipsum Generator creates realistic placeholder text
                    in seconds. Choose how much you need in paragraphs, sentences, words or
                    bullet-list items, pick a sentence length, and decide whether the text
                    should open with the classic &quot;Lorem ipsum dolor sit amet&quot; line.
                    The text updates instantly as you change an option, and you can copy it,
                    download it, or switch to HTML output with paragraph and list tags already
                    in place.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    Each result is built from a Latin-style word list with varied sentence
                    lengths, capital letters, commas and paragraph sizes, so it looks like real
                    copy when placed in a design. Press Regenerate for a fresh version any time.
                </p>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200 leading-relaxed">
                    <strong className="text-amber-300">Note:</strong> after the optional
                    opening line, the text is generated randomly from the word list, so it will
                    not match the original passage word for word. For layout testing, that is
                    exactly what you want.
                </div>
            </section>

            {/* How to use + features */}
            <div className="grid gap-8 md:grid-cols-2">
                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-extrabold text-white">How to Use</h2>
                    </div>
                    <ol className="space-y-4">
                        {[
                            "Enter how many paragraphs, sentences, words or list items you need.",
                            "Choose the unit and, for sentences and paragraphs, the sentence length.",
                            "Pick Plain text or HTML, and decide whether to start with the classic opening line.",
                            "The text updates automatically. Press Regenerate for a new version.",
                            "Click Copy to use it right away, or Download to save it as a file.",
                        ].map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400 border border-blue-500/30">
                                    {idx + 1}
                                </span>
                                <span className="text-sm font-medium text-slate-300 mt-0.5">
                                    {step}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-extrabold text-white">Key Features</h2>
                    </div>
                    <ul className="space-y-3.5">
                        {[
                            "Paragraphs, sentences, words or bullet-list items",
                            "Short, medium or long sentences",
                            "Plain text or ready-to-paste HTML",
                            "Optional classic 'Lorem ipsum dolor sit amet' opening",
                            "Live word and character count",
                            "Copy to clipboard or download as .txt / .html",
                            "Free, no sign-up, generated in your browser",
                        ].map((feat, idx) => (
                            <li
                                key={idx}
                                className="flex items-center gap-3 text-sm font-medium text-slate-300"
                            >
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* History */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-4">
                <h2 className="text-xl font-extrabold text-white">
                    What Is Lorem Ipsum and Where Does It Come From?
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                    Lorem Ipsum is dummy text that has been used in printing and typesetting
                    for centuries. Its source is a section of &quot;De Finibus Bonorum et
                    Malorum&quot;, a philosophical work written by the Roman statesman Cicero
                    in 45 BC. Over time the original Latin was shortened, altered and
                    scrambled until it became the familiar, meaningless passage we know today.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    The text became widely known in the 1960s when sheets of transfer
                    lettering used it to show sample layouts, and it spread further with
                    desktop publishing software in the 1980s and 1990s. Today it is built into
                    many design tools, website builders and word processors.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    The reason it works is simple. Readers tend to read the meaning of words
                    they understand, which pulls attention away from the design. Latin-like
                    text has a natural distribution of letters and word lengths, so it looks
                    like real writing without anyone getting distracted by what it says.
                </p>
            </section>

            {/* Use cases */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Users className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                        Who Uses Placeholder Text?
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {[
                        {
                            t: "UI and UX designers",
                            d: "Fill wireframes and prototypes so stakeholders can judge layout, hierarchy and typography without waiting for copy.",
                        },
                        {
                            t: "Front-end developers",
                            d: "Test how components handle short, long and multi-paragraph content, including wrapping, truncation and scrolling.",
                        },
                        {
                            t: "Print and graphic designers",
                            d: "Preview brochures, posters, magazines and book layouts before the final text arrives.",
                        },
                        {
                            t: "Theme and template authors",
                            d: "Create demo content for WordPress themes, email templates and website kits.",
                        },
                        {
                            t: "QA testers",
                            d: "Generate large blocks of text to check input limits, database fields and performance.",
                        },
                        {
                            t: "Students and teachers",
                            d: "Practise formatting in word processors and page-layout software with realistic sample text.",
                        },
                    ].map((item) => (
                        <div
                            key={item.t}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                        >
                            <h3 className="font-bold text-white text-base">{item.t}</h3>
                            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                                {item.d}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                        Tips for Using Placeholder Text Well
                    </h2>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
                    <li>
                        <strong className="text-white">Match the real length.</strong> If your
                        final headline will be eight words, don&apos;t test with two. Realistic
                        lengths reveal wrapping problems early.
                    </li>
                    <li>
                        <strong className="text-white">Test the extremes.</strong> Try a very
                        short and a very long version of each text block to see how your layout
                        copes.
                    </li>
                    <li>
                        <strong className="text-white">Use real content as soon as you have it.</strong>{" "}
                        Placeholder text can hide problems with tone, length and readability
                        that only show up with the actual words.
                    </li>
                    <li>
                        <strong className="text-white">Never publish it.</strong> Lorem Ipsum
                        on a live page looks unfinished to visitors and can be treated as
                        low-quality content by search engines. Search your site for &quot;lorem
                        ipsum&quot; before launch.
                    </li>
                    <li>
                        <strong className="text-white">Don&apos;t forget accessibility.</strong>{" "}
                        Screen readers will read placeholder text aloud, so remove it before
                        testing with assistive technology.
                    </li>
                </ul>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Related tools:{" "}
                    <Link
                        href="/tools/word-counter"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Word Counter
                    </Link>
                    ,{" "}
                    <Link
                        href="/tools/text-case-converter"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Text Case Converter
                    </Link>
                    ,{" "}
                    <Link
                        href="/tools/markdown-to-html"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Markdown to HTML
                    </Link>
                    .
                </p>
            </section>

            {/* FAQ */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 text-white font-extrabold text-xl">
                    <Layers className="h-6 w-6 text-indigo-400" />
                    <h2>Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                    {FAQS.map((item) => (
                        <div
                            key={item.q}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                        >
                            <h3 className="font-bold text-white text-base">{item.q}</h3>
                            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                                {item.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}