"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
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
    Lock,
    Unlock,
    Lightbulb,
    ArrowRight,
    Image as ImageIcon,
    Maximize2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Pure helpers (no DOM)                                              */
/* ------------------------------------------------------------------ */
// HELPERS START

type Mode = "pixels" | "percent" | "preset";
type Fit = "stretch" | "contain" | "cover";

const MAX_SIDE = 8192;
const MAX_OUT_PIXELS = 24_000_000;
const MAX_SRC_PIXELS = 64_000_000;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

interface Preset {
    id: string;
    group: string;
    label: string;
    w: number;
    h: number;
}

const PRESETS: Preset[] = [
    { id: "ig-post", group: "Social media", label: "Instagram post", w: 1080, h: 1080 },
    { id: "ig-story", group: "Social media", label: "Instagram / TikTok story", w: 1080, h: 1920 },
    { id: "fb-cover", group: "Social media", label: "Facebook cover", w: 820, h: 312 },
    { id: "yt-thumb", group: "Social media", label: "YouTube thumbnail", w: 1280, h: 720 },
    { id: "x-post", group: "Social media", label: "X (Twitter) post image", w: 1600, h: 900 },
    { id: "li-banner", group: "Social media", label: "LinkedIn banner", w: 1584, h: 396 },
    { id: "fav-32", group: "Icons", label: "Favicon 32", w: 32, h: 32 },
    { id: "fav-180", group: "Icons", label: "Apple touch icon 180", w: 180, h: 180 },
    { id: "fav-512", group: "Icons", label: "App / PWA icon 512", w: 512, h: 512 },
    { id: "hd", group: "Screen", label: "HD 720p", w: 1280, h: 720 },
    { id: "fhd", group: "Screen", label: "Full HD 1080p", w: 1920, h: 1080 },
    { id: "uhd", group: "Screen", label: "4K UHD", w: 3840, h: 2160 },
];

interface Rects {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    dx: number;
    dy: number;
    dw: number;
    dh: number;
}

// Which part of the source goes where on the output canvas.
const fitRects = (srcW: number, srcH: number, outW: number, outH: number, fit: Fit): Rects => {
    if (fit === "stretch") {
        return { sx: 0, sy: 0, sw: srcW, sh: srcH, dx: 0, dy: 0, dw: outW, dh: outH };
    }
    if (fit === "contain") {
        const scale = Math.min(outW / srcW, outH / srcH);
        const dw = Math.min(outW, Math.max(1, Math.round(srcW * scale)));
        const dh = Math.min(outH, Math.max(1, Math.round(srcH * scale)));
        return {
            sx: 0,
            sy: 0,
            sw: srcW,
            sh: srcH,
            dx: Math.round((outW - dw) / 2),
            dy: Math.round((outH - dh) / 2),
            dw,
            dh,
        };
    }
    // cover: fill the output and crop the overflow, centred
    const scale = Math.max(outW / srcW, outH / srcH);
    const sw = Math.min(srcW, outW / scale);
    const sh = Math.min(srcH, outH / scale);
    return {
        sx: (srcW - sw) / 2,
        sy: (srcH - sh) / 2,
        sw,
        sh,
        dx: 0,
        dy: 0,
        dw: outW,
        dh: outH,
    };
};

// Sizes of the intermediate canvases for a high-quality downscale.
// Halving repeatedly avoids the jagged result of one big drawImage.
const planSteps = (sw: number, sh: number, dw: number, dh: number): { w: number; h: number }[] => {
    const steps: { w: number; h: number }[] = [];
    let cw = sw;
    let ch = sh;
    let guard = 0;
    while (guard++ < 16 && cw / 2 >= dw && ch / 2 >= dh) {
        cw = Math.max(dw, Math.round(cw / 2));
        ch = Math.max(dh, Math.round(ch / 2));
        steps.push({ w: cw, h: ch });
    }
    const last = steps[steps.length - 1];
    if (!last || last.w !== dw || last.h !== dh) steps.push({ w: dw, h: dh });
    return steps;
};

const toInt = (s: string): number => {
    if (s.trim() === "") return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? Math.round(n) : NaN;
};

interface TargetInputs {
    wStr: string;
    hStr: string;
    percentStr: string;
    presetId: string;
}

