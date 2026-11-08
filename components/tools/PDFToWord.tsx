"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    FileText,
    Upload,
    Download,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Info,
    Loader2,
    ShieldCheck,
    Zap,
    HelpCircle,
    ScanText,
    Copy,
    Check,
    X,
    Lightbulb,
    ArrowRight,
    AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Block {
    text: string;
    heading: boolean;
}

interface TextItem {
    str: string;
    transform: number[];
    width: number;
    height: number;
    hasEOL?: boolean;
}

interface Status {
    kind: "info" | "success" | "warn" | "error";
    text: string;
}

interface Summary {
    pages: number;
    ocrPages: number;
    words: number;
    bytes: number;
}

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_OCR_PAGES = 40;
const OCR_SCALE = 2;
const MAX_OCR_PIXELS = 12_000_000;

const OCR_LANGUAGES: { code: string; label: string }[] = [
    { code: "eng", label: "English" },
    { code: "urd", label: "Urdu" },
    { code: "eng+urd", label: "English + Urdu" },
    { code: "ara", label: "Arabic" },
    { code: "hin", label: "Hindi" },
    { code: "spa", label: "Spanish" },
    { code: "fra", label: "French" },
    { code: "deu", label: "German" },
];

/* ------------------------------------------------------------------ */
/*  Text layout (pure functions)                                       */
/* ------------------------------------------------------------------ */

const containsRTL = (text: string) => /[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text);

const median = (values: number[]) => {
    if (values.length === 0) return 0;
    const s = [...values].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
};

/**
 * Turns the raw text items of one PDF page into lines and then paragraphs.
 * pdf.js gives separate fragments with positions; this groups fragments that
 * share a baseline into lines, and (optionally) joins lines that belong to the
 * same paragraph based on how far apart they are vertically.
 */
const blocksFromItems = (items: TextItem[], reflow: boolean): Block[] => {
    interface Line {
        text: string;
        y: number;
        h: number;
    }
    const lines: Line[] = [];
    let cur: Line | null = null;
    let lastStart = 0;
    let lastEnd = 0;

    const flush = () => {
        if (cur) lines.push(cur);
        cur = null;
    };

    for (const it of items) {
        if (typeof it.str !== "string") continue;
        if (it.str.length === 0) {
            if (it.hasEOL) flush();
            continue;
        }
        const x = it.transform[4];
        const y = it.transform[5];
        const h = it.height || Math.abs(it.transform[3]) || 10;

        if (cur && Math.abs(y - cur.y) <= h * 0.5) {
            // same line: add a space when there is a visible gap (works for LTR and RTL runs)
            const gap = Math.min(Math.abs(x - lastEnd), Math.abs(x + it.width - lastStart));
            const needSpace = gap > h * 0.15 && !cur.text.endsWith(" ") && !it.str.startsWith(" ");
            cur.text += (needSpace ? " " : "") + it.str;
            cur.h = Math.max(cur.h, h);
        } else {
            flush();
            cur = { text: it.str, y, h };
        }
        lastStart = x;
        lastEnd = x + it.width;
        if (it.hasEOL) flush();
    }
    flush();

    const clean = lines
        .map((l) => ({ ...l, text: l.text.replace(/\s+/g, " ").trim() }))
        .filter((l) => l.text.length > 0);
    if (clean.length === 0) return [];

    const bodyH = median(clean.map((l) => l.h));
    const deltas: number[] = [];
    for (let i = 1; i < clean.length; i++) {
        const d = clean[i - 1].y - clean[i].y;
        if (d > 0) deltas.push(d);
    }
    const pitch = median(deltas) || bodyH * 1.3;

    const blocks: Block[] = [];
    let prev: Line | null = null;
    let prevHeading = false;

    for (const l of clean) {
        const heading = l.h >= bodyH * 1.3 && l.text.length < 120;
        const delta = prev ? prev.y - l.y : 0;
        const startNew =
            !reflow || !prev || heading || prevHeading || delta <= 0 || delta > pitch * 1.6;

        if (startNew) {
            blocks.push({ text: l.text, heading });
        } else {
            blocks[blocks.length - 1].text += " " + l.text;
        }
        prev = l;
        prevHeading = heading;
    }
    return blocks;
};

