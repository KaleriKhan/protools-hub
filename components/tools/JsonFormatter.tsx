"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Copy,
  Check,
  Trash2,
  AlignLeft,
  Minimize2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Zap,
  ShieldCheck,
  Download,
  Upload,
  ArrowLeftRight,
  FileText,
  Layers,
  Lightbulb,
  Users,
} from "lucide-react";

type IndentOption = "2" | "4" | "tab";

type ParseIssue = {
  message: string;
  line?: number;
  col?: number;
};

type JsonStats = {
  inputBytes: number;
  outputBytes: number;
  keys: number;
  depth: number;
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
};

const MAX_CHARS = 5_000_000; // ~5 MB of text

const SAMPLE_JSON = `{"name":"ProTools Hub","version":"1.0","active":true,"tools":[{"id":"json-formatter","category":"Developer","free":true},{"id":"image-compressor","category":"Image","free":true}],"stats":{"toolsCount":16,"requiresSignup":false,"rating":null}}`;

const COMMON_ERRORS = [
  {
    title: "Trailing comma",
    bad: '{"a": 1, "b": 2,}',
    fix: "Remove the comma after the last item. JavaScript allows it, but JSON does not.",
  },
  {
    title: "Single quotes",
    bad: "{'name': 'Ali'}",
    fix: 'JSON requires double quotes around keys and strings: {"name": "Ali"}.',
  },
  {
    title: "Unquoted keys",
    bad: '{name: "Ali"}',
    fix: 'Every key must be a double-quoted string: {"name": "Ali"}.',
  },
  {
    title: "Missing comma",
    bad: '{"a": 1 "b": 2}',
    fix: "Separate every key-value pair (and array item) with a comma.",
  },
  {
    title: "Comments",
    bad: '{"a": 1 // note}',
    fix: "JSON has no comment syntax. Delete comments before parsing.",
  },
  {
    title: "Invalid values",
    bad: '{"a": undefined, "b": NaN}',
    fix: 'undefined, NaN and Infinity are not valid JSON. Use null or a string such as "NaN".',
  },
  {
    title: "Leading zeros",
    bad: '{"zip": 01234}',
    fix: 'Numbers cannot start with 0. Store codes with leading zeros as strings: "01234".',
  },
  {
    title: "Unescaped characters",
    bad: '{"path": "C:\\new"}',
    fix: 'Backslashes and quotes inside strings must be escaped: "C:\\\\new".',
  },
];

const DATA_TYPES = [
  { type: "String", example: '"hello"', note: "Text in double quotes" },
  { type: "Number", example: "42, 3.14, -7, 1e3", note: "Integers and decimals, no leading zeros" },
  { type: "Boolean", example: "true, false", note: "Lowercase only" },
  { type: "Null", example: "null", note: "Represents an empty value" },
  { type: "Object", example: '{"key": "value"}', note: "Unordered key-value pairs" },
  { type: "Array", example: "[1, 2, 3]", note: "Ordered list of values" },
];

