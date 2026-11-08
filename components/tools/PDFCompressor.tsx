"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
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
    FileCheck2,
    HelpCircle,
    Layers,
    ImageIcon,
    Lightbulb,
    AlertTriangle,
    ArrowRight,
    X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types and constants                                                */
/* ------------------------------------------------------------------ */

type Method = "optimize" | "shrink";
type Preset = "quality" | "balanced" | "maximum";

interface Status {
    kind: "info" | "success" | "warn" | "error";
    text: string;
}

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_SHRINK_PAGES = 100;
const MAX_CANVAS_PIXELS = 12_000_000;

// scale is relative to the PDF's own size (1 = 72 DPI).
const PRESETS: Record<Preset, { label: string; scale: number; quality: number; dpi: string; note: string }> = {
    quality: { label: "Better quality", scale: 2, quality: 0.82, dpi: "about 144 DPI", note: "Sharp text, moderate savings" },
    balanced: { label: "Balanced", scale: 1.5, quality: 0.7, dpi: "about 108 DPI", note: "Good for most documents" },
    maximum: { label: "Smallest size", scale: 1, quality: 0.5, dpi: "about 72 DPI", note: "Screen reading only" },
};

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const FAQS: { q: string; a: string }[] = [
    {
        q: "Are my PDF files uploaded to a server?",
        a: "No. Everything happens inside your browser using the PDF.js and pdf-lib libraries. Your document is read from your device, processed in memory and offered back to you as a download. It is never sent to ProTools Hub or to any third party.",
    },
    {
        q: "What is the difference between Optimize and Shrink?",
        a: "Optimize keeps the PDF exactly as it is, including selectable text, links and forms, and rewrites its internal structure more efficiently. Savings are usually small, often under 15%. Shrink turns each page into a compressed image, which can reduce scanned or image-heavy files dramatically, but the text in the result can no longer be selected, searched or copied.",
    },
    {
        q: "Why did my PDF not get smaller?",
        a: "Many PDFs are already well optimized, and text-based documents are naturally tiny, so turning them into images can make them larger. When the result would be larger than your original we tell you and keep your original instead of giving you a worse file. Scanned documents and PDFs full of photographs benefit most.",
    },
    {
        q: "Will the quality of my document change?",
        a: "With Optimize, nothing visible changes. With Shrink, every page is re-rendered at a lower resolution and saved as a JPEG, so fine detail is lost. Better quality is about 144 DPI, Balanced about 108 DPI and Smallest size about 72 DPI. Use the first for anything people will read closely or print.",
    },
    {
        q: "Can I compress a password-protected PDF?",
        a: "Not directly. Encrypted files cannot be read without the password, and this tool does not ask for one. Remove the protection in the program you used to create the file, then try again.",
    },
    {
        q: "Is there a file size or page limit?",
        a: "Files up to 25 MB are accepted, and Shrink handles up to 100 pages because every page is rendered in your browser's memory. For larger documents, split the file into parts first or use desktop software.",
    },
    {
        q: "Should I use this for legal or official documents?",
        a: "Be careful with Shrink. Because the output is made of images, it is not suitable where searchable text, accessibility or digital signatures matter. Signatures are not preserved by either method. Always keep your original file and check the result before sending it.",
    },
    {
        q: "How can I reduce a PDF's size before exporting it?",
        a: "The biggest savings happen at the source. Compress photos before inserting them, avoid embedding full-resolution images, use standard fonts, and choose a smaller-file or web export option in your word processor or design program. Our Image Compressor can shrink pictures before you place them in a document.",
    },
];