const blocksFromOcrText = (raw: string, reflow: boolean): Block[] => {
    const out: Block[] = [];
    raw.split(/\n{2,}/).forEach((para) => {
        const lines = para.split("\n").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
        if (lines.length === 0) return;
        if (reflow) out.push({ text: lines.join(" "), heading: false });
        else lines.forEach((t) => out.push({ text: t, heading: false }));
    });
    return out;
};

const countWords = (blocks: Block[][]) =>
    blocks.flat().reduce((n, b) => n + (b.text.trim() ? b.text.trim().split(/\s+/).length : 0), 0);

const plainText = (pages: Block[][]) =>
    pages.map((p) => p.map((b) => b.text).join("\n\n")).join("\n\n\f\n\n");

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/* ------------------------------------------------------------------ */
/*  Word document                                                      */
/* ------------------------------------------------------------------ */

const buildDocx = async (pages: Block[][], pageBreaks: boolean): Promise<Blob> => {
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const children: InstanceType<typeof Paragraph>[] = [];

    pages.forEach((blocks, pageIndex) => {
        blocks.forEach((b, i) => {
            const rtl = containsRTL(b.text);
            children.push(
                new Paragraph({
                    bidirectional: rtl,
                    pageBreakBefore: pageBreaks && pageIndex > 0 && i === 0,
                    spacing: { before: b.heading ? 240 : 0, after: b.heading ? 120 : 160, line: 300 },
                    children: [
                        new TextRun({
                            text: b.text,
                            rightToLeft: rtl,
                            bold: b.heading,
                            font: "Arial",
                            size: b.heading ? 30 : 24,
                        }),
                    ],
                })
            );
        });
    });

    const doc = new Document({ sections: [{ properties: {}, children }] });
    return Packer.toBlob(doc);
};

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const FAQS: { q: string; a: string }[] = [
    {
        q: "Is my PDF uploaded to a server?",
        a: "No. Your PDF is read and converted entirely in your browser using PDF.js and the docx library. The document itself is never sent to ProTools Hub or anyone else. The one network request is for scanned files: the OCR engine and the language data for the language you pick are downloaded once from a public CDN. That download contains no part of your document.",
    },
    {
        q: "Will the Word file look exactly like my PDF?",
        a: "No, and no browser-based converter can promise that. This tool extracts the text, keeps paragraphs and detects larger text as headings, and starts each page on a new page if you want. It does not recreate tables, columns, images, shapes, fonts, headers or footers. It is best for getting the words of a document into an editable form. For a layout-faithful result, try opening the PDF directly in Microsoft Word.",
    },
    {
        q: "What is OCR and when is it used?",
        a: "OCR (optical character recognition) reads text out of pictures. Scanned documents and photographed pages contain no real text, only images of text, so there is nothing to copy. When a page has no selectable text, this tool automatically renders it as an image and runs OCR on it. Pages that already contain real text are never run through OCR, which keeps them fast and accurate.",
    },
    {
        q: "How accurate is the OCR?",
        a: "Accuracy depends heavily on the scan. Clean, straight, high-resolution pages in a supported language can be very accurate, while blurry photos, skewed pages, handwriting, small print or decorative fonts produce mistakes. Always proofread OCR output. Choose the correct language before converting, because it makes a large difference.",
    },
    {
        q: "Does it support Urdu and other right-to-left languages?",
        a: "Yes, OCR is available for Urdu and Arabic, and paragraphs containing right-to-left text are marked as right-to-left in the Word file. Urdu in a Nastaliq style is harder for OCR than a printed Naskh font, so expect to review the result. For digital PDFs, the order and shaping of extracted right-to-left text depends on how the PDF was created.",
    },
    {
        q: "Why is the conversion slow for some files?",
        a: "Digital PDFs convert in seconds. OCR is the slow part because every scanned page is rendered and analysed by a recognition engine running in your browser, which can take several seconds per page on an average laptop. To keep your browser responsive we limit OCR to 40 pages per run. Split longer scans into parts.",
    },
    {
        q: "Can it convert a password-protected PDF?",
        a: "Not directly. If a PDF requires a password to open, the text cannot be read. Remove the password in the program that created the file or open it and save an unprotected copy, then try again.",
    },
    {
        q: "Is it free? Is there a limit?",
        a: "It is free, needs no account and adds no watermark. Files up to 100 MB are accepted, and OCR runs on up to 40 scanned pages at a time.",
    },
];