const FAQS = [
  {
    q: "What does a JSON formatter do?",
    a: "A JSON formatter (also called a beautifier or pretty printer) takes compact or messy JSON and rewrites it with consistent indentation and line breaks so people can read it. It also validates the data: if the JSON is broken, it tells you where the problem is.",
  },
  {
    q: "Is my JSON data sent to a server?",
    a: "No. Parsing and formatting run in your browser with JavaScript, so the text you paste is not uploaded by this tool. If you work with sensitive data, you can even disconnect from the internet after the page loads and the tool will keep working. Please note that the website itself uses analytics and advertising scripts, described in our privacy policy.",
  },
  {
    q: "What is the difference between formatting and minifying?",
    a: "Formatting adds whitespace to make JSON easy to read. Minifying removes every unnecessary space and line break to make the file as small as possible, which is useful for APIs, configuration files and network requests. Both produce data with exactly the same meaning.",
  },
  {
    q: "How do I find the error in invalid JSON?",
    a: "Click Format or Validate. If the JSON is invalid, the tool shows the error message and, when the browser provides it, the line and column where parsing failed. The problem is usually at or just before that position, such as a missing comma on the previous line.",
  },
  {
    q: "Why does it say 'Unexpected token'?",
    a: "The parser found a character it did not expect. The most common causes are a trailing comma, single quotes instead of double quotes, an unquoted key, a missing comma between items, or a comment. See the list of common JSON errors on this page for examples and fixes.",
  },
  {
    q: "What does 'Sort keys' do?",
    a: "It rearranges the keys of every object into alphabetical order. This makes two JSON files easier to compare and gives stable output for version control. Arrays keep their original order because order is meaningful in arrays.",
  },
  {
    q: "Does this tool change my data?",
    a: "Formatting and minifying keep your data the same. Two details to know: if a JSON object contains the same key twice, only the last value is kept (this is how JSON.parse works), and very large integers beyond JavaScript's safe range (about 9 quadrillion) can lose precision. If you rely on those, keep the original text.",
  },
  {
    q: "Is there a size limit?",
    a: "You can process up to about 5 MB of text. Very large files can make the page slow because everything runs on your device. For huge files, a command-line tool such as jq is a better choice.",
  },
];

const sortDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      sorted[key] = sortDeep(source[key]);
    }
    return sorted;
  }
  return value;
};

const analyze = (root: unknown) => {
  const acc = {
    keys: 0,
    depth: 0,
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
  };

  const walk = (value: unknown, depth: number) => {
    if (depth > acc.depth) acc.depth = depth;

    if (Array.isArray(value)) {
      acc.arrays++;
      value.forEach((item) => walk(item, depth + 1));
    } else if (value === null) {
      acc.nulls++;
    } else if (typeof value === "object") {
      acc.objects++;
      const entries = Object.entries(value as Record<string, unknown>);
      acc.keys += entries.length;
      entries.forEach(([, v]) => walk(v, depth + 1));
    } else if (typeof value === "string") {
      acc.strings++;
    } else if (typeof value === "number") {
      acc.numbers++;
    } else if (typeof value === "boolean") {
      acc.booleans++;
    }
  };

  walk(root, 1);
  return acc;
};

const byteLength = (text: string) => new TextEncoder().encode(text).length;

