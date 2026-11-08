"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Type,
  Copy,
  Check,
  Download,
  Trash2,
  RotateCcw,
  RotateCw,
  Zap,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Pure conversion functions                                          */
/* ------------------------------------------------------------------ */

// CONVERTERS START

const perLine = (fn: (line: string) => string) => (text: string) =>
  text.split("\n").map(fn).join("\n");

// Splits identifiers and sentences into words. Handles spaces, punctuation,
// camelCase / PascalCase boundaries, acronyms (XMLHttp -> XML Http), digits,
// accented letters and non-Latin scripts. Apostrophes are dropped (don't -> dont).
const splitWords = (line: string): string[] => {
  const s = line
    .replace(/['’]/g, "")
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2")
    .replace(/(\p{L})(\p{N})/gu, "$1 $2")
    .replace(/(\p{N})(\p{L})/gu, "$1 $2");
  return s.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
};

const capFirst = (w: string) => {
  const [f, ...rest] = Array.from(w);
  return f ? f.toUpperCase() + rest.join("") : "";
};

const toUpper = (t: string) => t.toUpperCase();
const toLower = (t: string) => t.toLowerCase();

const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor",
  "of", "on", "or", "per", "so", "the", "to", "up", "via", "vs", "yet",
]);

// Style choice: capitalise the first and last word and every "big" word; leave
// short articles, conjunctions and prepositions lowercase. Existing acronyms
// (NASA) and mixed-case words (iPhone) are kept when the text has lowercase
// letters. Only the first letter of a hyphenated word is capitalised.
const toTitleCase = (text: string): string => {
  const hasLower = /\p{Ll}/u.test(text);
  const parts = text.split(/(\s+)/);
  const isSpace = (p: string) => !p || /^\s+$/.test(p);
  const wordIdx: number[] = [];
  parts.forEach((p, i) => {
    if (!isSpace(p)) wordIdx.push(i);
  });
  const first = wordIdx[0];
  const last = wordIdx[wordIdx.length - 1];

  const out: string[] = [];
  let prevEndsSentence = false;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (isSpace(p)) {
      out.push(p);
      continue;
    }
    const m = p.match(/^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u);
    const pre = m ? m[1] : "";
    const core = m ? m[2] : p;
    const post = m ? m[3] : "";
    const endsSentence = /[:.!?…]["')\]]*$/.test(p);

    if (!core) {
      out.push(p);
    } else if (
      hasLower &&
      ((core.length > 1 && core === core.toUpperCase() && /\p{Lu}/u.test(core)) ||
        /\p{Ll}\p{Lu}/u.test(core))
    ) {
      out.push(p); // acronym or mixed-case brand such as NASA, iPhone
    } else {
      const lower = core.toLowerCase();
      const keepSmall = SMALL_WORDS.has(lower) && i !== first && i !== last && !prevEndsSentence;
      out.push(pre + (keepSmall ? lower : capFirst(lower)) + post);
    }
    prevEndsSentence = endsSentence;
  }
  return out.join("");
};

