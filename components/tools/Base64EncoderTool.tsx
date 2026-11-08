"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    Binary,
    Copy,
    Check,
    ArrowLeftRight,
    Download,
    Upload,
    FileText,
    File as FileIcon,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    HelpCircle,
    Zap,
    ShieldCheck,
    Lightbulb,
    ArrowRight,
    Info,
    Trash2,
    Lock,
    Type,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Pure helpers (no React)                                            */
/* ------------------------------------------------------------------ */
// HELPERS START

const MAX_TEXT_CHARS = 5_000_000;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_B64_CHARS = 14_000_000;

interface FormatOpts {
    urlSafe: boolean;
    noPad: boolean;
    wrap: boolean;
}

// Bytes to standard Base64, in chunks so large inputs do not overflow the call stack.
const bytesToStd = (bytes: Uint8Array): string => {
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as unknown as number[]);
    }
    return btoa(bin);
};

// Applies the output options to a standard Base64 string.
const formatB64 = (std: string, o: FormatOpts): string => {
    let s = std;
    if (o.urlSafe) s = s.replace(/\+/g, "-").replace(/\//g, "_");
    if (o.noPad) s = s.replace(/=+$/, "");
    if (o.wrap) s = (s.match(/.{1,76}/g) ?? []).join("\n");
    return s;
};

type DecodeResult =
    | { ok: true; bytes: Uint8Array; mime: string | null }
    | { ok: false; error: string };

// Tolerant decoder: accepts whitespace, line breaks, URL-safe characters,
// missing padding and a leading "data:...;base64," prefix.
const decodeBase64 = (raw: string): DecodeResult => {
    let s = raw.trim();
    let mime: string | null = null;

    const prefix = s.match(/^data:([^,]*?);base64,/i);
    if (prefix) {
        mime = prefix[1].split(";")[0].trim().toLowerCase() || null;
        s = s.slice(prefix[0].length);
    }

    s = s.replace(/\s+/g, "");
    if (s === "") return { ok: true, bytes: new Uint8Array(0), mime };

    const bad = /[^A-Za-z0-9+/\-_=]/.exec(s);
    if (bad) {
        const ch = bad[0];
        const code = ch.codePointAt(0) ?? 0;
        const shown = code < 32 || code === 127 ? `U+${code.toString(16).toUpperCase().padStart(4, "0")}` : `"${ch}"`;
        return {
            ok: false,
            error: `Invalid character ${shown} at position ${bad.index + 1}. Base64 only allows A-Z, a-z, 0-9, + and / (or - and _ in the URL-safe form), plus = padding at the end.`,
        };
    }

    s = s.replace(/-/g, "+").replace(/_/g, "/");

    if (s.includes("=") && !/^[^=]*={1,2}$/.test(s)) {
        return { ok: false, error: "Padding (=) can only appear at the very end, and at most twice." };
    }

    const core = s.replace(/=+$/, "");
    const padCount = s.length - core.length;

    if (core.length % 4 === 1) {
        return {
            ok: false,
            error: `Invalid length: ${core.length} data characters cannot represent whole bytes. The text is probably cut off or damaged.`,
        };
    }
    if (padCount > 0 && (core.length + padCount) % 4 !== 0) {
        return { ok: false, error: "The = padding does not match the length of the data." };
    }

    const padded = core + "=".repeat((4 - (core.length % 4)) % 4);
    let bin: string;
    try {
        bin = atob(padded);
    } catch {
        return { ok: false, error: "This text could not be decoded as Base64." };
    }
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { ok: true, bytes, mime };
};

const decodeUtf8Strict = (bytes: Uint8Array): string | null => {
    try {
        return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    } catch {
        return null;
    }
};

const sniffType = (b: Uint8Array): { mime: string; ext: string } | null => {
    const at = (i: number) => b[i];
    if (b.length >= 8 && at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return { mime: "image/png", ext: "png" };
    if (b.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return { mime: "image/jpeg", ext: "jpg" };
    if (b.length >= 4 && at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x38) return { mime: "image/gif", ext: "gif" };
    if (b.length >= 4 && at(0) === 0x25 && at(1) === 0x50 && at(2) === 0x44 && at(3) === 0x46) return { mime: "application/pdf", ext: "pdf" };
    if (
        b.length >= 12 &&
        at(0) === 0x52 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x46 &&
        at(8) === 0x57 && at(9) === 0x45 && at(10) === 0x42 && at(11) === 0x50
    ) return { mime: "image/webp", ext: "webp" };
    if (b.length >= 4 && at(0) === 0x50 && at(1) === 0x4b && at(2) === 0x03 && at(3) === 0x04) return { mime: "application/zip", ext: "zip" };
    return null;
};

const MIME_EXT: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "application/zip": "zip",
    "application/json": "json",
    "text/plain": "txt",
    "text/html": "html",
    "text/css": "css",
    "text/csv": "csv",
};

const hexPreview = (b: Uint8Array, n = 16) =>
    Array.from(b.subarray(0, n))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join(" ");

type ErrorKind = "none" | "input" | "utf8" | "limit";

interface TextResult {
    output: string;
    error: string | null;
    kind: ErrorKind;
    bytes: Uint8Array | null;
    bytesIn: number;
    bytesOut: number;
}

const processText = (input: string, mode: "encode" | "decode", o: FormatOpts): TextResult => {
    const empty: TextResult = { output: "", error: null, kind: "none", bytes: null, bytesIn: 0, bytesOut: 0 };
    if (input === "") return empty;

    if (input.length > MAX_TEXT_CHARS) {
        return {
            ...empty,
            kind: "limit",
            error: `This text is longer than ${MAX_TEXT_CHARS.toLocaleString()} characters. For large data, use the File tab.`,
        };
    }

    if (mode === "encode") {
        const bytes = new TextEncoder().encode(input);
        const output = formatB64(bytesToStd(bytes), o);
        return { ...empty, output, bytesIn: bytes.length, bytesOut: output.length };
    }

    const res = decodeBase64(input);
    if (!res.ok) return { ...empty, kind: "input", error: res.error, bytesIn: input.length };

    const text = decodeUtf8Strict(res.bytes);
    if (text === null) {
        return {
            ...empty,
            kind: "utf8",
            bytes: res.bytes,
            bytesIn: input.length,
            bytesOut: res.bytes.length,
            error: `Decoded successfully (${res.bytes.length.toLocaleString()} bytes), but the data is not valid UTF-8 text. It is probably a binary file such as an image, or text in a different character set.`,
        };
    }
    return { ...empty, output: text, bytes: res.bytes, bytesIn: input.length, bytesOut: res.bytes.length };
};

// HELPERS END

/* ------------------------------------------------------------------ */
/*  UI helpers                                                         */
/* ------------------------------------------------------------------ */

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const PREVIEW_LIMIT = 30000;

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";
const textArea =
    "w-full resize-y rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20";

function Toggle({
    checked,
    onChange,
    label,
    hint,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    hint?: string;
    disabled?: boolean;
}) {
    return (
        <label
            className={`flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 transition ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-slate-700"}`}
        >
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-500"
            />
            <span>
                <span className="block text-xs font-semibold text-slate-200">{label}</span>
                {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
            </span>
        </label>
    );
}

function Segmented<T extends string>({
    value,
    onChange,
    options,
    label,
}: {
    value: T;
    onChange: (v: T) => void;
    options: { id: T; label: string; icon?: React.ReactNode }[];
    label: string;
}) {
    return (
        <div role="tablist" aria-label={label} className="inline-flex rounded-2xl border border-slate-800 bg-slate-950/60 p-1">
            {options.map((o) => (
                <button
                    key={o.id}
                    type="button"
                    role="tab"
                    aria-selected={value === o.id}
                    onClick={() => onChange(o.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${value === o.id ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                        }`}
                >
                    {o.icon}
                    {o.label}
                </button>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const FAQS: { q: string; a: string }[] = [
    {
        q: "Is Base64 a form of encryption?",
        a: "No. Base64 is an encoding, not encryption. Anyone can reverse it instantly without a key, exactly as this tool does. It exists to represent binary data using only printable characters, not to keep anything secret. Never use Base64 to hide passwords, tokens or personal data. Use real encryption for that.",
    },
    {
        q: "Is my data uploaded anywhere?",
        a: "No. Text is encoded and decoded by JavaScript running in your browser, and files are read with the browser's FileReader API. Nothing you enter is sent to ProTools Hub or any other server, and nothing is stored after you close the page.",
    },
    {
        q: "Why does my Base64 end with one or two equals signs?",
        a: "Base64 works in groups of three bytes. When the data does not divide evenly, the last group is padded with = characters so the output length is a multiple of four: one = when one byte is missing from the group, two when two are missing. Some systems, such as JWTs, leave the padding off, which you can do here with the Remove padding option. The decoder accepts both forms.",
    },
    {
        q: "What is URL-safe Base64?",
        a: "Standard Base64 uses + and /, which have special meaning in URLs and file names. The URL-safe variant (base64url, defined in RFC 4648) replaces them with - and _ and usually drops the padding. It is used in JSON Web Tokens and many web APIs. Turn on the URL-safe option when encoding, and the decoder detects either form automatically.",
    },
    {
        q: "Why is the Base64 output larger than the original?",
        a: "Every 3 bytes of input become 4 characters of output, so Base64 is about 33% larger than the original data. Adding line breaks every 76 characters (the MIME style) increases it slightly more. That overhead is the price of being able to carry binary data through text-only channels. If you only need to compress or store data, Base64 is the wrong tool.",
    },
    {
        q: "Does it work with Urdu, Arabic, emoji and accented text?",
        a: "Yes. Text is first converted to bytes using UTF-8, then encoded, and decoding reverses both steps. This is why the result can differ from tools that use another character set such as Latin-1: Base64 encodes bytes, so the same text can give different Base64 depending on how it was turned into bytes. UTF-8 is the standard on the web and is what most systems expect.",
    },
    {
        q: "Why does decoding say the data is not valid UTF-8?",
        a: "The Base64 itself was valid, but the bytes inside are not readable UTF-8 text. That usually means the data is a binary file such as an image, PDF or ZIP, or text saved in a different character set. Use the Show binary info button to see its size and detected type, or switch to the File tab to download the decoded file.",
    },
    {
        q: "What are the size limits?",
        a: "Text mode accepts up to 5 million characters. The File tab converts files up to 10 MB and decodes Base64 up to about 14 million characters. Everything happens in your browser's memory, so very large inputs depend on your device. For multi-gigabyte data, use a command-line tool such as base64.",
    },
];

const COMMON_USES: { title: string; body: string }[] = [
    {
        title: "Data URIs in HTML and CSS",
        body: "Small images and icons can be embedded directly in markup as data:image/png;base64,... to save an HTTP request. It is practical for tiny assets but bad for large images, which are 33% bigger and cannot be cached separately.",
    },
    {
        title: "Email attachments (MIME)",
        body: "Email was designed for text, so attachments are Base64-encoded and wrapped at 76 characters per line. This is where the line-wrapping convention comes from.",
    },
    {
        title: "JSON Web Tokens (JWT)",
        body: "A JWT is three Base64URL strings joined by dots: header, payload and signature. The first two are just encoded JSON, so anyone can read them. That is why you should never put secrets in a token's payload.",
    },
    {
        title: "HTTP Basic authentication",
        body: "The Authorization header carries username:password as Base64. This is not protection, so it must only be used over HTTPS.",
    },
    {
        title: "Binary data inside JSON or XML",
        body: "JSON has no binary type, so APIs commonly send files, keys and hashes as Base64 strings inside a JSON field.",
    },
    {
        title: "Certificates and keys (PEM)",
        body: "PEM files for certificates and keys are Base64 text between BEGIN and END lines, wrapped at 64 or 76 characters per line.",
    },
];

const MISTAKES: { title: string; body: string }[] = [
    {
        title: "Treating it as security",
        body: "Base64 hides nothing. An encoded password is a plain-text password to anyone who sees it.",
    },
    {
        title: "Ignoring the character set",
        body: "Encoding text without saying how it becomes bytes causes garbled characters when another system decodes it. Use UTF-8 on both ends.",
    },
    {
        title: "Mixing standard and URL-safe forms",
        body: "A + or / inside a URL gets mangled, and a - or _ fed to a strict standard decoder is rejected. Use the form the receiving system expects.",
    },
    {
        title: "Double encoding",
        body: "Encoding already-encoded text gives output that looks valid but decodes to more Base64. If a decoded result is itself Base64, decode again.",
    },
    {
        title: "Stray whitespace and missing padding",
        body: "Copying from emails or terminals often adds line breaks or removes trailing = signs. This decoder tolerates both, but many strict libraries do not.",
    },
    {
        title: "Embedding large files as Base64",
        body: "A 2 MB image becomes about 2.7 MB of text, loaded with the page and never cached on its own. Reserve data URIs for small assets.",
    },
];

const ALPHABET: { label: string; chars: string; note: string }[] = [
    { label: "Uppercase", chars: "A-Z", note: "values 0 to 25" },
    { label: "Lowercase", chars: "a-z", note: "values 26 to 51" },
    { label: "Digits", chars: "0-9", note: "values 52 to 61" },
    { label: "Symbols", chars: "+ /", note: "values 62 and 63 (URL-safe: - and _)" },
    { label: "Padding", chars: "=", note: "fills the last group; not a data value" },
];

const EXAMPLE_TEXT = "Hello, ProTools Hub! سلام \u{1F44B}";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Tab = "text" | "file";
type Mode = "encode" | "decode";
type FileMode = "to" | "from";
type OutKind = "raw" | "uri";

export default function Base64EncoderTool() {
    const [tab, setTab] = useState<Tab>("text");

    /* ---------- text tab ---------- */
    const [mode, setMode] = useState<Mode>("encode");
    const [input, setInput] = useState("");
    const [urlSafe, setUrlSafe] = useState(false);
    const [noPad, setNoPad] = useState(false);
    const [wrap, setWrap] = useState(false);
    const [showBinary, setShowBinary] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const opts = useMemo<FormatOpts>(() => ({ urlSafe, noPad, wrap }), [urlSafe, noPad, wrap]);
    const result = useMemo(() => processText(input, mode, opts), [input, mode, opts]);

    /* ---------- file tab ---------- */
    const [fileMode, setFileMode] = useState<FileMode>("to");
    const [dragging, setDragging] = useState(false);
    const [reading, setReading] = useState(false);
    const [readPct, setReadPct] = useState(0);
    const [fileErr, setFileErr] = useState<string | null>(null);
    const [picked, setPicked] = useState<{ name: string; size: number; mime: string; std: string } | null>(null);
    const [outKind, setOutKind] = useState<OutKind>("raw");

    const [fbInput, setFbInput] = useState("");
    const [fbName, setFbName] = useState("decoded");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setShowBinary(false);
    }, [input, mode]);

    const copy = useCallback(async (value: string, key: string) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
        } catch {
            /* clipboard blocked; the text can still be selected manually */
        }
    }, []);

    /* ---------- text actions ---------- */

    const swap = () => {
        if (!result.output || result.error) return;
        setInput(result.output);
        setMode((m) => (m === "encode" ? "decode" : "encode"));
    };

    const textBinaryType = result.bytes ? sniffType(result.bytes) : null;

    const downloadTextBinary = () => {
        if (!result.bytes) return;
        const t = textBinaryType;
        const copyBytes = new Uint8Array(result.bytes);
        saveBlob(new Blob([copyBytes], { type: t?.mime ?? "application/octet-stream" }), `decoded.${t?.ext ?? "bin"}`);
    };

    /* ---------- file: to Base64 ---------- */

    const readFile = useCallback((f: File | undefined | null) => {
        if (!f) return;
        setFileErr(null);
        if (f.size > MAX_FILE_BYTES) {
            setPicked(null);
            setFileErr(`This file is ${formatSize(f.size)}. Please choose a file smaller than 10 MB.`);
            return;
        }
        setReading(true);
        setReadPct(0);
        setPicked(null);
        const reader = new FileReader();
        reader.onprogress = (e) => {
            if (e.lengthComputable) setReadPct(Math.round((e.loaded / e.total) * 100));
        };
        reader.onerror = () => {
            setReading(false);
            setFileErr("The file could not be read. Please try again.");
        };
        reader.onload = () => {
            const dataUrl = String(reader.result ?? "");
            const comma = dataUrl.indexOf(",");
            const std = comma >= 0 ? dataUrl.slice(comma + 1) : "";
            setPicked({ name: f.name, size: f.size, mime: f.type || "application/octet-stream", std });
            setReading(false);
            setReadPct(100);
        };
        reader.readAsDataURL(f);
    }, []);

    const fileOutput = useMemo(() => {
        if (!picked) return "";
        if (outKind === "uri") return `data:${picked.mime};base64,${picked.std}`;
        return formatB64(picked.std, opts);
    }, [picked, outKind, opts]);

    /* ---------- file: from Base64 ---------- */

    const fbResult = useMemo(() => {
        if (!fbInput.trim()) return null;
        if (fbInput.length > MAX_B64_CHARS) {
            return { ok: false as const, error: "This input is too large. The limit is about 14 million characters (roughly 10 MB of data)." };
        }
        const res = decodeBase64(fbInput);
        if (!res.ok) return res;
        const sniffed = sniffType(res.bytes);
        const mime = sniffed?.mime ?? res.mime ?? "application/octet-stream";
        const ext = sniffed?.ext ?? MIME_EXT[mime] ?? "bin";
        const isImage = ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(mime);
        return { ok: true as const, bytes: res.bytes, mime, ext, isImage, sniffed: !!sniffed };
    }, [fbInput]);

    useEffect(() => {
        if (fbResult && fbResult.ok && fbResult.isImage && fbResult.bytes.length > 0) {
            const url = URL.createObjectURL(new Blob([new Uint8Array(fbResult.bytes)], { type: fbResult.mime }));
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
        return undefined;
    }, [fbResult]);

    const downloadDecodedFile = () => {
        if (!fbResult || !fbResult.ok) return;
        const base = (fbName.trim() || "decoded").replace(/[\\/:*?"<>|]+/g, "_");
        const name = /\.[A-Za-z0-9]{1,8}$/.test(base) ? base : `${base}.${fbResult.ext}`;
        saveBlob(new Blob([new Uint8Array(fbResult.bytes)], { type: fbResult.mime }), name);
    };

    /* ---------- JSON-LD ---------- */

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

    const overhead =
        mode === "encode" && result.bytesIn > 0 && !result.error
            ? ((result.bytesOut - result.bytesIn) / result.bytesIn) * 100
            : null;

    const CopyBtn = ({ value, k, label = "Copy" }: { value: string; k: string; label?: string }) => (
        <button
            type="button"
            onClick={() => copy(value, k)}
            disabled={!value}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
        >
            {copiedKey === k ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKey === k ? "Copied" : label}
        </button>
    );

    const secondaryBtn =
        "inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-100 transition hover:bg-slate-700 disabled:opacity-40";

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

            {/* ---------------- Tool ---------------- */}
            <div className={`${card} shadow-xl shadow-black/20`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            <Binary className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Base64 Encoder &amp; Decoder</h2>
                            <p className="text-xs text-slate-400">Convert text and files to and from Base64, with full Unicode support.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <Lock className="h-3.5 w-3.5" />
                        Processed on your device
                    </div>
                </div>

                <div className="mb-6">
                    <Segmented
                        label="Input type"
                        value={tab}
                        onChange={setTab}
                        options={[
                            { id: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
                            { id: "file", label: "File", icon: <FileIcon className="h-4 w-4" /> },
                        ]}
                    />
                </div>

                {/* =================== TEXT TAB =================== */}
                {tab === "text" && (
                    <div className="space-y-6">
                        <Segmented
                            label="Direction"
                            value={mode}
                            onChange={(m: Mode) => setMode(m)}
                            options={[
                                { id: "encode", label: "Encode to Base64" },
                                { id: "decode", label: "Decode from Base64" },
                            ]}
                        />

                        {mode === "encode" ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <Toggle checked={urlSafe} onChange={setUrlSafe} label="URL-safe" hint="Uses - and _ instead of + and /" />
                                <Toggle checked={noPad} onChange={setNoPad} label="Remove padding" hint="Drops trailing = signs" />
                                <Toggle checked={wrap} onChange={setWrap} label="Wrap at 76 characters" hint="MIME-style line breaks" />
                            </div>
                        ) : (
                            <p className="flex items-start gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs leading-relaxed text-slate-400">
                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                                The decoder accepts standard and URL-safe Base64, line breaks, missing padding and a leading
                                &quot;data:...;base64,&quot; prefix automatically.
                            </p>
                        )}

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label htmlFor="b64-input" className={fieldLabel}>
                                        {mode === "encode" ? "Text to encode" : "Base64 to decode"}
                                    </label>
                                    <span className="text-[11px] text-slate-500">{input.length.toLocaleString()} characters</span>
                                </div>
                                <textarea
                                    id="b64-input"
                                    dir="auto"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    rows={9}
                                    spellCheck={false}
                                    placeholder={mode === "encode" ? "Type or paste text here…" : "Paste Base64 here…"}
                                    className={textArea}
                                />
                            </div>
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label htmlFor="b64-output" className={fieldLabel}>
                                        {mode === "encode" ? "Base64 result" : "Decoded text"}
                                    </label>
                                    <span className="text-[11px] text-slate-500">{result.output.length.toLocaleString()} characters</span>
                                </div>
                                <textarea
                                    id="b64-output"
                                    dir="auto"
                                    readOnly
                                    value={result.output}
                                    rows={9}
                                    spellCheck={false}
                                    placeholder="The result appears here automatically…"
                                    className={textArea}
                                />
                            </div>
                        </div>

                        {result.error && (
                            <div
                                role="alert"
                                className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium leading-relaxed ${result.kind === "utf8"
                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                                    : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                                    }`}
                            >
                                {result.kind === "utf8" ? (
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                                ) : (
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                )}
                                <div className="space-y-2">
                                    <p>{result.error}</p>
                                    {result.kind === "utf8" && result.bytes && (
                                        <button
                                            type="button"
                                            onClick={() => setShowBinary((v) => !v)}
                                            className="rounded-lg border border-amber-500/40 px-3 py-1 text-[11px] font-bold text-amber-100 transition hover:bg-amber-500/10"
                                        >
                                            {showBinary ? "Hide binary info" : "Show binary info"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {showBinary && result.bytes && (
                            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-3">
                                <div>
                                    <div className={fieldLabel}>Size</div>
                                    <div className="mt-1 text-sm font-bold text-slate-100">{formatSize(result.bytes.length)}</div>
                                </div>
                                <div>
                                    <div className={fieldLabel}>Detected type</div>
                                    <div className="mt-1 text-sm font-bold text-slate-100">{textBinaryType?.mime ?? "Unknown binary"}</div>
                                </div>
                                <div>
                                    <div className={fieldLabel}>First bytes (hex)</div>
                                    <div className="mt-1 break-all font-mono text-xs text-slate-200">{hexPreview(result.bytes)}</div>
                                </div>
                                <div className="sm:col-span-3">
                                    <button type="button" onClick={downloadTextBinary} className={secondaryBtn}>
                                        <Download className="h-4 w-4" />
                                        Download as file
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        {result.bytesIn > 0 && !result.error && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {mode === "encode" ? "Input (UTF-8 bytes)" : "Base64 length"}
                                    </div>
                                    <div className="mt-0.5 text-sm font-bold text-slate-100">{result.bytesIn.toLocaleString()}</div>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {mode === "encode" ? "Base64 length" : "Decoded bytes"}
                                    </div>
                                    <div className="mt-0.5 text-sm font-bold text-slate-100">{result.bytesOut.toLocaleString()}</div>
                                </div>
                                <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center sm:col-span-1">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Size change</div>
                                    <div className="mt-0.5 text-sm font-bold text-cyan-300">
                                        {overhead !== null ? `+${overhead.toFixed(1)}%` : "n/a"}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                            <CopyBtn value={result.output} k="text" label="Copy result" />
                            <button
                                type="button"
                                onClick={() =>
                                    result.output && saveBlob(new Blob([result.output], { type: "text/plain;charset=utf-8" }), mode === "encode" ? "encoded.txt" : "decoded.txt")
                                }
                                disabled={!result.output}
                                className={secondaryBtn}
                            >
                                <Download className="h-4 w-4" />
                                Download .txt
                            </button>
                            <button type="button" onClick={swap} disabled={!result.output || !!result.error} className={secondaryBtn}>
                                <ArrowLeftRight className="h-4 w-4" />
                                Swap input and output
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("encode");
                                    setInput(EXAMPLE_TEXT);
                                }}
                                className={secondaryBtn}
                            >
                                <FileText className="h-4 w-4" />
                                Load example
                            </button>
                            <button
                                type="button"
                                onClick={() => setInput("")}
                                disabled={!input}
                                className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-40"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* =================== FILE TAB =================== */}
                {tab === "file" && (
                    <div className="space-y-6">
                        <Segmented
                            label="File direction"
                            value={fileMode}
                            onChange={(m: FileMode) => setFileMode(m)}
                            options={[
                                { id: "to", label: "File to Base64" },
                                { id: "from", label: "Base64 to file" },
                            ]}
                        />

                        {fileMode === "to" && (
                            <>
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragging(true);
                                    }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragging(false);
                                        if (!reading) readFile(e.dataTransfer.files?.[0]);
                                    }}
                                    className={`rounded-3xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 bg-slate-950/50 hover:border-slate-600"
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-cyan-300">
                                            <Upload className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-100">
                                            {dragging ? "Drop your file here" : "Choose or drop a file"}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-400">Any file type, up to 10 MB. Nothing is uploaded.</p>
                                        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400">
                                            <Upload className="h-4 w-4" />
                                            Browse file
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                disabled={reading}
                                                onChange={(e) => {
                                                    readFile(e.target.files?.[0]);
                                                    e.target.value = "";
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {reading && (
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                                        <div className="mb-1.5 flex justify-between text-[11px] text-slate-400">
                                            <span>Reading file…</span>
                                            <span>{readPct}%</span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                                            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${readPct}%` }} />
                                        </div>
                                    </div>
                                )}

                                {fileErr && (
                                    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-200">
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                        <span>{fileErr}</span>
                                    </div>
                                )}

                                {picked && (
                                    <div className="space-y-5">
                                        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                                            {picked.mime.startsWith("image/") && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={`data:${picked.mime};base64,${picked.std}`}
                                                    alt="Preview of the selected file"
                                                    className="h-16 w-16 rounded-lg border border-slate-800 bg-slate-900 object-contain"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-slate-100">{picked.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {formatSize(picked.size)} · {picked.mime} · Base64 is {formatSize(fileOutput.length)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPicked(null);
                                                    setReadPct(0);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <Segmented
                                                label="Output format"
                                                value={outKind}
                                                onChange={(v: OutKind) => setOutKind(v)}
                                                options={[
                                                    { id: "raw", label: "Raw Base64" },
                                                    { id: "uri", label: "Data URI" },
                                                ]}
                                            />
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                <Toggle checked={urlSafe} onChange={setUrlSafe} disabled={outKind === "uri"} label="URL-safe" />
                                                <Toggle checked={noPad} onChange={setNoPad} disabled={outKind === "uri"} label="Remove padding" />
                                                <Toggle checked={wrap} onChange={setWrap} disabled={outKind === "uri"} label="Wrap at 76 characters" />
                                            </div>
                                            {outKind === "uri" && (
                                                <p className="text-[11px] text-slate-500">
                                                    Formatting options apply to raw Base64 only. A data URI always uses standard Base64.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="file-b64" className={`${fieldLabel} mb-1.5 block`}>
                                                Result
                                            </label>
                                            <textarea
                                                id="file-b64"
                                                readOnly
                                                value={
                                                    fileOutput.length > PREVIEW_LIMIT
                                                        ? fileOutput.slice(0, PREVIEW_LIMIT) + "\n… (preview shortened. Copy or download for the full result)"
                                                        : fileOutput
                                                }
                                                rows={8}
                                                className={textArea}
                                            />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <CopyBtn value={fileOutput} k="file" label="Copy full result" />
                                            <button
                                                type="button"
                                                onClick={() => saveBlob(new Blob([fileOutput], { type: "text/plain;charset=utf-8" }), `${picked.name}.${outKind === "uri" ? "datauri" : "base64"}.txt`)}
                                                className={secondaryBtn}
                                            >
                                                <Download className="h-4 w-4" />
                                                Download .txt
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {fileMode === "from" && (
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="fb-input" className={`${fieldLabel} mb-1.5 block`}>
                                        Base64 or data URI
                                    </label>
                                    <textarea
                                        id="fb-input"
                                        value={fbInput}
                                        onChange={(e) => setFbInput(e.target.value)}
                                        rows={8}
                                        spellCheck={false}
                                        placeholder="Paste Base64 or a data:image/png;base64,… URI here…"
                                        className={textArea}
                                    />
                                    <p className="mt-1.5 text-[11px] text-slate-500">
                                        The file type is detected from the data itself (PNG, JPEG, GIF, WebP, PDF, ZIP) or from the data URI.
                                    </p>
                                </div>

                                {fbResult && !fbResult.ok && (
                                    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium leading-relaxed text-rose-200">
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                        <span>{fbResult.error}</span>
                                    </div>
                                )}

                                {fbResult && fbResult.ok && (
                                    <div className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Size</div>
                                                <div className="mt-0.5 text-sm font-bold text-slate-100">{formatSize(fbResult.bytes.length)}</div>
                                            </div>
                                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    {fbResult.sniffed ? "Detected type" : "Type (from URI)"}
                                                </div>
                                                <div className="mt-0.5 break-all text-sm font-bold text-slate-100">{fbResult.mime}</div>
                                            </div>
                                            <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center sm:col-span-1">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">First bytes</div>
                                                <div className="mt-0.5 break-all font-mono text-xs text-slate-200">{hexPreview(fbResult.bytes, 8)}</div>
                                            </div>
                                        </div>

                                        {!fbResult.sniffed && fbResult.mime === "application/octet-stream" && (
                                            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-200">
                                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                                The file type could not be detected, so it will be saved as .bin. Rename it with the correct extension after downloading.
                                            </p>
                                        )}

                                        {previewUrl && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                                                <img src={previewUrl} alt="Decoded image preview" className="mx-auto max-h-64 max-w-full object-contain" />
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-end gap-3">
                                            <div className="min-w-[200px] flex-1">
                                                <label htmlFor="fb-name" className={`${fieldLabel} mb-1 block`}>
                                                    File name
                                                </label>
                                                <input
                                                    id="fb-name"
                                                    type="text"
                                                    value={fbName}
                                                    onChange={(e) => setFbName(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={downloadDecodedFile}
                                                disabled={fbResult.bytes.length === 0}
                                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-40"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download file
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ---------------- About ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">About the Base64 Encoder &amp; Decoder</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        Base64 is a way of writing any data, including text, images and files, using only 64 safe, printable
                        characters. It is used wherever binary data has to travel through a system built for text: email
                        attachments, JSON APIs, data URIs, tokens and certificates.
                    </p>
                    <p>
                        This tool encodes and decodes text and files entirely in your browser. Text is handled as UTF-8, so
                        Urdu, Arabic, accented letters and emoji work correctly. It also supports the URL-safe variant, optional
                        padding and MIME line wrapping, and it is forgiving when decoding: stray spaces, line breaks, missing
                        padding and data URI prefixes are handled for you.
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
                            "Choose the Text tab for strings or the File tab for images, PDFs and other files.",
                            "Pick a direction: Encode to turn plain data into Base64, or Decode to turn Base64 back into the original.",
                            "Paste your input. The result updates instantly, with an exact error message if the input is not valid.",
                            "Copy the result, download it as a .txt file, or for decoded files, download the original file.",
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
                            "Correct UTF-8 handling for any language and emoji",
                            "Standard and URL-safe (base64url) output, with or without padding",
                            "Optional 76-character line wrapping for MIME and PEM-style output",
                            "Forgiving decoder with precise, specific error messages",
                            "File to Base64 and data URI, and Base64 back to a downloadable file",
                            "Automatic file type detection and image preview",
                            "Free, private, with no sign-up and no uploads",
                        ].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ---------------- What is Base64 ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">What Is Base64 and How Does It Work?</h2>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        Computers store everything as bytes, and a byte can hold 256 different values, many of which are
                        control codes that break text-only systems. Base64 solves this by regrouping the bits. It takes{" "}
                        <strong className="text-slate-100">3 bytes (24 bits)</strong> and splits them into{" "}
                        <strong className="text-slate-100">4 groups of 6 bits</strong>. Each 6-bit group is a number from 0 to
                        63, which is then looked up in a 64-character alphabet.
                    </p>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                        <h3 className="mb-3 text-sm font-bold text-slate-100">Worked example: &quot;Man&quot;</h3>
                        <div className="space-y-2 font-mono text-xs text-slate-300">
                            <div>
                                <span className="text-slate-500">Text:&nbsp;&nbsp;&nbsp;</span> M &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;n
                            </div>
                            <div>
                                <span className="text-slate-500">Bytes:&nbsp;&nbsp;</span> 77 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;97 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;110
                            </div>
                            <div>
                                <span className="text-slate-500">Bits:&nbsp;&nbsp;&nbsp;</span> 01001101 01100001 01101110
                            </div>
                            <div>
                                <span className="text-slate-500">Groups:</span> 010011 010110 000101 101110
                            </div>
                            <div>
                                <span className="text-slate-500">Values:</span> 19 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;22 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;46
                            </div>
                            <div>
                                <span className="text-slate-500">Base64:</span> <span className="font-bold text-cyan-300">T &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;W &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;F &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;u</span>
                            </div>
                        </div>
                        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                            &quot;Ma&quot; becomes TWE= (one padding character) and &quot;M&quot; becomes TQ== (two), because the last group
                            is incomplete.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                        <h3 className="mb-3 text-sm font-bold text-slate-100">The 64-character alphabet</h3>
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {ALPHABET.map((r) => (
                                    <tr key={r.label}>
                                        <td className="py-2 pr-3 font-semibold text-slate-200">{r.label}</td>
                                        <td className="py-2 pr-3 font-mono text-cyan-300">{r.chars}</td>
                                        <td className="py-2 text-slate-400">{r.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {[
                        {
                            t: "About 33% larger",
                            b: "3 bytes in, 4 characters out. A 3 MB file becomes about 4 MB of text, plus a little more if line breaks are added.",
                        },
                        {
                            t: "Padding with =",
                            b: "Output length must be a multiple of 4. One missing byte in the last group adds one =, two missing bytes add two.",
                        },
                        {
                            t: "Lossless and reversible",
                            b: "Decoding returns exactly the original bytes. Nothing is compressed, rounded or lost.",
                        },
                    ].map((c) => (
                        <div key={c.t} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                            <h3 className="mb-1.5 text-sm font-bold text-slate-100">{c.t}</h3>
                            <p className="text-xs leading-relaxed text-slate-400">{c.b}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Encoding vs encryption ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Base64 Is Not Encryption</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        This is the most common and most costly misunderstanding about Base64. Encoding changes the{" "}
                        <em>format</em> of data so it can be transported. Encryption uses a secret key so that only authorised
                        people can read it. Base64 has no key, no secret and no algorithm to break: the process is public and
                        anyone can reverse it in a second, exactly as you can with the Decode button above.
                    </p>
                </div>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[520px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">&nbsp;</th>
                                <th className="px-4 py-3 font-bold">Base64 (encoding)</th>
                                <th className="px-4 py-3 font-bold">Encryption (e.g. AES)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {[
                                ["Purpose", "Carry binary data as text", "Keep data secret"],
                                ["Needs a key", "No", "Yes"],
                                ["Anyone can reverse it", "Yes, instantly", "No, not without the key"],
                                ["Safe for passwords and tokens", "No", "Yes, when used correctly"],
                                ["Changes data size", "About +33%", "Depends on the algorithm"],
                            ].map((r) => (
                                <tr key={r[0]}>
                                    <td className="px-4 py-3 font-semibold text-slate-200">{r[0]}</td>
                                    <td className="px-4 py-3">{r[1]}</td>
                                    <td className="px-4 py-3">{r[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                    If you find credentials or API keys stored as Base64 in a config file or repository, treat them as if they
                    were stored in plain text.
                </p>
            </section>

            {/* ---------------- Common uses ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Common Uses of Base64</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {COMMON_USES.map((u) => (
                        <div key={u.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                            <h3 className="mb-1.5 text-sm font-bold text-slate-100">{u.title}</h3>
                            <p className="text-xs leading-relaxed text-slate-400">{u.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Mistakes ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Common Mistakes to Avoid</h2>
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

            {/* ---------------- FAQ ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {FAQS.map((f) => (
                        <details key={f.q} className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-4 open:border-slate-700">
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
                        { href: "/tools/json-formatter", t: "JSON Formatter", d: "Format and validate JSON that contains Base64 fields." },
                        { href: "/tools/word-counter", t: "Word Counter", d: "Count words and characters in any text." },
                        { href: "/tools/lorem-ipsum-generator", t: "Lorem Ipsum Generator", d: "Generate placeholder text to test with." },
                        { href: "/tools/image-compressor", t: "Image Compressor", d: "Shrink images before embedding them as data URIs." },
                        { href: "/tools/image-resizer", t: "Image Resizer", d: "Resize images to keep data URIs small." },
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
                            <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}