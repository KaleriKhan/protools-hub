"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    Image as ImageIcon,
    Upload,
    Download,
    Trash2,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    Loader2,
    ShieldCheck,
    Zap,
    HelpCircle,
    Lightbulb,
    ArrowRight,
    Lock,
    Link2,
    Unlink2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types and constants                                                */
/* ------------------------------------------------------------------ */

type Format = "jpeg" | "webp" | "png" | "pdf";
type SizeMode = "quality" | "target";

interface Source {
    file: File;
    url: string;
    width: number;
    height: number;
}

interface Output {
    blob: Blob;
    url: string | null; // preview url (not for pdf)
    width: number;
    height: number;
    quality: number | null;
    format: Format;
    notes: string[];
}

interface Status {
    kind: "info" | "success" | "warn" | "error";
    text: string;
}

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_SIDE = 10000;
const MAX_PIXELS = 50_000_000;

const FORMATS: { id: Format; label: string; mime: string; ext: string; note: string }[] = [
    { id: "jpeg", label: "JPEG", mime: "image/jpeg", ext: "jpg", note: "Best for photos" },
    { id: "webp", label: "WebP", mime: "image/webp", ext: "webp", note: "Smaller than JPEG" },
    { id: "png", label: "PNG", mime: "image/png", ext: "png", note: "Lossless, keeps transparency" },
    { id: "pdf", label: "PDF", mime: "application/pdf", ext: "pdf", note: "One image on an A4 page" },
];

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const loadBitmap = async (url: string): Promise<ImageBitmap | HTMLImageElement> => {
    const res = await fetch(url);
    const blob = await res.blob();
    if (typeof createImageBitmap === "function") {
        try {
            // applies the photo's EXIF rotation so phone pictures are not sideways
            return await createImageBitmap(blob, { imageOrientation: "from-image" });
        } catch {
            /* fall back to <img> */
        }
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("LOAD"));
        img.src = url;
    });
};

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const FAQS: { q: string; a: string }[] = [
    {
        q: "Are my images uploaded anywhere?",
        a: "No. Your image is opened and re-encoded by your browser using the HTML Canvas API. It never leaves your device and nothing is stored. You can confirm this in your browser's network tab, or use the tool with your internet connection switched off once the page has loaded.",
    },
    {
        q: "Which format should I choose?",
        a: "Use JPEG for photographs, WebP when you want the smallest file and your audience uses modern browsers, and PNG for screenshots, logos and graphics with sharp edges or transparency. Choose PDF when you need to attach a picture as a document. Converting a photo to PNG often makes it larger, not smaller, because PNG is lossless.",
    },
    {
        q: "What does the quality slider do?",
        a: "For JPEG and WebP it controls how aggressively the picture is compressed. Lower values give smaller files with visible artefacts such as blockiness around edges. For most photos, 70 to 85% is hard to tell from the original. PNG ignores the slider because it is lossless; shrink a PNG by reducing its dimensions instead.",
    },
    {
        q: "How does the target file size option work?",
        a: "You enter a size such as 200 KB and the tool tries different quality levels until the result fits. If the lowest acceptable quality is still too large, it gradually reduces the dimensions as well. Hitting an exact size is not guaranteed for every image, and the result tells you what was achieved.",
    },
    {
        q: "Will compression remove metadata such as location?",
        a: "Yes. Because the image is redrawn on a canvas and saved again, EXIF information such as GPS location, camera model and timestamps is not copied into the result. This is a useful privacy benefit when you share photos online. The picture's rotation is applied before saving so it still displays upright.",
    },
    {
        q: "Why did my file get bigger?",
        a: "This usually happens when the original was already well compressed and you choose a higher quality, or when you convert a JPEG to PNG. We warn you when the result is larger than the original. Lower the quality, choose JPEG or WebP, or reduce the dimensions.",
    },
    {
        q: "Does it support transparent images?",
        a: "PNG and WebP keep transparency. JPEG and PDF cannot store it, so transparent areas are filled with white. If a WebP file comes out as PNG, your browser does not support WebP encoding.",
    },
    {
        q: "What are the limits?",
        a: "Images up to 20 MB and 10,000 pixels on the longest side are accepted. Very large pictures may take a few seconds and use a lot of memory on older phones. For huge images, reduce the dimensions first.",
    },
];