const TIPS: string[] = [
    "Try selecting text in your PDF first. If you can highlight it, it is a digital PDF and will convert quickly and accurately.",
    "For scans, pick the correct OCR language before converting. Using English on Urdu text produces nonsense.",
    "Scan at 300 DPI, keep pages straight and use good lighting for the best OCR accuracy.",
    "Leave Reflow paragraphs on for prose such as essays and articles; turn it off for lists, addresses or poetry where each line matters.",
    "Convert a long scan in sections of 40 pages or fewer.",
    "Proofread the result, especially numbers, names and punctuation, before relying on it.",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";

type PdfjsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type OcrWorker = { recognize: (image: HTMLCanvasElement) => Promise<{ data: { text: string } }>; terminate: () => Promise<unknown> };

export default function PDFToWord() {
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState("");
    const [status, setStatus] = useState<Status | null>(null);
    const [dragging, setDragging] = useState(false);

    const [language, setLanguage] = useState("eng");
    const [reflow, setReflow] = useState(true);
    const [pageBreaks, setPageBreaks] = useState(true);

    const [docx, setDocx] = useState<Blob | null>(null);
    const [text, setText] = useState("");
    const [summary, setSummary] = useState<Summary | null>(null);
    const [copied, setCopied] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const cancelRef = useRef(false);
    const workerRef = useRef<OcrWorker | null>(null);

    // Stop any OCR worker if the user leaves the page mid-conversion.
    useEffect(() => {
        return () => {
            cancelRef.current = true;
            void workerRef.current?.terminate();
        };
    }, []);

    const clearResult = useCallback(() => {
        setDocx(null);
        setText("");
        setSummary(null);
        setCopied(false);
    }, []);

    const reset = useCallback(() => {
        setFile(null);
        setStatus(null);
        setProgress(0);
        setPhase("");
        clearResult();
        if (inputRef.current) inputRef.current.value = "";
    }, [clearResult]);

    const acceptFile = useCallback(
        (f: File | undefined | null) => {
            if (!f) return;
            const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
            if (!isPdf) {
                setFile(null);
                clearResult();
                setStatus({ kind: "error", text: "Please choose a valid PDF file." });
                return;
            }
            if (f.size === 0) {
                setFile(null);
                clearResult();
                setStatus({ kind: "error", text: "This file is empty." });
                return;
            }
            if (f.size > MAX_FILE_BYTES) {
                setFile(null);
                clearResult();
                setStatus({ kind: "warn", text: `This file is ${formatSize(f.size)}. Please choose a PDF smaller than 100 MB.` });
                return;
            }
            setFile(f);
            clearResult();
            setStatus(null);
            setProgress(0);
        },
        [clearResult]
    );

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (!busy) acceptFile(e.dataTransfer.files?.[0]);
    };

    const cancel = () => {
        cancelRef.current = true;
        void workerRef.current?.terminate();
    };

    /* ----------------------------- Convert ----------------------------- */

    const convert = async () => {
        if (!file || busy) return;
        cancelRef.current = false;
        setBusy(true);
        clearResult();
        setProgress(2);
        setStatus({ kind: "info", text: "Opening your PDF…" });
        setPhase("Opening PDF");

        let pdf: Awaited<ReturnType<PdfjsModule["getDocument"]>["promise"]> | null = null;

        try {
            const pdfjsLib: PdfjsModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
            // Bundled with your app, so no third-party CDN is needed for PDF reading.
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
                import.meta.url
            ).toString();

            const data = new Uint8Array(await file.arrayBuffer());
            pdf = await pdfjsLib.getDocument({ data, isEvalSupported: false }).promise;
            const total = pdf.numPages;
            if (!total) throw new Error("EMPTY");

            const pages: Block[][] = new Array(total).fill(null).map(() => []);
            const needOcr: number[] = [];

            // 1. Read real text where it exists
            for (let n = 1; n <= total; n++) {
                if (cancelRef.current) throw new Error("CANCELLED");
                setPhase(`Reading page ${n} of ${total}`);
                const page = await pdf.getPage(n);
                const content = await page.getTextContent();
                const blocks = blocksFromItems(content.items as unknown as TextItem[], reflow);
                const chars = blocks.reduce((c, b) => c + b.text.length, 0);
                if (chars > 3) pages[n - 1] = blocks;
                else needOcr.push(n);
                page.cleanup();
                setProgress(2 + Math.round((n / total) * 28));
                await new Promise((r) => setTimeout(r, 0));
            }

            // 2. OCR for pages with no text layer
            if (needOcr.length > 0) {
                if (needOcr.length > MAX_OCR_PAGES) throw new Error(`OCRLIMIT:${needOcr.length}`);

                setStatus({
                    kind: "info",
                    text: `${needOcr.length} page${needOcr.length === 1 ? " has" : "s have"} no selectable text, so OCR is running. The first run downloads the OCR engine and language data.`,
                });
                setPhase("Loading OCR engine");

                const { createWorker } = await import("tesseract.js");
                let pageProgress = 0;
                const worker = (await createWorker(language, 1, {
                    logger: (m: { status: string; progress: number }) => {
                        if (m.status === "recognizing text") pageProgress = m.progress;
                    },
                })) as unknown as OcrWorker;
                workerRef.current = worker;

                try {
                    for (let i = 0; i < needOcr.length; i++) {
                        if (cancelRef.current) throw new Error("CANCELLED");
                        const n = needOcr[i];
                        setPhase(`OCR page ${n} (${i + 1} of ${needOcr.length})`);
                        pageProgress = 0;

                        const page = await pdf.getPage(n);
                        const base = page.getViewport({ scale: 1 });
                        const wanted = base.width * OCR_SCALE * (base.height * OCR_SCALE);
                        const scale = wanted > MAX_OCR_PIXELS ? OCR_SCALE * Math.sqrt(MAX_OCR_PIXELS / wanted) : OCR_SCALE;
                        const viewport = page.getViewport({ scale });

                        const canvas = document.createElement("canvas");
                        canvas.width = Math.max(1, Math.ceil(viewport.width));
                        canvas.height = Math.max(1, Math.ceil(viewport.height));
                        const ctx = canvas.getContext("2d", { willReadFrequently: true });
                        if (!ctx) throw new Error("CANVAS");
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        const params = { canvasContext: ctx, canvas, viewport } as unknown as Parameters<typeof page.render>[0];
                        await page.render(params).promise;

                        const result = await worker.recognize(canvas);
                        pages[n - 1] = blocksFromOcrText(result.data.text, reflow);

                        canvas.width = 1;
                        canvas.height = 1;
                        page.cleanup();
                        setProgress(30 + Math.round(((i + 1) / needOcr.length) * 60));
                    }
                } finally {
                    workerRef.current = null;
                    try {
                        await worker.terminate();
                    } catch {
                        /* already stopped */
                    }
                }
            }

            if (cancelRef.current) throw new Error("CANCELLED");

            const words = countWords(pages);
            if (words === 0) throw new Error("NOTEXT");

            // 3. Build the Word file
            setPhase("Creating Word document");
            setProgress(94);
            const blob = await buildDocx(pages, pageBreaks);

            setDocx(blob);
            setText(plainText(pages));
            setSummary({ pages: total, ocrPages: needOcr.length, words, bytes: blob.size });
            setProgress(100);
            setStatus({
                kind: "success",
                text:
                    needOcr.length > 0
                        ? `Done. ${total} pages converted, ${needOcr.length} with OCR. Please proofread the OCR pages.`
                        : `Done. ${total} page${total === 1 ? "" : "s"} converted.`,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "";
            const name = (err as { name?: string })?.name ?? "";
            if (msg === "CANCELLED") {
                setStatus({ kind: "info", text: "Cancelled. Nothing was changed." });
            } else if (name === "PasswordException" || /password/i.test(msg)) {
                setStatus({ kind: "error", text: "This PDF is password-protected. Remove the password and try again." });
            } else if (name === "InvalidPDFException" || /Invalid PDF|No PDF header/i.test(msg)) {
                setStatus({ kind: "error", text: "This file looks damaged or is not a valid PDF." });
            } else if (msg.startsWith("OCRLIMIT:")) {
                setStatus({
                    kind: "warn",
                    text: `${msg.slice(9)} pages need OCR. To keep your browser responsive the limit is ${MAX_OCR_PAGES} scanned pages per run. Split the PDF into smaller parts.`,
                });
            } else if (msg === "NOTEXT") {
                setStatus({
                    kind: "warn",
                    text: "No readable text was found. If this is a scan, make sure the OCR language matches the document and the pages are clear and upright.",
                });
            } else if (msg === "EMPTY") {
                setStatus({ kind: "error", text: "This PDF does not contain any pages." });
            } else {
                console.error("PDF to Word error:", err);
                setStatus({
                    kind: "error",
                    text: "Something went wrong while converting this PDF. Check your connection if it needed OCR, then try again.",
                });
            }
            clearResult();
            setProgress(0);
        } finally {
            try {
                void pdf?.destroy();
            } catch {
                /* ignore */
            }
            setBusy(false);
            setPhase("");
        }
    };

    /* ----------------------------- Outputs ----------------------------- */

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

    const baseName = file ? file.name.replace(/\.pdf$/i, "") : "document";

    const downloadDocx = () => docx && saveBlob(docx, `${baseName}.docx`);
    const downloadTxt = () => text && saveBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), `${baseName}.txt`);

    const copyText = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard blocked */
        }
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

    const statusStyles: Record<Status["kind"], string> = {
        info: "border-slate-700 bg-slate-800/60 text-slate-200",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        warn: "border-amber-500/30 bg-amber-500/10 text-amber-200",
        error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    };
    const StatusIcon = status ? { info: Info, success: CheckCircle2, warn: AlertCircle, error: AlertCircle }[status.kind] : Info;

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
                            <h2 className="text-xl font-bold text-slate-100">PDF to Word Converter</h2>
                            <p className="text-xs text-slate-400">Extract text from digital and scanned PDFs into an editable .docx file.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Your PDF is never uploaded
                    </div>
                </div>

                {/* Drop zone */}
                {!file && (
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (!busy) setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        className={`rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-10 ${dragging ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 bg-slate-950/50 hover:border-slate-600"
                            }`}
                    >
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-cyan-300">
                                <Upload className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-100">{dragging ? "Drop your PDF here" : "Choose or drop a PDF file"}</h3>
                            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                                Digital PDFs and scanned documents. Up to 100 MB.
                            </p>
                            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400">
                                <Upload className="h-4 w-4" />
                                Browse PDF file
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={(e) => acceptFile(e.target.files?.[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {file && (
                    <div className="space-y-5">
                        {/* File card */}
                        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-100">{file.name}</p>
                                    <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={reset}
                                disabled={busy}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        </div>

                        {/* Options */}
                        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 md:grid-cols-3">
                            <div>
                                <label htmlFor="ocr-lang" className={`${fieldLabel} mb-1.5 flex items-center gap-1.5`}>
                                    <ScanText className="h-3.5 w-3.5" />
                                    OCR language (scans only)
                                </label>
                                <select
                                    id="ocr-lang"
                                    value={language}
                                    disabled={busy}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                                >
                                    {OCR_LANGUAGES.map((l) => (
                                        <option key={l.code} value={l.code}>
                                            {l.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1.5 text-[11px] text-slate-500">Ignored for pages that already contain real text.</p>
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                                <input
                                    type="checkbox"
                                    checked={reflow}
                                    disabled={busy}
                                    onChange={(e) => setReflow(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 accent-cyan-500"
                                />
                                <span>
                                    <span className="block text-xs font-semibold text-slate-200">Reflow paragraphs</span>
                                    <span className="block text-[11px] text-slate-500">Join wrapped lines into paragraphs. Turn off to keep every line break.</span>
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                                <input
                                    type="checkbox"
                                    checked={pageBreaks}
                                    disabled={busy}
                                    onChange={(e) => setPageBreaks(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 accent-cyan-500"
                                />
                                <span>
                                    <span className="block text-xs font-semibold text-slate-200">Keep page breaks</span>
                                    <span className="block text-[11px] text-slate-500">Start each original PDF page on a new Word page.</span>
                                </span>
                            </label>
                        </div>

                        {/* Honest note */}
                        <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 text-[11px] leading-relaxed text-slate-400">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                            <span>
                                This tool converts <strong className="text-slate-200">text</strong>. Images, tables, columns and exact
                                fonts are not recreated in the Word file.
                            </span>
                        </div>

                        {/* Action */}
                        {busy ? (
                            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-2 font-semibold text-slate-200">
                                        <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                                        {phase || "Working"}
                                    </span>
                                    <span className="font-bold text-cyan-300">{progress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div className="h-full rounded-full bg-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                                <button
                                    type="button"
                                    onClick={cancel}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-100 transition hover:bg-slate-700"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={convert}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                            >
                                <Zap className="h-5 w-5" />
                                {docx ? "Convert again" : "Convert to Word"}
                            </button>
                        )}
                    </div>
                )}

                {/* Status */}
                {status && (
                    <div role="status" className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium ${statusStyles[status.kind]}`}>
                        <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
                        <span className="leading-relaxed">{status.text}</span>
                    </div>
                )}

                {/* Result */}
                {docx && summary && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                        <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
                            <h3 className="text-sm font-bold text-slate-100">Your Word document is ready</h3>
                            <p className="text-xs text-slate-400">Review the text below, then download it.</p>
                        </div>
                        <div className="space-y-4 p-5">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { l: "Pages", v: String(summary.pages) },
                                    { l: "OCR pages", v: String(summary.ocrPages) },
                                    { l: "Words", v: summary.words.toLocaleString() },
                                    { l: "File size", v: formatSize(summary.bytes) },
                                ].map((s) => (
                                    <div key={s.l} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
                                        <div className="mt-0.5 text-sm font-bold text-slate-100">{s.v}</div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <div className={`${fieldLabel} mb-1.5`}>Text preview</div>
                                <pre
                                    dir="auto"
                                    className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300"
                                >
                                    {text.length > 3000 ? text.slice(0, 3000) + "\n\n…" : text}
                                </pre>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={downloadDocx}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                                >
                                    <Download className="h-4 w-4" />
                                    Download .docx
                                </button>
                                <button
                                    type="button"
                                    onClick={downloadTxt}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-slate-100 transition hover:bg-slate-700"
                                >
                                    <Download className="h-4 w-4" />
                                    .txt
                                </button>
                                <button
                                    type="button"
                                    onClick={copyText}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-slate-100 transition hover:bg-slate-700"
                                >
                                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                    {copied ? "Copied" : "Copy text"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------------- About ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">About the PDF to Word Converter</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        PDFs are made to be read, not edited. When you need to reuse the words in a contract, article,
                        report or study material, retyping them is slow and error-prone. This tool pulls the text out of
                        your PDF and places it in a Word (.docx) document you can edit in Microsoft Word, Google Docs or
                        LibreOffice.
                    </p>
                    <p>
                        It handles the two kinds of PDF differently. <strong className="text-slate-100">Digital PDFs</strong> contain real text, which is
                        read directly, so the result is exact. <strong className="text-slate-100">Scanned PDFs</strong> contain only pictures of pages, so
                        the tool runs optical character recognition (OCR) on them, with support for English, Urdu, Arabic
                        and several other languages. Everything runs in your browser, so your documents are not uploaded
                        to a server.
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
                            "Drop your PDF onto the box or click Browse. Files up to 100 MB are accepted.",
                            "If the PDF is a scan, choose its language. Adjust paragraph and page-break options if you like.",
                            "Click Convert to Word and watch the progress. You can cancel at any time.",
                            "Check the text preview, then download the .docx, or save or copy the plain text.",
                        ].map((t, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">{i + 1}</span>
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
                            "Your PDF stays on your device; nothing is uploaded",
                            "Automatic OCR for pages that have no selectable text",
                            "OCR in English, Urdu, Arabic, Hindi, Spanish, French and German",
                            "Paragraph reflow and heading detection from text size",
                            "Right-to-left paragraphs are marked correctly in Word",
                            "Optional page breaks, plus .txt download and copy",
                            "Free, no sign-up, no watermark",
                        ].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ---------------- What is and isn't kept ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">What Is and Isn&apos;t Converted</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[520px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">Element</th>
                                <th className="px-4 py-3 font-bold">Result in the Word file</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {[
                                ["Body text", "Extracted and grouped into paragraphs"],
                                ["Headings", "Larger text is detected and made bold"],
                                ["Page structure", "Each PDF page can start on a new Word page"],
                                ["Scanned text", "Recognised with OCR; needs proofreading"],
                                ["Right-to-left text", "Paragraph direction is set to right-to-left"],
                                ["Images and logos", "Not included"],
                                ["Tables and columns", "Not recreated; their text appears as plain paragraphs"],
                                ["Fonts, colours, bold and italic", "Not preserved; the file uses Arial"],
                                ["Headers, footers, links, forms", "Not preserved as such"],
                            ].map((r) => (
                                <tr key={r[0]}>
                                    <td className="px-4 py-3 font-semibold text-slate-200">{r[0]}</td>
                                    <td className="px-4 py-3">{r[1]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                    If you need a layout-faithful result with tables and images, open the PDF directly in Microsoft Word or use desktop software.
                </p>
            </section>

            {/* ---------------- Digital vs scanned ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">Digital PDFs vs. Scanned PDFs</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                        <h3 className="mb-1.5 text-sm font-bold text-slate-100">Digital (text) PDFs</h3>
                        <p className="text-xs leading-relaxed text-slate-400">
                            Created by exporting from Word, Google Docs, a website or a design program. You can select and
                            copy the text. Conversion is fast and the words are exact, because they are read straight out of
                            the file.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                        <h3 className="mb-1.5 text-sm font-bold text-slate-100">Scanned (image) PDFs</h3>
                        <p className="text-xs leading-relaxed text-slate-400">
                            Created by a scanner or a phone camera. Each page is a photograph of text, so there is nothing to
                            copy. OCR analyses the image and guesses the characters. Results depend on scan quality, language
                            and font, so always proofread.
                        </p>
                    </div>
                </div>
            </section>

            {/* ---------------- Tips ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Tips for Better Results</h2>
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

            {/* ---------------- Privacy ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">Privacy: What Stays on Your Device</h2>
                <p className="text-sm leading-relaxed text-slate-300">
                    PDFs often hold personal or confidential information such as ID cards, invoices and contracts. This
                    converter reads your file with the browser&apos;s File API and processes it locally with PDF.js; the Word
                    file is generated in your browser too. Your document is never sent to our servers. The only network
                    activity is for scanned files, where the OCR engine and the language data are fetched from a public
                    CDN the first time you use OCR. Those downloads do not include your document. You can verify this in
                    your browser&apos;s network tab.
                </p>
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
                        { href: "/tools/word-counter", t: "Word Counter", d: "Count the words in your converted text." },
                        { href: "/tools/image-compressor", t: "Image Compressor", d: "Shrink images before building documents." },
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