// Capitalises the first letter of every word (no small-word rules).
const toCapitalizeWords = (text: string): string =>
  text
    .toLowerCase()
    .replace(/(^|[^\p{L}\p{M}\p{N}'’])(\p{L})/gu, (_m, p: string, c: string) => p + c.toUpperCase());

// Lowercases everything, then capitalises the first letter of the text, of each
// sentence (after . ! ? …) and of each line. A lone "i" becomes "I".
const toSentenceCase = (text: string): string =>
  text
    .toLowerCase()
    .replace(
      /(^|[.!?…]["')\]]*[^\S\n]+|\n[^\S\n]*)(\p{L})/gu,
      (_m, p: string, c: string) => p + c.toUpperCase()
    )
    .replace(/(?<![\p{L}\p{N}])i(?=(?:['’](?:m|ll|d|ve))?(?![\p{L}\p{N}]))/gu, "I");

const toCamelCase = perLine((line) =>
  splitWords(line)
    .map((w, i) => (i === 0 ? w.toLowerCase() : capFirst(w.toLowerCase())))
    .join("")
);
const toPascalCase = perLine((line) =>
  splitWords(line)
    .map((w) => capFirst(w.toLowerCase()))
    .join("")
);
const toSnakeCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join("_")
);
const toKebabCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join("-")
);
const toConstantCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toUpperCase())
    .join("_")
);
const toDotCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join(".")
);

// aLtErNaTiNg: lower, UPPER, lower, ... counting letters only.
const toAlternating = (text: string): string => {
  let n = 0;
  return Array.from(text)
    .map((c) => {
      if (c.toLowerCase() === c.toUpperCase()) return c;
      return n++ % 2 === 0 ? c.toLowerCase() : c.toUpperCase();
    })
    .join("");
};

// iNVERSE: swaps the case of every letter.
const toInverse = (text: string): string =>
  Array.from(text)
    .map((c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()))
    .join("");

// Clean-up tools
const trimText = (t: string) =>
  t
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
const collapseSpaces = (t: string) => t.replace(/[^\S\r\n]{2,}/g, " ");
const removeLineBreaks = (t: string) => t.replace(/\s*\r?\n\s*/g, " ").trim();
const removeEmptyLines = (t: string) =>
  t
    .split("\n")
    .filter((l) => l.trim() !== "")
    .join("\n");
const sortLines = (t: string) =>
  t
    .split("\n")
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }))
    .join("\n");
const removeDuplicateLines = (t: string) => {
  const seen = new Set<string>();
  return t
    .split("\n")
    .filter((l) => {
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    })
    .join("\n");
};

const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

// CONVERTERS END

/* ------------------------------------------------------------------ */
/*  Tool definitions                                                   */
/* ------------------------------------------------------------------ */

interface Tool {
  id: string;
  label: string;
  fn: (t: string) => string;
  use: string;
}

const LETTER_TOOLS: Tool[] = [
  { id: "upper", label: "UPPERCASE", fn: toUpper, use: "Headings, warnings, acronyms, legal clauses" },
  { id: "lower", label: "lowercase", fn: toLower, use: "Normalising text, emails, tags, search terms" },
  { id: "title", label: "Title Case", fn: toTitleCase, use: "Headlines, article and book titles" },
  { id: "sentence", label: "Sentence case", fn: toSentenceCase, use: "Normal prose, UI text, captions, subtitles" },
  { id: "capwords", label: "Capitalize Each Word", fn: toCapitalizeWords, use: "Names, addresses, labels, product names" },
  { id: "alt", label: "aLtErNaTiNg", fn: toAlternating, use: "Playful or ironic social-media text" },
  { id: "inverse", label: "iNVERSE", fn: toInverse, use: "Fixing text typed with Caps Lock on" },
];

const DEV_TOOLS: Tool[] = [
  { id: "camel", label: "camelCase", fn: toCamelCase, use: "JavaScript, Java and Swift variables and functions" },
  { id: "pascal", label: "PascalCase", fn: toPascalCase, use: "Class names, React components, C# and TypeScript types" },
  { id: "snake", label: "snake_case", fn: toSnakeCase, use: "Python and Ruby variables, database columns" },
  { id: "kebab", label: "kebab-case", fn: toKebabCase, use: "URLs, CSS classes, HTML attributes, file names" },
  { id: "constant", label: "CONSTANT_CASE", fn: toConstantCase, use: "Constants and environment variables" },
  { id: "dot", label: "dot.case", fn: toDotCase, use: "Config keys, package and namespace names" },
];

const CLEAN_TOOLS: Tool[] = [
  { id: "trim", label: "Trim spaces", fn: trimText, use: "Removes leading and trailing spaces on every line" },
  { id: "collapse", label: "Collapse spaces", fn: collapseSpaces, use: "Turns runs of spaces and tabs into one space" },
  { id: "nobreaks", label: "Remove line breaks", fn: removeLineBreaks, use: "Joins all lines into a single paragraph" },
  { id: "noempty", label: "Remove empty lines", fn: removeEmptyLines, use: "Deletes blank lines" },
  { id: "sort", label: "Sort lines A to Z", fn: sortLines, use: "Alphabetical, ignoring case, numbers sorted naturally" },
  { id: "dedupe", label: "Remove duplicate lines", fn: removeDuplicateLines, use: "Keeps the first copy of each identical line" },
];

const LETTER_EXAMPLE = "the quick brown fox jumps over the lazy dog";
const DEV_EXAMPLE = "user profile image";

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is my text sent to a server?",
    a: "No. Every conversion runs in your browser with plain JavaScript. Your text is never uploaded, stored or logged, and the tool keeps working if you go offline after the page has loaded.",
  },
  {
    q: "What is the difference between Title Case and Capitalize Each Word?",
    a: "Capitalize Each Word simply makes the first letter of every word uppercase. Title Case follows the usual headline convention: the first and last word and all major words are capitalised, while short articles, conjunctions and prepositions such as a, the, and, of and to stay lowercase. Style guides such as AP, Chicago and APA differ in the details, so treat our Title Case as a sensible default and adjust by hand if your guide requires something specific.",
  },
  {
    q: "Why did Sentence case lower my acronyms?",
    a: "Sentence case first lowercases the whole text and then capitalises the start of each sentence, so words like NASA become Nasa. Proper nouns are not detected either. Run the conversion first, then restore names and acronyms by hand. Title Case is gentler: it keeps existing acronyms and mixed-case words such as iPhone when the rest of the text has lowercase letters.",
  },
  {
    q: "How do the programmer cases split words?",
    a: "The tool splits on spaces, punctuation, underscores and hyphens, and also on camelCase boundaries and between letters and numbers, so userProfileImage, user_profile_image and User Profile Image all convert to the same words. Acronyms are kept together before a capitalised word (XMLHttpRequest becomes xml_http_request). Apostrophes are removed, so don't becomes dont.",
  },
  {
    q: "Does it work with Urdu, Arabic, Chinese and other languages?",
    a: "The word splitting works with letters from any script, but scripts without upper and lower case, such as Urdu, Arabic, Hindi, Chinese and Japanese, are left unchanged by the case buttons because they have no capitals. The clean-up tools (trim, sort, remove duplicates and so on) work on any language. Right-to-left text is displayed correctly in the editor.",
  },
  {
    q: "Can I undo a conversion?",
    a: "Yes. Use the Undo and Redo buttons above the editor. The tool remembers up to 50 steps, and conversions chain, so you can run Sentence case and then Remove empty lines on the result. Reloading or closing the page clears the history, because nothing is saved.",
  },
  {
    q: "Does it handle special letters such as the Turkish dotted I or German ß?",
    a: "It uses your browser's standard Unicode case rules, which are not language specific. German ß becomes SS in uppercase, as in the standard rules, but Turkish and Azeri dotted and dotless i are not treated specially, so check those texts after converting.",
  },
  {
    q: "Is there a limit on the amount of text?",
    a: "We set no limit, and conversions are instant for ordinary documents. Very large pastes of several megabytes can make the page slower because everything is processed in your browser's memory. In that case convert the text in parts.",
  },
];