const computeTarget = (
    mode: Mode,
    srcW: number,
    srcH: number,
    inp: TargetInputs
): { w: number; h: number; error?: string } => {
    let w = NaN;
    let h = NaN;
    if (mode === "pixels") {
        w = toInt(inp.wStr);
        h = toInt(inp.hStr);
        if (!(w >= 1) || !(h >= 1)) return { w: 0, h: 0, error: "Enter a width and a height of at least 1 pixel." };
    } else if (mode === "percent") {
        const p = Number(inp.percentStr);
        if (!Number.isFinite(p) || p < 1) return { w: 0, h: 0, error: "Enter a percentage of at least 1." };
        w = Math.max(1, Math.round((srcW * p) / 100));
        h = Math.max(1, Math.round((srcH * p) / 100));
    } else {
        const p = PRESETS.find((x) => x.id === inp.presetId);
        if (!p) return { w: 0, h: 0, error: "Choose a preset size." };
        w = p.w;
        h = p.h;
    }
    if (w > MAX_SIDE || h > MAX_SIDE) {
        return { w, h, error: `The longest side is limited to ${MAX_SIDE.toLocaleString()} pixels.` };
    }
    if (w * h > MAX_OUT_PIXELS) {
        return { w, h, error: "Output is limited to 24 megapixels (for example 6000 × 4000). Choose smaller dimensions." };
    }
    return { w, h };
};

// Starting size for a freshly loaded image: the original, reduced only if it exceeds the limits.
const defaultDims = (srcW: number, srcH: number): { w: number; h: number } => {
    const scale = Math.min(1, MAX_SIDE / Math.max(srcW, srcH), Math.sqrt(MAX_OUT_PIXELS / (srcW * srcH)));
    if (scale >= 1) return { w: srcW, h: srcH };
    return { w: Math.max(1, Math.floor(srcW * scale)), h: Math.max(1, Math.floor(srcH * scale)) };
};

// Linked dimension for the aspect-ratio lock (never below 1 px).
const linked = (value: number, aspectNumerator: number, aspectDenominator: number): number =>
    Math.max(1, Math.round((value * aspectNumerator) / aspectDenominator));

// HELPERS END

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

interface Status {
    kind: "info" | "success" | "warn" | "error";
    text: string;
}

type Source = {
    el: ImageBitmap | HTMLImageElement;
    w: number;
    h: number;
    url: string;
    name: string;
    size: number;
    type: string;
};

interface Result {
    blob: Blob;
    url: string;
    w: number;
    h: number;
    ext: string;
}

const FAQS: { q: string; a: string }[] = [
    {
        q: "Are my images uploaded anywhere?",
        a: "No. The image is decoded and resized by your own browser using the HTML5 canvas. It is never sent to ProTools Hub or to any other server, and nothing is stored. You can check this in your browser's network tab while you resize.",
    },
    {
        q: "Does resizing reduce image quality?",
        a: "Making an image smaller discards pixels, so some fine detail is always lost, although a careful downscale like ours looks clean at the new size. Making an image larger cannot create detail that was never captured: the extra pixels are estimated from their neighbours, so enlarged photos look soft. Resize down whenever you can and avoid large enlargements.",
    },
    {
        q: "Which output format should I choose?",
        a: "Use JPEG for photographs where small files matter, PNG for screenshots, logos, text and anything needing sharp edges or transparency, and WebP when you want the smallest files and your audience uses modern browsers. WebP and JPEG have a quality slider; PNG is lossless and has none.",
    },
    {
        q: "What is the difference between pixels and DPI?",
        a: "Pixels are the real dimensions of an image. DPI (dots per inch) only describes how large those pixels should be when printed, so it does not change how an image looks on screen or how large the file is. For print, divide the pixel size by the DPI you need: a 6 × 4 inch photo at 300 DPI needs 1800 × 1200 pixels.",
    },
    {
        q: "What do Stretch, Contain and Cover mean?",
        a: "When the new width and height have a different shape from the original, you must choose what happens. Stretch forces the image into the new shape and distorts it. Contain fits the whole picture inside and fills the leftover space with a background colour. Cover fills the whole area and crops whatever overflows, keeping the centre. Cover is usually best for thumbnails and banners.",
    },
    {
        q: "Why did my resized file get bigger?",
        a: "File size depends on the format and quality as well as the dimensions. Converting a JPEG to PNG, enlarging an image, or exporting at a very high quality can all increase the file size even when pixels were removed. Use JPEG or WebP at 70 to 85% quality, or run the result through our Image Compressor.",
    },
    {
        q: "What happens to transparent backgrounds?",
        a: "PNG and WebP keep transparency. JPEG cannot store it, so transparent areas are filled with the background colour you choose, white by default, instead of turning black.",
    },
    {
        q: "What are the size limits, and which files can I use?",
        a: "You can use any image your browser can open, normally JPG, PNG, WebP, GIF and BMP, up to 20 MB. Output is limited to 8192 pixels on the longest side and 24 megapixels in total so your browser does not run out of memory. Animated GIFs are resized as a single still frame, and formats your browser cannot open, such as HEIC on most desktops, must be converted first.",
    },
];