const TIPS: string[] = [
    "Start with Optimize. If the file is still too large for an email or upload form, switch to Shrink.",
    "For scanned documents, Balanced is usually the best trade-off between legibility and size.",
    "Check the result by zooming in on the smallest text before you delete the original.",
    "Compress images separately before building a PDF. It gives you more control and often beats compressing the finished file.",
    "If a file is over 25 MB, split it into sections and compress each part.",
    "Never share a compressed copy as your only version. Keep the original for printing and archiving.",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";

export default function PDFCompressor() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<Blob | null>(null);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<Status | null>(null);
    const [dragging, setDragging] = useState(false);

    const [method, setMethod] = useState<Method>("optimize");
    const [preset, setPreset] = useState<Preset>("balanced");
    const [stripMeta, setStripMeta] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const cancelRef = useRef(false);

    const reset = useCallback(() => {
        setFile(null);
        setResult(null);
        setStatus(null);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
    }, []);

    const acceptFile = useCallback((f: File | undefined | null) => {
        if (!f) return;
        const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
        if (!isPdf) {
            setFile(null);
            setResult(null);
            setStatus({ kind: "error", text: "Please choose a valid PDF file." });
            return;
        }
        if (f.size > MAX_FILE_BYTES) {
            setFile(null);
            setResult(null);
            setStatus({
                kind: "warn",
                text: `This file is ${formatSize(f.size)}. Please choose a PDF smaller than 25 MB.`,
            });
            return;
        }
        setFile(f);
        setResult(null);
        setStatus(null);
        setProgress(0);
    }, []);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (busy) return;
        acceptFile(e.dataTransfer.files?.[0]);
    };

    /* ----------------------- Method 1: optimize ----------------------- */

    const optimize = async (buffer: ArrayBuffer): Promise<Uint8Array> => {
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(buffer, { updateMetadata: false });
        if (stripMeta) {
            doc.setTitle("");
            doc.setAuthor("");
            doc.setSubject("");
            doc.setKeywords([]);
            doc.setCreator("");
            doc.setProducer("");
        }
        setProgress(70);
        return doc.save({ useObjectStreams: true });
    };

    /* ----------------------- Method 2: shrink ------------------------- */

    const shrink = async (buffer: ArrayBuffer): Promise<Uint8Array> => {
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const { PDFDocument } = await import("pdf-lib");

        // The worker must come from the same build (legacy) as the library.
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
            import.meta.url
        ).toString();

        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            isEvalSupported: false,
        });
        const pdf = await loadingTask.promise;

        try {
            if (pdf.numPages > MAX_SHRINK_PAGES) {
                throw new Error(`PAGES:${pdf.numPages}`);
            }

            const out = await PDFDocument.create();
            const { scale, quality } = PRESETS[preset];

            for (let n = 1; n <= pdf.numPages; n++) {
                if (cancelRef.current) throw new Error("CANCELLED");

                const page = await pdf.getPage(n);

                // Keep the original page size in PDF points.
                const base = page.getViewport({ scale: 1 });

                // Never allow one page to exceed the canvas budget.
                const wanted = base.width * scale * (base.height * scale);
                const safeScale = wanted > MAX_CANVAS_PIXELS ? scale * Math.sqrt(MAX_CANVAS_PIXELS / wanted) : scale;
                const viewport = page.getViewport({ scale: safeScale });

                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.ceil(viewport.width));
                canvas.height = Math.max(1, Math.ceil(viewport.height));
                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("CANVAS");

                // JPEG has no transparency, so paint the page white first.
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const params = { canvasContext: ctx, canvas, viewport } as unknown as Parameters<
                    typeof page.render
                >[0];
                await page.render(params).promise;

                const blob = await toBlob(canvas, "image/jpeg", quality);
                canvas.width = 1;
                canvas.height = 1;
                if (!blob) throw new Error("CANVAS");

                const image = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
                const newPage = out.addPage([base.width, base.height]);
                newPage.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });

                page.cleanup();
                setProgress(Math.round((n / pdf.numPages) * 95));
                // let the browser paint the progress bar
                await new Promise((r) => setTimeout(r, 0));
            }

            return out.save({ useObjectStreams: true });
        } finally {
            void pdf.destroy();
        }
    };

    /* --------------------------- Run --------------------------------- */

    const run = async () => {
        if (!file) return;
        cancelRef.current = false;
        setBusy(true);
        setResult(null);
        setProgress(5);
        setStatus({ kind: "info", text: method === "optimize" ? "Optimizing your PDF…" : "Shrinking your PDF…" });

        try {
            const buffer = await file.arrayBuffer();
            const bytes = method === "optimize" ? await optimize(buffer) : await shrink(buffer);

            const copy = new Uint8Array(bytes.byteLength);
            copy.set(bytes);
            const blob = new Blob([copy.buffer], { type: "application/pdf" });
            setProgress(100);

            if (blob.size >= file.size) {
                setResult(null);
                setStatus({
                    kind: "warn",
                    text:
                        method === "optimize"
                            ? "This PDF is already well optimized, so the result was not smaller. Your original file is unchanged. Try Shrink for image-heavy or scanned files."
                            : "The shrunk version would be larger than your original, which usually means the file is mostly text. We kept your original instead. Try Optimize, or a different preset.",
                });
            } else {
                const pct = ((file.size - blob.size) / file.size) * 100;
                setResult(blob);
                setStatus({
                    kind: "success",
                    text: `Done. Your PDF is ${pct.toFixed(1)}% smaller (${formatSize(file.size)} to ${formatSize(blob.size)}).`,
                });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "";
            const name = (err as { name?: string })?.name ?? "";
            if (msg === "CANCELLED") {
                setStatus({ kind: "info", text: "Cancelled. Nothing was changed." });
            } else if (msg.startsWith("PAGES:")) {
                setStatus({
                    kind: "warn",
                    text: `This PDF has ${msg.slice(6)} pages. Shrink supports up to ${MAX_SHRINK_PAGES} pages. Try Optimize, or split the file first.`,
                });
            } else if (name === "PasswordException" || /encrypt|password/i.test(msg)) {
                setStatus({
                    kind: "error",
                    text: "This PDF is password-protected. Remove the protection first, then try again.",
                });
            } else if (name === "InvalidPDFException" || /Invalid PDF|No PDF header/i.test(msg)) {
                setStatus({ kind: "error", text: "This file looks damaged or is not a valid PDF." });
            } else {
                console.error("PDF compression error:", err);
                setStatus({
                    kind: "error",
                    text: "Something went wrong while processing this PDF. Try the other method or a different file.",
                });
            }
            setResult(null);
        } finally {
            setBusy(false);
        }
    };

    const download = () => {
        if (!result || !file) return;
        const url = URL.createObjectURL(result);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    };

    const originalSize = file?.size ?? 0;
    const newSize = result?.size ?? 0;
    const reduction = originalSize && newSize ? ((originalSize - newSize) / originalSize) * 100 : 0;

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
    const StatusIcon = status
        ? { info: Info, success: CheckCircle2, warn: AlertCircle, error: AlertCircle }[status.kind]
        : Info;

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

            {/* ---------------- Tool ---------------- */}
            <div className={`${card} shadow-xl shadow-black/20`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">PDF Compressor</h2>
                            <p className="text-xs text-slate-400">Reduce PDF file size in your browser. Files are never uploaded.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Processed on your device
                    </div>
                </div>

                {/* Drop zone */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!busy) setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-10 ${dragging
                        ? "border-cyan-400 bg-cyan-500/10"
                        : "border-slate-700 bg-slate-950/50 hover:border-slate-600"
                        }`}
                >
                    <div className="flex flex-col items-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-cyan-300">
                            <Upload className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">
                            {dragging ? "Drop your PDF here" : "Choose or drop a PDF file"}
                        </h3>
                        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                            PDF only, up to 25 MB. Nothing leaves your device.
                        </p>
                        <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400">
                            <Upload className="h-4 w-4" />
                            Browse PDF file
                            <input
                                ref={inputRef}
                                type="file"
                                accept="application/pdf,.pdf"
                                disabled={busy}
                                onChange={(e) => acceptFile(e.target.files?.[0])}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {file && (
                    <>
                        {/* Method */}
                        <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Compression method</h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                {(
                                    [
                                        {
                                            id: "optimize" as Method,
                                            icon: <Layers className="h-5 w-5" />,
                                            title: "Optimize (keeps text)",
                                            body: "Rewrites the file more efficiently. Text stays selectable and searchable. Savings are usually small.",
                                        },
                                        {
                                            id: "shrink" as Method,
                                            icon: <ImageIcon className="h-5 w-5" />,
                                            title: "Shrink (turns pages into images)",
                                            body: "Much smaller for scans and photo-heavy files. Text can no longer be selected or searched.",
                                        },
                                    ]
                                ).map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        disabled={busy}
                                        onClick={() => {
                                            setMethod(m.id);
                                            setResult(null);
                                            setStatus(null);
                                        }}
                                        aria-pressed={method === m.id}
                                        className={`rounded-xl border-2 p-4 text-left transition ${method === m.id
                                            ? "border-cyan-500 bg-cyan-500/10"
                                            : "border-slate-800 bg-slate-900 hover:border-slate-700"
                                            }`}
                                    >
                                        <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-100">
                                            <span className="text-cyan-300">{m.icon}</span>
                                            {m.title}
                                        </div>
                                        <p className="text-xs leading-relaxed text-slate-400">{m.body}</p>
                                    </button>
                                ))}
                            </div>

                            {method === "shrink" && (
                                <div className="space-y-3 border-t border-slate-800 pt-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Image quality</div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {(Object.keys(PRESETS) as Preset[]).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                disabled={busy}
                                                onClick={() => {
                                                    setPreset(p);
                                                    setResult(null);
                                                    setStatus(null);
                                                }}
                                                aria-pressed={preset === p}
                                                className={`rounded-xl border-2 p-3.5 text-left transition ${preset === p
                                                    ? "border-cyan-500 bg-cyan-500/10"
                                                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                                                    }`}
                                            >
                                                <div className="text-sm font-bold text-slate-100">{PRESETS[p].label}</div>
                                                <div className="text-[11px] text-slate-400">{PRESETS[p].note}</div>
                                                <div className="mt-1 text-[10px] text-slate-500">{PRESETS[p].dpi}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-200">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>
                                            The result will be made of images. Links, form fields, bookmarks and digital signatures
                                            are lost, and text can no longer be selected.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {method === "optimize" && (
                                <label className="flex cursor-pointer items-start gap-3 border-t border-slate-800 pt-4">
                                    <input
                                        type="checkbox"
                                        checked={stripMeta}
                                        disabled={busy}
                                        onChange={(e) => setStripMeta(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 accent-cyan-500"
                                    />
                                    <span>
                                        <span className="block text-xs font-semibold text-slate-200">Remove document metadata</span>
                                        <span className="block text-[11px] text-slate-500">
                                            Clears title, author, subject, keywords and creator fields.
                                        </span>
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* File card */}
                        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-100">{file.name}</p>
                                        <p className="text-xs text-slate-400">
                                            Original size: <strong className="text-slate-200">{formatSize(originalSize)}</strong>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={reset}
                                        disabled={busy}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                    </button>
                                    {busy ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                cancelRef.current = true;
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-slate-700"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={run}
                                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
                                        >
                                            <Zap className="h-4 w-4" />
                                            Compress PDF
                                        </button>
                                    )}
                                </div>
                            </div>

                            {busy && (
                                <div className="mt-4">
                                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Working…
                                        </span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                                        <div
                                            className="h-full bg-cyan-400 transition-all duration-200"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Status */}
                {status && (
                    <div
                        role="status"
                        className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium ${statusStyles[status.kind]}`}
                    >
                        <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
                        <span className="leading-relaxed">{status.text}</span>
                    </div>
                )}

                {/* Result */}
                {result && file && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                        <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
                                <FileCheck2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-100">Your compressed PDF is ready</h3>
                                <p className="text-xs text-slate-400">
                                    {method === "optimize"
                                        ? "Text, links and forms are preserved."
                                        : "Pages were converted to images. Text is no longer selectable."}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4 p-5">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { l: "Original", v: formatSize(originalSize), c: "text-slate-100" },
                                    { l: "Compressed", v: formatSize(newSize), c: "text-slate-100" },
                                    { l: "Reduction", v: `${reduction.toFixed(1)}%`, c: "text-emerald-300" },
                                    { l: "Saved", v: formatSize(originalSize - newSize), c: "text-cyan-300" },
                                ].map((s) => (
                                    <div key={s.l} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
                                        <div className={`mt-0.5 text-sm font-bold ${s.c}`}>{s.v}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={download}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                            >
                                <Download className="h-4 w-4" />
                                Download compressed PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------------- About ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">About the PDF Compressor</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        Large PDFs are hard to email, slow to upload and annoying to store. Most email providers cap
                        attachments at around 20 to 25 MB, and many online forms and application portals set limits
                        far lower. This tool reduces a PDF&apos;s file size without installing anything, and, unlike many
                        online compressors, it does the work on your own device. Your document is never uploaded to a
                        server.
                    </p>
                    <p>
                        We give you two honest options instead of one magic button. <strong className="text-slate-100">Optimize</strong>{" "}
                        keeps the document intact and makes modest savings. <strong className="text-slate-100">Shrink</strong>{" "}
                        trades text selectability for much smaller files, which suits scans and photo-heavy documents.
                        If neither would make your file smaller, we say so and leave your original alone.
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
                            "Drop a PDF onto the box, or click Browse. Files up to 25 MB are accepted.",
                            "Pick Optimize to keep text selectable, or Shrink for the biggest reduction. With Shrink, choose an image quality.",
                            "Click Compress PDF. A progress bar shows each page; you can cancel at any time.",
                            "Compare the sizes, then download the result. If the file did not get smaller, your original is kept.",
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
                            "Private: files are processed in your browser and never uploaded",
                            "Two methods: lossless-style Optimize and image-based Shrink",
                            "Three image-quality presets with the resolution shown",
                            "Keeps original page sizes (many tools quietly resize pages)",
                            "Never hands you a file larger than the one you started with",
                            "Drag and drop, progress bar and cancel button",
                            "Free, with no sign-up and no watermark",
                        ].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ---------------- Which method ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Optimize vs. Shrink: Which Should You Use?</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[560px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">&nbsp;</th>
                                <th className="px-4 py-3 font-bold">Optimize</th>
                                <th className="px-4 py-3 font-bold">Shrink</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {[
                                ["How it works", "Rewrites the PDF structure more compactly", "Renders each page, saves it as a JPEG, rebuilds the PDF"],
                                ["Text selectable and searchable", "Yes", "No"],
                                ["Links, forms, bookmarks", "Kept", "Lost"],
                                ["Typical savings", "0 to 15%", "Often 50 to 90% on scans and photos"],
                                ["Best for", "Text documents, contracts, reports", "Scanned pages, photo albums, slide exports"],
                                ["Risk", "Almost none", "Fine detail is lost; can be larger on text-only files"],
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
                    Results depend entirely on what is inside your file. The figures above are typical ranges, not promises.
                </p>
            </section>

            {/* ---------------- Why PDFs are large ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">Why Are Some PDFs So Large?</h2>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        A PDF is a container. Pure text and vector graphics take very little space; a 50-page report
                        with only text can be under 200 KB. File size explodes when the container holds images. A
                        scanner usually saves each page as a high-resolution picture, so a 20-page scan can easily reach
                        20 MB or more. Embedded fonts, duplicated images, editing history and thumbnails also add weight.
                    </p>
                    <p>
                        That is why the method matters. If your PDF is mostly scanned pictures, converting pages to
                        well-compressed JPEGs removes redundancy and can shrink it dramatically. If it is mostly text,
                        there is little to remove and re-rendering it as images would make it bigger and worse. Knowing
                        what is inside your file tells you which option will help.
                    </p>
                </div>
            </section>

            {/* ---------------- Tips ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Tips for Smaller PDFs</h2>
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
                <h2 className="mb-3 text-lg font-bold text-slate-100">Your Documents Stay Private</h2>
                <p className="text-sm leading-relaxed text-slate-300">
                    PDFs often contain contracts, invoices, ID scans and medical records, which is exactly why uploading
                    them to a random website is risky. This compressor reads your file locally with the browser&apos;s
                    File API, processes it with PDF.js and pdf-lib running on your own machine, and gives the result
                    back as a download from memory. There is no upload step and no copy on our servers. You can confirm
                    this by opening your browser&apos;s network tab while compressing. For very sensitive files, you can
                    also disconnect from the internet after the page has loaded and the tool will still work.
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
                        { href: "/tools/image-compressor", t: "Image Compressor", d: "Shrink photos before you put them in a PDF." },
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