const MISTAKES: { title: string; body: string }[] = [
  {
    title: "Using ALL CAPS for long text",
    body: "Whole paragraphs in capitals are harder to read and come across as shouting. Reserve uppercase for short labels and warnings.",
  },
  {
    title: "Mixing naming styles in code",
    body: "A project that uses user_name in one file and userName in another is harder to search and maintain. Pick the convention of your language and stick to it.",
  },
  {
    title: "Spaces or capitals in URLs",
    body: "Servers and search engines can treat /My-Page and /my-page as different addresses. Use lowercase kebab-case for URLs and file names.",
  },
  {
    title: "Trusting automatic Title Case blindly",
    body: "No tool knows every proper noun, brand or style rule. Always read the result, especially names, product spellings and words after a colon.",
  },
  {
    title: "Forgetting that conversions chain",
    body: "Each button works on the current text. Converting to snake_case and then to Title Case works on the already-converted result. Use Undo to step back.",
  },
  {
    title: "Converting before proofreading",
    body: "Fix typos first. Case rules can hide mistakes in names and acronyms and make them harder to spot later.",
  },
];

const TIPS: string[] = [
  "Pasted text from a PDF with a line break at the end of every line? Use Remove line breaks, then Sentence case.",
  "Cleaning a list of emails or keywords? Run lowercase, Trim spaces, Remove empty lines, Sort lines A to Z and Remove duplicate lines in turn.",
  "Typed a paragraph with Caps Lock on? Click iNVERSE, then Sentence case if needed.",
  "Renaming variables or database columns? Paste one name per line and convert them all at once with the programmer cases.",
  "Writing headlines? Apply Title Case, then check names, acronyms and the words after colons.",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";
const toolBtn =
  "rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-bold text-slate-200 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:bg-slate-950 disabled:hover:text-slate-200";

const MAX_HISTORY = 50;
const SAMPLE = "hello world! welcome to protools hub. this tool changes the case of your text.";

interface History {
  past: string[];
  present: string;
  future: string[];
}

export default function TextCaseConverter() {
  const [h, setH] = useState<History>({ past: [], present: SAMPLE, future: [] });
  const [copied, setCopied] = useState(false);
  // while the user keeps typing, keystrokes share one undo step
  const typingRef = useRef(false);

  const text = h.present;

  const apply = (next: string) => {
    typingRef.current = false;
    if (next === h.present) return;
    setH({ past: [...h.past, h.present].slice(-MAX_HISTORY), present: next, future: [] });
  };

  const onType = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (typingRef.current) {
      setH({ ...h, present: next, future: [] });
    } else {
      typingRef.current = true;
      setH({ past: [...h.past, h.present].slice(-MAX_HISTORY), present: next, future: [] });
    }
  };

  const undo = () => {
    if (!h.past.length) return;
    typingRef.current = false;
    setH({ past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] });
  };

  const redo = () => {
    if (!h.future.length) return;
    typingRef.current = false;
    setH({ past: [...h.past, h.present].slice(-MAX_HISTORY), present: h.future[0], future: h.future.slice(1) });
  };

  const copy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the text can still be selected manually */
    }
  };

  const download = () => {
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-text.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const stats = {
    chars: Array.from(text).length,
    words: countWords(text),
    lines: text ? text.split("\n").length : 0,
  };

  const referenceRows = useMemo(
    () => [
      ...LETTER_TOOLS.filter((t) => ["upper", "lower", "title", "sentence", "capwords"].includes(t.id)).map((t) => ({
        label: t.label,
        example: t.fn(LETTER_EXAMPLE),
        use: t.use,
      })),
      ...DEV_TOOLS.map((t) => ({ label: t.label, example: t.fn(DEV_EXAMPLE), use: t.use })),
    ],
    []
  );

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

  const renderGroup = (title: string, tools: Tool[], cols: string) => (
    <div>
      <div className={`${fieldLabel} mb-2`}>{title}</div>
      <div className={`grid gap-2 ${cols}`}>
        {tools.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.use}
            disabled={!text}
            onClick={() => apply(t.fn(text))}
            className={toolBtn}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* ---------------- Tool ---------------- */}
      <div className={`${card} shadow-xl shadow-black/20`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
              <Type className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Text Case Converter</h2>
              <p className="text-xs text-slate-400">
                Change text case, convert to code styles and clean up lists in one place.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Nothing leaves your device
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-400" aria-live="polite">
            {stats.chars.toLocaleString()} characters · {stats.words.toLocaleString()} words ·{" "}
            {stats.lines.toLocaleString()} {stats.lines === 1 ? "line" : "lines"}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!h.past.length}
              aria-label="Undo"
              title="Undo"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!h.future.length}
              aria-label="Redo"
              title="Redo"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Redo
            </button>
            <button
              type="button"
              onClick={() => apply("")}
              disabled={!text}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!text}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              .txt
            </button>
            <button
              type="button"
              onClick={copy}
              disabled={!text}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
        </div>

        <label htmlFor="case-text" className="sr-only">
          Text to convert
        </label>
        <textarea
          id="case-text"
          dir="auto"
          value={text}
          onChange={onType}
          rows={9}
          spellCheck={false}
          placeholder="Type or paste your text here, then choose a style below…"
          className="w-full resize-y rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />

        <div className="mt-6 space-y-6">
          {renderGroup("Letter case", LETTER_TOOLS, "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}
          {renderGroup("Developer cases", DEV_TOOLS, "grid-cols-2 sm:grid-cols-3")}
          {renderGroup("Clean up", CLEAN_TOOLS, "grid-cols-2 sm:grid-cols-3")}
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-slate-500">
          Each button works on the current text, so conversions chain. Hover a button to see what it is used for. Scripts
          without capital letters, such as Urdu, Arabic or Chinese, are not changed by the case buttons.
        </p>
      </div>

      {/* ---------------- About ---------------- */}
      <section className={card}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">About the Text Case Converter</h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            Retyping text because it was written in the wrong case wastes time. This free tool changes the case of
            your text in one click: UPPERCASE, lowercase, Title Case, Sentence case and more. It also converts
            names into the styles programmers use, such as camelCase, snake_case and kebab-case, and includes simple
            clean-up tools for lists, such as sorting lines and removing duplicates.
          </p>
          <p>
            Everything runs in your browser. Your text is never uploaded, and you can undo up to 50 steps, so you can
            try a style and step back. The word splitting understands camelCase, numbers, accented letters and
            non-Latin scripts, so converting identifiers between code styles works in both directions.
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
              "Type or paste your text into the editor.",
              "Click a style under Letter case, Developer cases or Clean up. The text is converted straight away.",
              "Chain as many conversions as you like. Each one works on the current text.",
              "Use Undo and Redo to step through changes, then copy the result or download it as a .txt file.",
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
              "Seven letter-case styles, including headline-aware Title Case",
              "Six developer styles with smart word splitting (camelCase, snake_case, kebab-case and more)",
              "Clean-up tools: trim, collapse spaces, remove empty lines, sort and de-duplicate",
              "Chainable conversions with 50-step undo and redo",
              "Live character, word and line counts",
              "Copy to clipboard or download as .txt",
              "Private, free, no sign-up and no limits we enforce",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---------------- Reference table ---------------- */}
      <section className={card}>
        <h2 className="mb-3 text-lg font-bold text-slate-100">Case Styles at a Glance</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-300">
          The examples below are produced by the same functions as the buttons, using the input{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">{LETTER_EXAMPLE}</code> for the
          letter styles and{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">{DEV_EXAMPLE}</code> for the
          developer styles.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-bold">Style</th>
                <th className="px-4 py-3 font-bold">Example output</th>
                <th className="px-4 py-3 font-bold">Typically used for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {referenceRows.map((r) => (
                <tr key={r.label}>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-100">{r.label}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-cyan-200">{r.example}</td>
                  <td className="px-4 py-3 text-slate-400">{r.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Title Case here is a style choice: first and last words and major words are capitalised, while short words
          such as a, the, and, of and to stay lowercase. Style guides differ, so adjust by hand if yours is stricter.
        </p>
      </section>

      {/* ---------------- Choosing a style ---------------- */}
      <section className={card}>
        <h2 className="mb-3 text-lg font-bold text-slate-100">Choosing the Right Case</h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            Case carries meaning. In writing, <strong className="text-slate-100">sentence case</strong> reads most
            naturally and is increasingly used for interface text and headings, while{" "}
            <strong className="text-slate-100">Title Case</strong> signals a formal headline or title. Uppercase draws
            attention but is tiring to read in long passages.
          </p>
          <p>
            In code, case is a convention that tells readers what something is. Languages and communities have settled
            on different habits: JavaScript and Java favour camelCase for variables and PascalCase for classes,
            Python and Ruby use snake_case, CSS and URLs use kebab-case, and constants are usually written in
            CONSTANT_CASE. Following the convention of your language keeps code consistent and easy to search.
          </p>
        </div>
      </section>

      {/* ---------------- Mistakes ---------------- */}
      <section className={card}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Common Mistakes with Letter Case</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {MISTAKES.map((m) => (
            <div key={m.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <h3 className="mb-1.5 text-sm font-bold text-slate-100">{m.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Tips ---------------- */}
      <section className={card}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Handy Workflows</h2>
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/tools/word-counter", t: "Word Counter", d: "Count words, characters and reading time." },
            { href: "/tools/json-formatter", t: "JSON Formatter", d: "Format, validate and minify JSON." },
            { href: "/tools/lorem-ipsum-generator", t: "Lorem Ipsum Generator", d: "Placeholder text for your designs." },
            { href: "/tools/image-compressor", t: "Image Compressor", d: "Reduce image file sizes in your browser." },
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