const MISTAKES: { title: string; body: string }[] = [
    {
        title: "Enlarging small images",
        body: "A 300 px thumbnail stretched to 1500 px will look blurry no matter what tool you use. Start from the largest original you have.",
    },
    {
        title: "Distorting the aspect ratio",
        body: "Typing a width and height with a different shape and choosing Stretch squashes faces and circles. Keep the lock on, or use Cover or Contain.",
    },
    {
        title: "Resizing a JPEG again and again",
        body: "Every JPEG save loses a little quality. Keep an untouched original and always resize from it, not from a previous result.",
    },
    {
        title: "Using PNG for photos",
        body: "A photo saved as PNG can be five to ten times larger than the same picture as JPEG or WebP, with no visible benefit.",
    },
    {
        title: "Confusing DPI with size",
        body: "Changing the DPI number does not make a picture sharper on a website. Websites care about pixel dimensions and file size only.",
    },
    {
        title: "Ignoring display density",
        body: "Phones and modern laptops show images at two or three times their CSS size. For an image displayed 400 px wide, export 800 px for sharp results on high-density screens.",
    },
];

const FORMATS: [string, string, string, string][] = [
    ["JPEG", "Photos, large pictures", "Small files, universal support", "No transparency; quality drops on each re-save"],
    ["PNG", "Logos, screenshots, text, icons", "Lossless, sharp edges, transparency", "Large files for photographs"],
    ["WebP", "Almost anything on the web", "Smaller than JPEG and PNG, transparency", "Not accepted by a few older apps and print services"],
];

const TIPS: string[] = [
    "Keep the aspect ratio lock on unless you really want to change the shape.",
    "Downscale in one go from the original instead of in several small steps.",
    "For thumbnails and banners, use a preset with Cover so nothing is distorted.",
    "Choose WebP at about 80% for web pages. It is usually the best balance of size and quality.",
    "Check the output size shown after resizing and compress further if the file is still heavy.",
    "For retina displays, export at two times the size the image will be shown.",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";
const inputCls =
    "w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm font-semibold text-slate-200 placeholder:font-normal placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30";

const FORMAT_OPTIONS: { value: string; label: string }[] = [
    { value: "image/jpeg", label: "JPEG" },
    { value: "image/png", label: "PNG" },
    { value: "image/webp", label: "WebP" },
];

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const loadImageElement = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("DECODE"));
        img.src = url;
    });