const FORMAT_ROWS: [string, string, string, string][] = [
    ["JPEG", "Photos, social media, email", "Lossy", "No"],
    ["WebP", "Websites, apps, smaller photos", "Lossy (or lossless)", "Yes"],
    ["PNG", "Screenshots, logos, diagrams", "Lossless", "Yes"],
    ["PDF", "Attaching a picture as a document", "Uses JPEG inside", "No"],
];

const QUALITY_ROWS: [string, string, string][] = [
    ["90 to 100%", "Visually identical", "Large files; only for printing or archiving"],
    ["70 to 85%", "Very hard to distinguish", "Best everyday range for photos"],
    ["50 to 65%", "Slight softness on close inspection", "Good for web thumbnails and email"],
    ["Below 50%", "Visible blocks and colour banding", "Only when size matters more than looks"],
];

const TIPS: string[] = [
    "Resize first. Cutting a 4000 px photo to 1600 px saves far more than lowering quality, and most screens cannot show more.",
    "Use the target size option for upload forms that demand a limit such as 100 KB or 500 KB.",
    "Keep your original. Compression is lossy, so you cannot recover detail from the compressed copy.",
    "Use PNG only when you need transparency or crisp text. For photos, JPEG or WebP is much smaller.",
    "Compare the before and after at 100% zoom on a detailed area such as hair, text or foliage.",
    "For websites, serve WebP with a JPEG fallback to get the best size without excluding older browsers.",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";
const input =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-slate-100 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20";

export default function ImageCompressor() {
    const [src, setSrc] = useState<Source | null>(null);
    const [out, setOut] = useState<Output | null>(null);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<Status | null>(null);
    const [dragging, setDragging] = useState(false);

    const [format, setFormat] = useState<Format>("jpeg");
    const [quality, setQuality] = useState(75);
    const [sizeMode, setSizeMode] = useState<SizeMode>("quality");
    const [targetKb, setTargetKb] = useState("200");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [lock, setLock] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const srcUrlRef = useRef<string | null>(null);
    const outUrlRef = useRef<string | null>(null);

    useEffect(
        () => () => {
            if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
            if (outUrlRef.current) URL.revokeObjectURL(outUrlRef.current);
        },
        []
    );

    const clearOutput = useCallback(() => {
        if (outUrlRef.current) {
            URL.revokeObjectURL(outUrlRef.current);
            outUrlRef.current = null;
        }
        setOut(null);
    }, []);

    const reset = useCallback(() => {
        if (srcUrlRef.current) {
            URL.revokeObjectURL(srcUrlRef.current);
            srcUrlRef.current = null;
        }
        clearOutput();
        setSrc(null);
        setStatus(null);
        setWidth("");
        setHeight("");
        if (inputRef.current) inputRef.current.value = "";
    }, [clearOutput]);

    const acceptFile = useCallback(
        (file: File | undefined | null) => {
            if (!file) return;
            clearOutput();
            setStatus(null);

            if (!file.type.startsWith("image/")) {
                setStatus({ kind: "error", text: "Please choose an image file (JPG, PNG, WebP, GIF or BMP)." });
                return;
            }
            if (file.size > MAX_FILE_BYTES) {
                setStatus({ kind: "warn", text: `This image is ${formatSize(file.size)}. Please choose one smaller than 20 MB.` });
                return;
            }

            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
                srcUrlRef.current = url;
                setSrc({ file, url, width: img.naturalWidth, height: img.naturalHeight });
                setWidth(String(img.naturalWidth));
                setHeight(String(img.naturalHeight));
                // photos default to JPEG, everything else keeps its own type when possible
                setFormat(file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpeg");
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                setStatus({ kind: "error", text: "This image could not be read. It may be damaged or in an unsupported format." });
            };
            img.src = url;
        },
        [clearOutput]
    );

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (!busy) acceptFile(e.dataTransfer.files?.[0]);
    };

    const setW = (v: string) => {
        setWidth(v);
        const n = Number(v);
        if (lock && src && n > 0) setHeight(String(Math.round((n / src.width) * src.height)));
    };
    const setH = (v: string) => {
        setHeight(v);
        const n = Number(v);
        if (lock && src && n > 0) setWidth(String(Math.round((n / src.height) * src.width)));
    };
    const applyScale = (pct: number) => {
        if (!src) return;
        setWidth(String(Math.max(1, Math.round((src.width * pct) / 100))));
        setHeight(String(Math.max(1, Math.round((src.height * pct) / 100))));
    };

    /* ------------------------------ Compress ----------------------------- */

    const run = async () => {
        if (!src || busy) return;

        const w = Math.round(Number(width));
        const h = Math.round(Number(height));
        if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
            setStatus({ kind: "error", text: "Please enter a valid width and height." });
            return;
        }
        if (w > MAX_SIDE || h > MAX_SIDE || w * h > MAX_PIXELS) {
            setStatus({
                kind: "error",
                text: "That size is too large for the browser to process safely. Keep each side under 10,000 px and the total under 50 megapixels.",
            });
            return;
        }
        const target = Number(targetKb);
        if (sizeMode === "target" && format !== "png" && (!Number.isFinite(target) || target < 5)) {
            setStatus({ kind: "error", text: "Enter a target size of at least 5 KB." });
            return;
        }

        setBusy(true);
        setStatus({ kind: "info", text: "Processing your image…" });
        clearOutput();

        try {
            const bmp = await loadBitmap(src.url);

            const render = (cw: number, ch: number) => {
                const canvas = document.createElement("canvas");
                canvas.width = cw;
                canvas.height = ch;
                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("CANVAS");
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                // JPEG and PDF cannot store transparency, so paint white behind the picture
                if (format === "jpeg" || format === "pdf") {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, cw, ch);
                }
                ctx.drawImage(bmp, 0, 0, cw, ch);
                return canvas;
            };

            const notes: string[] = [];
            const lossy = format === "jpeg" || format === "webp" || format === "pdf";
            const mime = format === "pdf" ? "image/jpeg" : FORMATS.find((f) => f.id === format)!.mime;

            let cw = w;
            let ch = h;
            let canvas = render(cw, ch);
            let q = quality / 100;
            let blob: Blob | null;

            if (sizeMode === "target" && lossy) {
                const limit = target * 1024;
                // binary search the highest quality that fits
                let lo = 0.1;
                let hi = 0.95;
                let best: Blob | null = null;
                let bestQ = lo;
                for (let step = 0; step < 4; step++) {
                    // after each failed round of quality, shrink the picture a little
                    for (let i = 0; i < 7; i++) {
                        const mid = (lo + hi) / 2;
                        const b = await toBlob(canvas, mime, mid);
                        if (!b) throw new Error("ENCODE");
                        if (b.size <= limit) {
                            best = b;
                            bestQ = mid;
                            lo = mid;
                        } else hi = mid;
                    }
                    if (best) break;
                    cw = Math.max(1, Math.round(cw * 0.8));
                    ch = Math.max(1, Math.round(ch * 0.8));
                    canvas = render(cw, ch);
                    lo = 0.1;
                    hi = 0.95;
                }
                if (!best) {
                    best = await toBlob(canvas, mime, 0.1);
                    bestQ = 0.1;
                    notes.push("Could not reach the target size even at the lowest quality and a reduced size.");
                } else if (cw !== w) {
                    notes.push(`To reach the target, the image was also reduced to ${cw} × ${ch} px.`);
                }
                blob = best;
                q = bestQ;
            } else {
                blob = await toBlob(canvas, mime, format === "png" ? undefined : q);
            }

            if (!blob) throw new Error("ENCODE");

            if (format === "webp" && blob.type !== "image/webp") {
                notes.push("Your browser cannot save WebP, so a PNG was created instead. Try JPEG or another browser.");
            }

            let finalBlob = blob;
            let finalFormat = format;
            if (format === "pdf") {
                const { jsPDF } = await import("jspdf");
                const dataUrl: string = await new Promise((resolve, reject) => {
                    const r = new FileReader();
                    r.onload = () => resolve(String(r.result));
                    r.onerror = () => reject(new Error("READ"));
                    r.readAsDataURL(blob as Blob);
                });
                const pdf = new jsPDF({ orientation: cw >= ch ? "landscape" : "portrait", unit: "mm", format: "a4", compress: true });
                const pw = pdf.internal.pageSize.getWidth();
                const ph = pdf.internal.pageSize.getHeight();
                const m = 10;
                const maxW = pw - m * 2;
                const maxH = ph - m * 2;
                const ratio = cw / ch;
                let dw = maxW;
                let dh = dw / ratio;
                if (dh > maxH) {
                    dh = maxH;
                    dw = dh * ratio;
                }
                pdf.addImage(dataUrl, "JPEG", (pw - dw) / 2, (ph - dh) / 2, dw, dh, undefined, "FAST");
                finalBlob = new Blob([pdf.output("arraybuffer")], { type: "application/pdf" });
            } else if (format === "webp" && blob.type !== "image/webp") {
                finalFormat = "png";
            }

            if ("close" in bmp) bmp.close();

            const url = finalFormat === "pdf" ? null : URL.createObjectURL(finalBlob);
            outUrlRef.current = url;
            setOut({ blob: finalBlob, url, width: cw, height: ch, quality: lossy ? q : null, format: finalFormat, notes });

            if (finalBlob.size >= src.file.size) {
                setStatus({
                    kind: "warn",
                    text: `The result (${formatSize(finalBlob.size)}) is not smaller than your original (${formatSize(src.file.size)}). Try a lower quality, JPEG or WebP, or smaller dimensions.`,
                });
            } else {
                const pct = ((src.file.size - finalBlob.size) / src.file.size) * 100;
                setStatus({ kind: "success", text: `Done. Your image is ${pct.toFixed(1)}% smaller.` });
            }
        } catch (err) {
            console.error("Image compression error:", err);
            const msg = err instanceof Error ? err.message : "";
            setStatus({
                kind: "error",
                text:
                    msg === "LOAD"
                        ? "This image could not be decoded. Try a different file."
                        : "Something went wrong while processing the image. Try smaller dimensions or another format.",
            });
        } finally {
            setBusy(false);
        }
    };

    const download = () => {
        if (!out || !src) return;
        const ext = FORMATS.find((f) => f.id === out.format)!.ext;
        const base = src.file.name.replace(/\.[^.]+$/, "");
        const url = URL.createObjectURL(out.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${base}-compressed.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    };

    /* ------------------------------ Render -------------------------------- */

    const savedPct = src && out ? Math.max(0, ((src.file.size - out.blob.size) / src.file.size) * 100) : 0;
    const isLossy = format !== "png";

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
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            <ImageIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Image Compressor &amp; Converter</h2>
                            <p className="text-xs text-slate-400">Reduce image file size, resize and convert to JPEG, WebP, PNG or PDF.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <Lock className="h-3.5 w-3.5" />
                        Images never leave your device
                    </div>
                </div>

                {!src ? (
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        className={`rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-12 ${dragging ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 bg-slate-950/50 hover:border-slate-600"
                            }`}
                    >
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-cyan-300">
                                <Upload className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-100">{dragging ? "Drop your image here" : "Choose or drop an image"}</h3>
                            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                                JPG, PNG, WebP, GIF or BMP, up to 20 MB. Processed entirely in your browser.
                            </p>
                            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400">
                                <Upload className="h-4 w-4" />
                                Choose image
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => acceptFile(e.target.files?.[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* File bar */}
                        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <img src={src.url} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-800 object-cover" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-100">{src.file.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {formatSize(src.file.size)} · {src.width} × {src.height} px
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={reset}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50 sm:self-auto"
                            >
                                <Trash2 className="h-4 w-4" />
                                Choose another
                            </button>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Format + quality */}
                            <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                                <div>
                                    <div className={`${fieldLabel} mb-2`}>Output format</div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {FORMATS.map((f) => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                aria-pressed={format === f.id}
                                                onClick={() => {
                                                    setFormat(f.id);
                                                    clearOutput();
                                                    setStatus(null);
                                                }}
                                                className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition ${format === f.id
                                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                                                    : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
                                                    }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-500">{FORMATS.find((f) => f.id === format)?.note}</p>
                                </div>

                                {isLossy ? (
                                    <div className="space-y-3">
                                        <div role="tablist" className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
                                            {(
                                                [
                                                    ["quality", "Set quality"],
                                                    ["target", "Target file size"],
                                                ] as const
                                            ).map(([id, label]) => (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={sizeMode === id}
                                                    onClick={() => setSizeMode(id)}
                                                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${sizeMode === id ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        {sizeMode === "quality" ? (
                                            <div>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <label htmlFor="ic-quality" className={fieldLabel}>
                                                        Quality
                                                    </label>
                                                    <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-extrabold text-cyan-300">
                                                        {quality}%
                                                    </span>
                                                </div>
                                                <input
                                                    id="ic-quality"
                                                    type="range"
                                                    min={10}
                                                    max={100}
                                                    step={5}
                                                    value={quality}
                                                    onChange={(e) => setQuality(Number(e.target.value))}
                                                    className="w-full cursor-pointer accent-cyan-500"
                                                />
                                                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                                                    <span>Smaller file</span>
                                                    <span>70 to 85% is a good range</span>
                                                    <span>Better quality</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label htmlFor="ic-target" className={`${fieldLabel} mb-1 block`}>
                                                    Maximum size (KB)
                                                </label>
                                                <input
                                                    id="ic-target"
                                                    type="number"
                                                    min={5}
                                                    value={targetKb}
                                                    onChange={(e) => setTargetKb(e.target.value)}
                                                    className={input}
                                                />
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {[50, 100, 200, 500, 1024].map((k) => (
                                                        <button
                                                            key={k}
                                                            type="button"
                                                            onClick={() => setTargetKb(String(k))}
                                                            className="rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-300 transition hover:bg-slate-800"
                                                        >
                                                            {k >= 1024 ? "1 MB" : `${k} KB`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-300">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                                        <span>
                                            PNG is lossless, so there is no quality setting. To make a PNG smaller, reduce its dimensions, or switch to
                                            WebP or JPEG.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Dimensions */}
                            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                                <div className="flex items-center justify-between">
                                    <div className={fieldLabel}>Dimensions (px)</div>
                                    <button
                                        type="button"
                                        onClick={() => setLock((l) => !l)}
                                        aria-pressed={lock}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-300 transition hover:bg-slate-800"
                                    >
                                        {lock ? <Link2 className="h-3.5 w-3.5 text-cyan-300" /> : <Unlink2 className="h-3.5 w-3.5" />}
                                        {lock ? "Ratio locked" : "Ratio free"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="ic-w" className="mb-1 block text-[11px] font-bold text-slate-400">
                                            Width
                                        </label>
                                        <input id="ic-w" type="number" min={1} max={MAX_SIDE} value={width} onChange={(e) => setW(e.target.value)} className={input} />
                                    </div>
                                    <div>
                                        <label htmlFor="ic-h" className="mb-1 block text-[11px] font-bold text-slate-400">
                                            Height
                                        </label>
                                        <input id="ic-h" type="number" min={1} max={MAX_SIDE} value={height} onChange={(e) => setH(e.target.value)} className={input} />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1.5 text-[11px] font-bold text-slate-400">Scale to</div>
                                    <div className="flex flex-wrap gap-2">
                                        {[100, 75, 50, 25].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => applyScale(p)}
                                                className="rounded-lg border border-slate-700 px-3 py-1 text-[11px] font-bold text-slate-300 transition hover:bg-slate-800"
                                            >
                                                {p}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {(Number(width) > src.width || Number(height) > src.height) && (
                                    <p className="flex items-start gap-1.5 text-[11px] text-amber-300">
                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        Enlarging a picture does not add detail and increases file size. Use our Image Upscaler for better enlargement.
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={run}
                            disabled={busy}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                        >
                            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                            {busy ? "Processing…" : `Compress to ${FORMATS.find((f) => f.id === format)!.label}`}
                        </button>
                    </div>
                )}

                {status && (
                    <div role="status" className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium ${statusStyles[status.kind]}`}>
                        <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
                        <span className="leading-relaxed">{status.text}</span>
                    </div>
                )}

                {/* Result */}
                {out && src && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                        <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
                            <h3 className="text-sm font-bold text-slate-100">Your image is ready</h3>
                            <p className="text-xs text-slate-400">
                                Saved as {FORMATS.find((f) => f.id === out.format)!.label}
                                {out.quality !== null ? ` at about ${Math.round(out.quality * 100)}% quality` : ""} · {out.width} × {out.height} px
                            </p>
                        </div>
                        <div className="space-y-5 p-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <figure className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                                    <figcaption className="flex justify-between border-b border-slate-800 px-4 py-2 text-xs font-bold text-slate-300">
                                        <span>Original</span>
                                        <span className="text-slate-400">{formatSize(src.file.size)}</span>
                                    </figcaption>
                                    <div className="flex min-h-48 items-center justify-center bg-[repeating-conic-gradient(#0f172a_0%_25%,#111c33_0%_50%)] bg-[length:16px_16px] p-3">
                                        <img src={src.url} alt="Original" className="max-h-64 max-w-full object-contain" />
                                    </div>
                                </figure>
                                <figure className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950">
                                    <figcaption className="flex justify-between border-b border-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300">
                                        <span>Result</span>
                                        <span>{formatSize(out.blob.size)}</span>
                                    </figcaption>
                                    <div className="flex min-h-48 items-center justify-center bg-[repeating-conic-gradient(#0f172a_0%_25%,#111c33_0%_50%)] bg-[length:16px_16px] p-3">
                                        {out.url ? (
                                            <img src={out.url} alt="Compressed result" className="max-h-64 max-w-full object-contain" />
                                        ) : (
                                            <div className="text-center text-xs font-semibold text-slate-300">PDF document ready</div>
                                        )}
                                    </div>
                                </figure>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { l: "Original", v: formatSize(src.file.size), c: "text-slate-100" },
                                    { l: "New size", v: formatSize(out.blob.size), c: "text-slate-100" },
                                    { l: "Saved", v: formatSize(Math.max(0, src.file.size - out.blob.size)), c: "text-cyan-300" },
                                    { l: "Reduction", v: `${savedPct.toFixed(1)}%`, c: "text-emerald-300" },
                                ].map((s) => (
                                    <div key={s.l} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
                                        <div className={`mt-0.5 text-sm font-bold ${s.c}`}>{s.v}</div>
                                    </div>
                                ))}
                            </div>

                            {out.notes.map((n) => (
                                <p key={n} className="flex items-start gap-2 text-xs text-amber-300">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    {n}
                                </p>
                            ))}

                            <button
                                type="button"
                                onClick={download}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                            >
                                <Download className="h-4 w-4" />
                                Download {FORMATS.find((f) => f.id === out.format)!.label}
                            </button>
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
                    <h2 className="text-lg font-bold text-slate-100">About the Image Compressor</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        Large images slow down websites, fill up email attachments and get rejected by upload forms with strict size limits.
                        This tool shrinks them in your browser: choose a format, pick a quality or a target size such as 200 KB, optionally
                        resize, and download the result. You see a before and after comparison and the exact bytes saved, so there is no
                        guessing.
                    </p>
                    <p>
                        Because processing happens locally with the browser&apos;s Canvas API, your pictures are never uploaded. As a side
                        effect, saving the image again removes hidden metadata such as GPS location and camera details, which is handy before
                        sharing photos online. We are also upfront about the limits: compression for JPEG and WebP is lossy, PNG has no
                        quality setting, and we warn you whenever the result is not actually smaller.
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
                            "Drop an image onto the box or click Choose image (up to 20 MB).",
                            "Pick an output format. JPEG or WebP gives the biggest savings for photos.",
                            "Set a quality, or switch to Target file size and enter a limit such as 200 KB. Optionally reduce the dimensions.",
                            "Click Compress, compare the result with the original, then download it.",
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
                            "Private: images are processed on your device and never uploaded",
                            "JPEG, WebP, PNG and PDF output",
                            "Target file size mode finds the best quality that fits your limit",
                            "Resize with a locked aspect ratio and quick scale buttons",
                            "Side by side comparison and exact savings",
                            "Strips GPS and camera metadata, and keeps photos upright",
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

            {/* ---------------- Format guide ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Which Image Format Should You Use?</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[520px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">Format</th>
                                <th className="px-4 py-3 font-bold">Best for</th>
                                <th className="px-4 py-3 font-bold">Compression</th>
                                <th className="px-4 py-3 font-bold">Transparency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {FORMAT_ROWS.map((r) => (
                                <tr key={r[0]}>
                                    <td className="px-4 py-3 font-semibold text-slate-200">{r[0]}</td>
                                    <td className="px-4 py-3">{r[1]}</td>
                                    <td className="px-4 py-3">{r[2]}</td>
                                    <td className="px-4 py-3">{r[3]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---------------- Quality guide ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">Choosing a Quality Level</h2>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                    JPEG and WebP discard detail the eye is least likely to notice. The first few percent of quality you give up save a lot
                    of space; after that you start to see the damage. Use this as a starting point, then check the comparison.
                </p>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[520px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">Quality</th>
                                <th className="px-4 py-3 font-bold">What you will see</th>
                                <th className="px-4 py-3 font-bold">Use it for</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {QUALITY_ROWS.map((r) => (
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
                    <h2 className="text-lg font-bold text-slate-100">Tips for Smaller Images</h2>
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
                        { href: "/tools/image-resizer", t: "Image Resizer", d: "Set exact dimensions, with crop and presets." },
                        { href: "/tools/image-upscaler", t: "Image Upscaler", d: "Enlarge images with sharpening." },
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