const parseIssue = (message: string, text: string): ParseIssue => {
  let line: number | undefined;
  let col: number | undefined;

  const lineCol = message.match(/line (\d+) column (\d+)/i);
  if (lineCol) {
    line = Number(lineCol[1]);
    col = Number(lineCol[2]);
  } else {
    const pos = message.match(/position (\d+)/i);
    if (pos) {
      const index = Number(pos[1]);
      const before = text.slice(0, index);
      line = before.split("\n").length;
      col = index - before.lastIndexOf("\n");
    }
  }

  return { message, line, col };
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function JSONFormatter() {
  const [inputJson, setInputJson] = useState<string>(
    '{\n  "name": "ProTools Hub",\n  "status": "active",\n  "toolsCount": 16\n}'
  );
  const [outputJson, setOutputJson] = useState("");
  const [issue, setIssue] = useState<ParseIssue | null>(null);
  const [statusText, setStatusText] = useState("");
  const [stats, setStats] = useState<JsonStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState<IndentOption>("2");
  const [sortKeys, setSortKeys] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetResult = () => {
    setOutputJson("");
    setStats(null);
    setStatusText("");
  };

  const run = (mode: "format" | "minify" | "validate") => {
    setIssue(null);
    setStatusText("");

    if (!inputJson.trim()) {
      setIssue({ message: "Please paste or type some JSON first." });
      resetResult();
      return;
    }

    if (inputJson.length > MAX_CHARS) {
      setIssue({
        message: "Input is larger than 5 MB. Please use a smaller file.",
      });
      resetResult();
      return;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(inputJson);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid JSON syntax.";
      setIssue(parseIssue(message, inputJson));
      resetResult();
      return;
    }

    try {
      const value = sortKeys ? sortDeep(parsed) : parsed;
      const space = indent === "tab" ? "\t" : Number(indent);

      const formatted = JSON.stringify(value, null, space) ?? "";
      const minified = JSON.stringify(value) ?? "";
      const output = mode === "minify" ? minified : formatted;

      const counts = analyze(value);

      setStats({
        inputBytes: byteLength(inputJson),
        outputBytes: byteLength(mode === "validate" ? inputJson : output),
        ...counts,
      });

      if (mode === "validate") {
        setOutputJson("");
        setStatusText("Valid JSON. Your data has no syntax errors.");
      } else {
        setOutputJson(output);
        setStatusText(
          mode === "format"
            ? "Valid JSON, formatted successfully."
            : "Valid JSON, minified successfully."
        );
      }
    } catch (err) {
      if (err instanceof RangeError) {
        setIssue({
          message: "This JSON is nested too deeply to process in the browser.",
        });
      } else {
        setIssue({ message: "Something went wrong while processing the JSON." });
      }
      resetResult();
    }
  };

  const handleCopy = async () => {
    if (!outputJson) return;
    try {
      await navigator.clipboard.writeText(outputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setIssue({
        message:
          "Copy failed. Select the output text and copy it manually (Ctrl + C).",
      });
    }
  };

  const handleDownload = () => {
    if (!outputJson) return;
    const blob = new Blob([outputJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "protools-formatted.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_CHARS) {
      setIssue({ message: "File is larger than 5 MB. Please choose a smaller file." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setInputJson(reader.result);
        setIssue(null);
        resetResult();
      }
    };
    reader.onerror = () => {
      setIssue({ message: "Unable to read this file." });
    };
    reader.readAsText(file);
  };

  const handleSwap = () => {
    if (!outputJson) return;
    setInputJson(outputJson);
    resetResult();
    setIssue(null);
  };

  const handleClear = () => {
    setInputJson("");
    setIssue(null);
    resetResult();
  };

  const handleSample = () => {
    setInputJson(SAMPLE_JSON);
    setIssue(null);
    resetResult();
  };

  const inputLines = inputJson ? inputJson.split("\n").length : 0;
  const outputLines = outputJson ? outputJson.split("\n").length : 0;

  const savedPercent =
    stats && stats.inputBytes > 0 && outputJson
      ? Math.round(((stats.inputBytes - stats.outputBytes) / stats.inputBytes) * 100)
      : null;

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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                JSON Formatter & Validator
              </h1>
              <p className="text-sm text-slate-400">
                Format, validate, minify and inspect JSON directly in your browser.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
            <ShieldCheck className="h-4 w-4" />
            <span>Runs in your browser</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => run("format")}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition cursor-pointer"
            >
              <AlignLeft className="h-4 w-4" />
              Format JSON
            </button>

            <button
              type="button"
              onClick={() => run("minify")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <Minimize2 className="h-4 w-4" />
              Minify
            </button>

            <button
              type="button"
              onClick={() => run("validate")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Validate
            </button>

            <button
              type="button"
              onClick={handleSample}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              Load Sample
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Upload .json
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json,text/plain"
              onChange={handleUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear JSON input and output"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs font-semibold text-slate-400">
              <span className="px-2">Indent:</span>
              {(
                [
                  ["2", "2 spaces"],
                  ["4", "4 spaces"],
                  ["tab", "Tab"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIndent(value)}
                  aria-label={`Set indentation to ${label}`}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${indent === value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "hover:text-white"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
              />
              Sort keys A–Z
            </label>
          </div>
        </div>

        {/* Status messages */}
        <div aria-live="polite" aria-atomic="true">
          {issue && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-950/60 border border-rose-900/50 p-4 text-sm font-medium text-rose-300">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{issue.message}</p>
                {issue.line !== undefined && issue.col !== undefined && (
                  <p className="text-xs text-rose-400/90">
                    Problem near line {issue.line}, column {issue.col}. Check
                    that spot and the line just before it.
                  </p>
                )}
              </div>
            </div>
          )}

          {statusText && !issue && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 p-3.5 text-sm font-medium text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{statusText}</span>
            </div>
          )}
        </div>

        {/* Input / Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="raw-input-json"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                Raw Input JSON
              </label>
              <span className="text-xs text-slate-500">
                {inputLines} lines • {inputJson.length.toLocaleString()} chars
              </span>
            </div>
            <textarea
              id="raw-input-json"
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              rows={16}
              spellCheck={false}
              placeholder="Paste your JSON here..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="formatted-output-json"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                Output{" "}
                {outputJson && (
                  <span className="font-normal normal-case text-slate-500">
                    • {outputLines} lines
                  </span>
                )}
              </label>
              {outputJson && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSwap}
                    aria-label="Move output into the input box"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Use as input
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    aria-label="Download output as a JSON file"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy output"
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition cursor-pointer"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
            <textarea
              id="formatted-output-json"
              readOnly
              value={outputJson}
              rows={16}
              spellCheck={false}
              placeholder="Formatted or minified JSON will appear here..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-emerald-400 placeholder-slate-600 focus:outline-none transition resize-y"
            />
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              JSON Insights
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Input size", formatBytes(stats.inputBytes)],
                [
                  "Output size",
                  outputJson ? formatBytes(stats.outputBytes) : "—",
                ],
                ["Keys", stats.keys.toLocaleString()],
                ["Max depth", String(stats.depth)],
                ["Objects", stats.objects.toLocaleString()],
                ["Arrays", stats.arrays.toLocaleString()],
                ["Strings", stats.strings.toLocaleString()],
                ["Numbers", stats.numbers.toLocaleString()],
                ["Booleans", stats.booleans.toLocaleString()],
                ["Nulls", stats.nulls.toLocaleString()],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </span>
                  <p className="font-bold text-white text-sm mt-0.5">{value}</p>
                </div>
              ))}
              {savedPercent !== null && savedPercent > 0 && (
                <div className="rounded-xl border border-emerald-900/50 bg-slate-900 p-3 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Size saved
                  </span>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">
                    {savedPercent}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= CONTENT SECTIONS ================= */}

      {/* About */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            About the JSON Formatter & Validator
          </h2>
        </div>
        <p className="text-slate-300 text-base leading-relaxed">
          The ProTools Hub JSON Formatter turns messy, minified or hard-to-read
          JSON into clean, indented text, and tells you immediately if the data is
          invalid. Paste your JSON or upload a .json file, choose 2 spaces, 4
          spaces or tabs, and click Format. You can also minify the data to shrink
          it for APIs and configuration files, or simply validate it without
          changing anything.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          When there is an error, the tool shows the browser&apos;s message along
          with the line and column where parsing stopped, so you can fix problems
          quickly instead of hunting through thousands of characters. After a
          successful run, a summary shows the size, number of keys, nesting depth
          and a count of each data type in your JSON.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          All processing happens in your browser. The text you paste is not
          uploaded by this tool, which makes it suitable for everyday development
          work. As a general rule, avoid pasting secrets such as passwords or
          private keys into any website.
        </p>
      </section>

      {/* How to use + advantages */}
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
              "Paste your JSON into the input box, upload a .json file, or click Load Sample to try an example.",
              "Choose the indentation (2 spaces, 4 spaces or tab) and tick Sort keys if you want alphabetical order.",
              "Click Format JSON to beautify, Minify to compress, or Validate to only check for errors.",
              "If there is an error, read the message and go to the reported line and column.",
              "Copy the result, download it as a .json file, or click Use as input to keep working on it.",
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
              "Format, minify and validate in one place",
              "Error line and column to find mistakes fast",
              "2 spaces, 4 spaces or tab indentation",
              "Optional alphabetical key sorting",
              "Upload .json files and download the result",
              "Insights: size, keys, depth and data-type counts",
              "No sign-up, no limits, processed in your browser",
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

      {/* What is JSON */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-5">
        <h2 className="text-xl font-extrabold text-white">What Is JSON?</h2>
        <p className="text-slate-300 text-base leading-relaxed">
          JSON stands for JavaScript Object Notation. It is a lightweight text
          format for storing and exchanging data, and it is the most common format
          used by web APIs, configuration files and modern databases. It is easy
          for people to read and easy for programs to parse, and almost every
          programming language has built-in support for it.
        </p>
        <p className="text-slate-300 text-base leading-relaxed">
          A JSON document is built from just two structures: objects, which are
          collections of named values wrapped in curly braces, and arrays, which
          are ordered lists wrapped in square brackets. Values can be any of the
          six types below.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Example</th>
                <th className="px-4 py-3 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-400">
              {DATA_TYPES.map((row) => (
                <tr key={row.type}>
                  <td className="px-4 py-3 font-semibold text-white">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">
                    {row.example}
                  </td>
                  <td className="px-4 py-3">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Common errors */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Common JSON Errors and How to Fix Them
          </h2>
        </div>
        <p className="text-slate-300 text-base leading-relaxed">
          Most invalid JSON comes from a small set of mistakes, many of which are
          legal in JavaScript but not in strict JSON. If the validator reports an
          error, check whether your data matches one of these cases.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {COMMON_ERRORS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2"
            >
              <h3 className="font-bold text-white text-base">{item.title}</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Invalid
              </p>
              <code className="block break-all rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-rose-300">
                {item.bad}
              </code>
              <p className="text-sm text-slate-400 leading-relaxed">{item.fix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            When Do You Need a JSON Formatter?
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              t: "Debugging API responses",
              d: "Raw API responses often arrive on a single line. Formatting them reveals the structure so you can find the field you need.",
            },
            {
              t: "Editing configuration files",
              d: "Validate package.json, tsconfig.json, app settings and other config files before deploying to avoid a broken build.",
            },
            {
              t: "Reducing payload size",
              d: "Minify JSON before sending it over the network or embedding it in a page to save bandwidth.",
            },
            {
              t: "Comparing two files",
              d: "Sort keys on both versions so a diff tool shows only real differences instead of ordering noise.",
            },
            {
              t: "Learning and teaching",
              d: "Students can paste examples, see the structure clearly, and learn what valid JSON looks like.",
            },
            {
              t: "Data cleaning",
              d: "Check exports from databases, spreadsheets and third-party tools before importing them somewhere else.",
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
            Best Practices for Working With JSON
          </h2>
        </div>
        <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <li>
            <strong className="text-white">Use consistent key names.</strong> Pick
            one style, such as camelCase or snake_case, and use it everywhere so
            your data is predictable.
          </li>
          <li>
            <strong className="text-white">Store numbers as numbers.</strong>{" "}
            Avoid wrapping numeric values in quotes unless they are identifiers
            such as phone numbers or postal codes with leading zeros.
          </li>
          <li>
            <strong className="text-white">Keep nesting shallow.</strong> Deeply
            nested structures are harder to read and slower to process. Flatten
            data where it makes sense.
          </li>
          <li>
            <strong className="text-white">Never put secrets in shared JSON.</strong>{" "}
            API keys and passwords do not belong in files you paste into websites
            or commit to public repositories.
          </li>
          <li>
            <strong className="text-white">Validate before you deploy.</strong> A
            single missing comma in a config file can stop an application from
            starting, so run a quick validation first.
          </li>
        </ul>
        <p className="text-sm text-slate-400 leading-relaxed">
          Related tools:{" "}
          <Link
            href="/tools/json-schema-generator"
            className="text-blue-400 underline hover:text-blue-300"
          >
            JSON-LD Schema Generator
          </Link>
          ,{" "}
          <Link
            href="/tools/base64-encoder"
            className="text-blue-400 underline hover:text-blue-300"
          >
            Base64 Encoder & Decoder
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