export default function ImageResizer() {
    const [src, setSrc] = useState<Source | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<Status | null>(null);
    const [dragging, setDragging] = useState(false);

    const [mode, setMode] = useState<Mode>("pixels");
    const [wStr, setWStr] = useState("");
    const [hStr, setHStr] = useState("");
    const [lock, setLock] = useState(true);
    const [percentStr, setPercentStr] = useState("50");
    const [presetId, setPresetId] = useState("ig-post");
    const [fit, setFit] = useState<Fit>("cover");
    const [bg, setBg] = useState("#ffffff");
    const [bgTransparent, setBgTransparent] = useState(false);
    const [format, setFormat] = useState("image/jpeg");
    const [quality, setQuality] = useState(90);

    const inputRef = useRef<HTMLInputElement>(null);
    const srcRef = useRef<Source | null>(null);
    const resultUrlRef = useRef<string | null>(null);

    const releaseSource = () => {
        const s = srcRef.current;
        if (s) {
            URL.revokeObjectURL(s.url);
            if ("close" in s.el && typeof s.el.close === "function") s.el.close();
        }
        srcRef.current = null;
    };

    const releaseResult = () => {
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        resultUrlRef.current = null;
    };

    // free everything when the page is left
    useEffect(() => {
        return () => {
            releaseSource();
            releaseResult();
        };
    }, []);

    const reset = useCallback(() => {
        releaseSource();
        releaseResult();
        setSrc(null);
        setResult(null);
        setStatus(null);
        if (inputRef.current) inputRef.current.value = "";
    }, []);

    const acceptFile = useCallback(async (file: File | undefined | null) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setStatus({ kind: "error", text: "Please choose an image file (JPG, PNG, WebP, GIF or BMP)." });
            return;
        }
        if (file.size === 0) {
            setStatus({ kind: "error", text: "This file is empty." });
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            setStatus({ kind: "warn", text: `This image is ${formatSize(file.size)}. Please choose one smaller than 20 MB.` });
            return;
        }

        setStatus({ kind: "info", text: "Opening image…" });
        const url = URL.createObjectURL(file);
        try {
            let el: ImageBitmap | HTMLImageElement | null = null;
            let w = 0;
            let h = 0;
            if (typeof createImageBitmap === "function") {
                try {
                    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
                    el = bmp;
                    w = bmp.width;
                    h = bmp.height;
                } catch {
                    el = null;
                }
            }
            if (!el) {
                const img = await loadImageElement(url);
                el = img;
                w = img.naturalWidth;
                h = img.naturalHeight;
            }
            if (!w || !h) throw new Error("DECODE");
            if (w * h > MAX_SRC_PIXELS) {
                if ("close" in el && typeof el.close === "function") el.close();
                URL.revokeObjectURL(url);
                setStatus({
                    kind: "warn",
                    text: `This image is ${w.toLocaleString()} × ${h.toLocaleString()} pixels, which is more than this tool can safely handle in a browser (about 64 megapixels).`,
                });
                return;
            }

            releaseSource();
            releaseResult();
            const next: Source = { el, w, h, url, name: file.name, size: file.size, type: file.type };
            srcRef.current = next;
            setSrc(next);
            setResult(null);

            const d = defaultDims(w, h);
            setWStr(String(d.w));
            setHStr(String(d.h));
            setMode("pixels");
            setLock(true);
            setFit("cover");
            setFormat(file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg");
            setStatus(null);
        } catch {
            URL.revokeObjectURL(url);
            setStatus({
                kind: "error",
                text: "This browser cannot open that image. It may be damaged or in a format such as HEIC. Convert it to JPG or PNG first.",
            });
        }
    }, []);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (!busy) void acceptFile(e.dataTransfer.files?.[0]);
    };

    /* ------------------------ dimension inputs ------------------------ */

    const onWidth = (v: string) => {
        setWStr(v);
        if (lock && src) {
            const n = toInt(v);
            setHStr(n >= 1 ? String(linked(n, src.h, src.w)) : "");
        }
    };

    const onHeight = (v: string) => {
        setHStr(v);
        if (lock && src) {
            const n = toInt(v);
            setWStr(n >= 1 ? String(linked(n, src.w, src.h)) : "");
        }
    };

    const target = useMemo(
        () =>
            src
                ? computeTarget(mode, src.w, src.h, { wStr, hStr, percentStr, presetId })
                : { w: 0, h: 0, error: "No image selected." },
        [src, mode, wStr, hStr, percentStr, presetId]
    );

    // With a locked ratio or a percentage the shape never changes, so fit does not apply.
    const fitApplies = mode === "preset" || (mode === "pixels" && !lock);
    const effectiveFit: Fit = fitApplies ? fit : "stretch";
    const usesBg = format === "image/jpeg" || (effectiveFit === "contain" && !bgTransparent);
    const enlarging = !!src && !target.error && (target.w > src.w || target.h > src.h);

    /* ----------------------------- resize ----------------------------- */

    const run = async () => {
        if (!src || target.error || busy) return;
        setBusy(true);
        setStatus(null);
        // let the button state paint before the heavy work starts
        await new Promise((r) => setTimeout(r, 20));

        try {
            const outW = target.w;
            const outH = target.h;
            const r = fitRects(src.w, src.h, outW, outH, effectiveFit);
            const steps = planSteps(r.sw, r.sh, r.dw, r.dh);

            let prev: CanvasImageSource = src.el;
            let psx = r.sx;
            let psy = r.sy;
            let psw = r.sw;
            let psh = r.sh;
            let prevCanvas: HTMLCanvasElement | null = null;

            for (const st of steps) {
                const c = document.createElement("canvas");
                c.width = st.w;
                c.height = st.h;
                const cctx = c.getContext("2d");
                if (!cctx) throw new Error("CANVAS");
                cctx.imageSmoothingEnabled = true;
                cctx.imageSmoothingQuality = "high";
                cctx.drawImage(prev, psx, psy, psw, psh, 0, 0, st.w, st.h);
                if (prevCanvas) {
                    prevCanvas.width = 0;
                    prevCanvas.height = 0;
                }
                prevCanvas = c;
                prev = c;
                psx = 0;
                psy = 0;
                psw = st.w;
                psh = st.h;
            }

            const out = document.createElement("canvas");
            out.width = outW;
            out.height = outH;
            const octx = out.getContext("2d");
            if (!octx || !prevCanvas) throw new Error("CANVAS");
            octx.imageSmoothingEnabled = true;
            octx.imageSmoothingQuality = "high";
            if (usesBg) {
                octx.fillStyle = bg;
                octx.fillRect(0, 0, outW, outH);
            }
            octx.drawImage(prevCanvas, r.dx, r.dy, r.dw, r.dh);
            prevCanvas.width = 0;
            prevCanvas.height = 0;

            const wantsQuality = format === "image/jpeg" || format === "image/webp";
            const blob = await new Promise<Blob | null>((resolve) =>
                out.toBlob(resolve, format, wantsQuality ? quality / 100 : undefined)
            );
            out.width = 0;
            out.height = 0;
            if (!blob) throw new Error("ENCODE");

            releaseResult();
            const url = URL.createObjectURL(blob);
            resultUrlRef.current = url;
            const actualType = blob.type || format;
            setResult({ blob, url, w: outW, h: outH, ext: EXT[actualType] ?? "png" });

            if (actualType !== format) {
                setStatus({
                    kind: "warn",
                    text: `Your browser cannot save ${format.replace("image/", "").toUpperCase()} files, so the image was saved as ${actualType.replace("image/", "").toUpperCase()} instead.`,
                });
            } else {
                setStatus({ kind: "success", text: `Done. Your image is now ${outW.toLocaleString()} × ${outH.toLocaleString()} pixels.` });
            }
        } catch (err) {
            console.error("Resize error:", err);
            setResult(null);
            setStatus({
                kind: "error",
                text: "The image could not be resized. Try smaller dimensions, a different format, or close other tabs to free memory.",
            });
        } finally {
            setBusy(false);
        }
    };

    const baseName = src ? src.name.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_") || "image" : "image";
    const downloadName = result ? `${baseName}-${result.w}x${result.h}.${result.ext}` : "";
    const change = result && src ? ((result.blob.size - src.size) / src.size) * 100 : 0;

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

    const modeTabs: { id: Mode; label: string }[] = [
        { id: "pixels", label: "Pixels" },
        { id: "percent", label: "Percentage" },
        { id: "preset", label: "Presets" },
    ];
    const presetGroups = Array.from(new Set(PRESETS.map((p) => p.group)));

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
                            <h2 className="text-xl font-bold text-slate-100">Image Resizer</h2>
                            <p className="text-xs text-slate-400">
                                Change image dimensions, crop to fit and convert formats in your browser.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
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
                                {dragging ? "Drop your image here" : "Choose or drop an image"}
                            </h3>
                            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                                JPG, PNG, WebP, GIF or BMP, up to 20 MB. Nothing is uploaded.
                            </p>
                            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400">
                                <Upload className="h-4 w-4" />
                                Browse image
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => void acceptFile(e.target.files?.[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* File bar */}
                        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={src.url}
                                    alt="Selected image thumbnail"
                                    className="h-12 w-12 shrink-0 rounded-lg border border-slate-800 bg-slate-900 object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-100">{src.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {src.w.toLocaleString()} × {src.h.toLocaleString()} px · {formatSize(src.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={reset}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50 sm:self-auto"
                            >
                                <Trash2 className="h-4 w-4" />
                                Change image
                            </button>
                        </div>

                        {/* Mode tabs */}
                        <div
                            role="tablist"
                            aria-label="Resize method"
                            className="inline-flex rounded-2xl border border-slate-800 bg-slate-950/60 p-1"
                        >
                            {modeTabs.map((t) => (
                                <button
                                    key={t.id}
                                    role="tab"
                                    aria-selected={mode === t.id}
                                    onClick={() => setMode(t.id)}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${mode === t.id ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Size controls */}
                        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                            {mode === "pixels" && (
                                <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
                                    <div>
                                        <label htmlFor="rs-w" className={`${fieldLabel} mb-1 block`}>
                                            Width (px)
                                        </label>
                                        <input
                                            id="rs-w"
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            max={MAX_SIDE}
                                            value={wStr}
                                            onChange={(e) => onWidth(e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setLock((l) => !l)}
                                        aria-pressed={lock}
                                        aria-label={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                                        title={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                                        className={`flex h-11 w-11 items-center justify-center self-end rounded-xl border transition ${lock
                                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                                            : "border-slate-700 text-slate-400 hover:text-slate-200"
                                            }`}
                                    >
                                        {lock ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                    </button>
                                    <div>
                                        <label htmlFor="rs-h" className={`${fieldLabel} mb-1 block`}>
                                            Height (px)
                                        </label>
                                        <input
                                            id="rs-h"
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            max={MAX_SIDE}
                                            value={hStr}
                                            onChange={(e) => onHeight(e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            )}

                            {mode === "percent" && (
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label htmlFor="rs-pct" className={fieldLabel}>
                                            Scale
                                        </label>
                                        <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-extrabold text-cyan-300">
                                            {percentStr || "0"}%
                                        </span>
                                    </div>
                                    <input
                                        id="rs-pct"
                                        type="range"
                                        min={5}
                                        max={300}
                                        step={5}
                                        value={Math.min(300, Math.max(5, Number(percentStr) || 5))}
                                        onChange={(e) => setPercentStr(e.target.value)}
                                        className="w-full cursor-pointer accent-cyan-500"
                                    />
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        {[25, 50, 75, 150, 200].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPercentStr(String(p))}
                                                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
                                            >
                                                {p}%
                                            </button>
                                        ))}
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            aria-label="Custom percentage"
                                            value={percentStr}
                                            onChange={(e) => setPercentStr(e.target.value)}
                                            className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                                        />
                                    </div>
                                </div>
                            )}

                            {mode === "preset" && (
                                <div>
                                    <label htmlFor="rs-preset" className={`${fieldLabel} mb-1 block`}>
                                        Preset size
                                    </label>
                                    <select
                                        id="rs-preset"
                                        value={presetId}
                                        onChange={(e) => setPresetId(e.target.value)}
                                        className={inputCls}
                                    >
                                        {presetGroups.map((g) => (
                                            <optgroup key={g} label={g}>
                                                {PRESETS.filter((p) => p.group === g).map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.label} ({p.w} × {p.h})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Target readout / errors */}
                            {target.error ? (
                                <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{target.error}</span>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Maximize2 className="h-3.5 w-3.5 text-cyan-300" />
                                        Output:{" "}
                                        <strong className="text-slate-100">
                                            {target.w.toLocaleString()} × {target.h.toLocaleString()} px
                                        </strong>
                                    </span>
                                    <span>
                                        {((target.w * target.h) / 1_000_000).toFixed(2)} megapixels
                                    </span>
                                </div>
                            )}
                            {enlarging && (
                                <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-200">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                        You are enlarging this image. Resizing cannot add detail, so it will look softer than the original.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Fit */}
                        {fitApplies && (
                            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                                <div className={fieldLabel}>When the shape differs from the original</div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {(
                                        [
                                            { id: "cover", t: "Cover", d: "Fill the area and crop the overflow (centred)" },
                                            { id: "contain", t: "Contain", d: "Fit everything inside with a background colour" },
                                            { id: "stretch", t: "Stretch", d: "Force to the new size (distorts the image)" },
                                        ] as { id: Fit; t: string; d: string }[]
                                    ).map((f) => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            aria-pressed={fit === f.id}
                                            onClick={() => setFit(f.id)}
                                            className={`rounded-xl border-2 p-3.5 text-left transition ${fit === f.id
                                                ? "border-cyan-500 bg-cyan-500/10"
                                                : "border-slate-800 bg-slate-900 hover:border-slate-700"
                                                }`}
                                        >
                                            <div className="text-sm font-bold text-slate-100">{f.t}</div>
                                            <div className="text-[11px] leading-snug text-slate-400">{f.d}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Output */}
                        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 md:grid-cols-3">
                            <div>
                                <label htmlFor="rs-format" className={`${fieldLabel} mb-1 block`}>
                                    Output format
                                </label>
                                <select
                                    id="rs-format"
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                    className={inputCls}
                                >
                                    {FORMAT_OPTIONS.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(format === "image/jpeg" || format === "image/webp") && (
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label htmlFor="rs-quality" className={fieldLabel}>
                                            Quality
                                        </label>
                                        <span className="text-xs font-bold text-cyan-300">{quality}%</span>
                                    </div>
                                    <input
                                        id="rs-quality"
                                        type="range"
                                        min={10}
                                        max={100}
                                        step={5}
                                        value={quality}
                                        onChange={(e) => setQuality(Number(e.target.value))}
                                        className="mt-3 w-full cursor-pointer accent-cyan-500"
                                    />
                                </div>
                            )}

                            {usesBg || (effectiveFit === "contain" && format !== "image/jpeg") ? (
                                <div>
                                    <label htmlFor="rs-bg" className={`${fieldLabel} mb-1 block`}>
                                        Background colour
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="rs-bg"
                                            type="color"
                                            value={bg}
                                            onChange={(e) => setBg(e.target.value)}
                                            disabled={format !== "image/jpeg" && bgTransparent}
                                            className="h-11 w-16 cursor-pointer rounded-xl border border-slate-700 bg-slate-950 p-1 disabled:opacity-40"
                                        />
                                        {format !== "image/jpeg" && effectiveFit === "contain" && (
                                            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-300">
                                                <input
                                                    type="checkbox"
                                                    checked={bgTransparent}
                                                    onChange={(e) => setBgTransparent(e.target.checked)}
                                                    className="h-4 w-4 accent-cyan-500"
                                                />
                                                Transparent
                                            </label>
                                        )}
                                    </div>
                                    {format === "image/jpeg" && (
                                        <p className="mt-1.5 text-[11px] text-slate-500">JPEG has no transparency, so this colour fills clear areas.</p>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            onClick={run}
                            disabled={busy || !!target.error}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
                        >
                            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                            {busy ? "Resizing…" : result ? "Resize again" : "Resize image"}
                        </button>
                    </div>
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
                {result && src && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                        <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
                            <h3 className="text-sm font-bold text-slate-100">Your resized image is ready</h3>
                        </div>
                        <div className="space-y-5 p-5">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { l: "Original", v: `${src.w} × ${src.h}`, s: formatSize(src.size) },
                                    { l: "Resized", v: `${result.w} × ${result.h}`, s: formatSize(result.blob.size) },
                                    {
                                        l: "File size change",
                                        v: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
                                        s: change <= 0 ? "smaller" : "larger",
                                    },
                                    { l: "Format", v: result.ext.toUpperCase(), s: "" },
                                ].map((s) => (
                                    <div key={s.l} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
                                        <div className="mt-0.5 text-sm font-bold text-slate-100">{s.v}</div>
                                        {s.s && <div className="text-[10px] text-slate-500">{s.s}</div>}
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <figure className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                                    <figcaption className={`${fieldLabel} mb-2`}>Original</figcaption>
                                    <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={src.url} alt="Original image" className="max-h-full max-w-full object-contain" />
                                    </div>
                                </figure>
                                <figure className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                                    <figcaption className={`${fieldLabel} mb-2`}>Resized</figcaption>
                                    <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={result.url} alt="Resized image" className="max-h-full max-w-full object-contain" />
                                    </div>
                                </figure>
                            </div>

                            <a
                                href={result.url}
                                download={downloadName}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                            >
                                <Download className="h-4 w-4" />
                                Download {downloadName}
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------------- About ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">About the Image Resizer</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        Whether you are preparing a photo for an Instagram post, a YouTube thumbnail, a website banner or an
                        email attachment, the first job is usually the same: get the image to the right size. This tool
                        resizes by exact pixels, by percentage or from ready-made presets, crops to fit when the shape
                        changes, and saves the result as JPEG, PNG or WebP.
                    </p>
                    <p>
                        Everything runs in your browser with the HTML5 canvas, so your pictures are never uploaded. Downscaling
                        is done in several gentle steps, which keeps edges smoother than a single big jump. One honest
                        limit: resizing cannot add detail. Making a picture smaller is safe, but enlarging one only stretches
                        the pixels you already have.
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
                            "Drop an image onto the box or click Browse. Files up to 20 MB are accepted.",
                            "Pick Pixels, Percentage or Presets. With pixels, keep the lock on to preserve the shape.",
                            "If the new shape differs, choose Cover, Contain or Stretch, then pick a format and quality.",
                            "Click Resize image, compare the before and after, and download the file.",
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
                            "Private: processed entirely in your browser",
                            "Resize by pixels, by percentage or from 12 ready-made presets",
                            "Aspect-ratio lock with correct rounding",
                            "Cover (crop), Contain (letterbox) and Stretch fit modes",
                            "Smooth multi-step downscaling for cleaner edges",
                            "JPEG, PNG and WebP output with a quality slider",
                            "Photos with rotation data (EXIF) keep their correct orientation",
                            "Side-by-side preview with new dimensions and file size",
                        ].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ---------------- Presets table ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Common Image Sizes</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[480px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">Use</th>
                                <th className="px-4 py-3 font-bold">Category</th>
                                <th className="px-4 py-3 font-bold">Size (px)</th>
                                <th className="px-4 py-3 font-bold">Shape</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {PRESETS.map((p) => {
                                const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
                                const g = gcd(p.w, p.h);
                                return (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 font-semibold text-slate-200">{p.label}</td>
                                        <td className="px-4 py-3">{p.group}</td>
                                        <td className="px-4 py-3">
                                            {p.w} × {p.h}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {p.w / g}:{p.h / g}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                    Platforms change their recommended sizes from time to time, so check the current guidelines before publishing.
                </p>
            </section>

            {/* ---------------- Choosing dimensions and formats ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">Choosing Dimensions and Formats</h2>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        <strong className="text-slate-100">Downscaling vs. upscaling.</strong> Reducing an image keeps it
                        sharp because the tool has more information than it needs. Enlarging is the reverse: the tool must
                        guess new pixels, so results turn soft. If you need a bigger picture, go back to the original
                        source if you can.
                    </p>
                    <p>
                        <strong className="text-slate-100">Pixels vs. DPI.</strong> On screens, only pixels matter. DPI is a
                        printing hint that says how many pixels to squeeze into an inch. To print a photo 6 inches wide at
                        300 DPI, you need 1800 pixels across; changing the DPI label alone will not add any.
                    </p>
                    <p>
                        <strong className="text-slate-100">Match the display size.</strong> An image shown 600 px wide on a
                        web page does not need to be 4000 px wide. Export it at roughly twice the display width for sharp
                        results on high-density screens and no more.
                    </p>
                </div>
                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[560px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">Format</th>
                                <th className="px-4 py-3 font-bold">Best for</th>
                                <th className="px-4 py-3 font-bold">Strengths</th>
                                <th className="px-4 py-3 font-bold">Watch out for</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {FORMATS.map((r) => (
                                <tr key={r[0]}>
                                    <td className="px-4 py-3 font-semibold text-slate-200">{r[0]}</td>
                                    <td className="px-4 py-3">{r[1]}</td>
                                    <td className="px-4 py-3">{r[2]}</td>
                                    <td className="px-4 py-3 text-slate-400">{r[3]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---------------- Mistakes ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Common Resizing Mistakes</h2>
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
                        { href: "/tools/image-compressor", t: "Image Compressor", d: "Make the resized file even smaller." },
                        { href: "/tools/json-formatter", t: "JSON Formatter", d: "Format, validate and minify JSON." },
                        { href: "/tools/word-counter", t: "Word Counter", d: "Count words, characters and reading time." },
                        { href: "/tools/lorem-ipsum-generator", t: "Lorem Ipsum Generator", d: "Placeholder text for your designs." },
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