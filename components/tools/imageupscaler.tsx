"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    Maximize2,
    Upload,
    Download,
    RefreshCw,
    Image as ImageIcon,
    ShieldCheck,
    CheckCircle2,
    Trash2,
    Zap,
    HelpCircle,
    Layers,
    AlertCircle,
    Sliders,
    FileType,
    Loader2,
    Lightbulb,
    Users,
} from "lucide-react";

type OutputFormat = "png" | "jpeg" | "webp";
type ScaleMode = "2" | "3" | "4" | "custom";
type SharpenLevel = "off" | "low" | "medium" | "high";

type SourceInfo = {
    file: File;
    url: string;
    width: number;
    height: number;
    size: number;
};

type ResultInfo = {
    url: string;
    size: number;
    width: number;
    height: number;
    format: OutputFormat;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_SIDE = 8000; // px
const MAX_PIXELS = 24_000_000; // ~24 megapixels (e.g. 6000 x 4000)

const SHARPEN_AMOUNT: Record<SharpenLevel, number> = {
    off: 0,
    low: 0.3,
    medium: 0.6,
    high: 1,
};

const FAQS = [
    {
        q: "Is this real AI upscaling?",
        a: "No. This tool enlarges images with high-quality interpolation built into your browser, plus an optional sharpening step. It makes images bigger and keeps edges clean, but it does not invent new detail the way deep-learning upscalers do. We believe in being upfront about this so you can choose the right tool for the job.",
    },
    {
        q: "Are my images uploaded to a server?",
        a: "No. Everything happens inside your browser using the HTML5 Canvas API. Your photos are never sent to our servers, which keeps them private and makes the tool fast. Note that, like most websites, we use analytics and advertising scripts, so please read our privacy policy for details about the site itself.",
    },
    {
        q: "What is the maximum image size I can upscale?",
        a: "You can upload files up to 10 MB. The enlarged result is limited to 8,000 pixels on the longest side and about 24 megapixels in total (for example 6000 × 4000). This protects your browser from running out of memory, especially on phones and older computers.",
    },
    {
        q: "Which upscale factor should I choose?",
        a: "2x is the safest choice and gives the cleanest result for most photos. 3x and 4x work well for graphics, logos and screenshots, but photos can start to look soft at 4x because no new detail is created. If you need an exact width, use the custom width option.",
    },
    {
        q: "What does the sharpening option do?",
        a: "Enlarging an image naturally softens it. The sharpening step increases contrast along edges so text, lines and outlines look crisper. Use Low or Medium for photos and High for logos and line art. Too much sharpening can create a rough, over-processed look, so compare the before and after slider.",
    },
    {
        q: "Which output format is best?",
        a: "Choose PNG for graphics, screenshots and anything with transparency, since it is lossless. Choose JPEG for photos when you want a smaller file. Choose WebP for the best size-to-quality ratio on websites. JPEG does not support transparency, so transparent areas are filled with white.",
    },
    {
        q: "Why is my upscaled file bigger than the original?",
        a: "A larger image has more pixels to store, so the file grows. PNG results are usually the largest. If the file is too big, switch to JPEG or WebP and lower the quality slider, or run the result through our Image Compressor.",
    },
    {
        q: "Does it work on mobile phones?",
        a: "Yes, it works on modern mobile browsers. Very large results can be slow or fail on older phones because of limited memory, so try 2x first or use a smaller custom width.",
    },
];

export default function ImageUpscaler() {
    const [source, setSource] = useState<SourceInfo | null>(null);
    const [result, setResult] = useState<ResultInfo | null>(null);

    const [scaleMode, setScaleMode] = useState<ScaleMode>("2");
    const [customWidth, setCustomWidth] = useState("");
    const [format, setFormat] = useState<OutputFormat>("png");
    const [quality, setQuality] = useState(0.92);
    const [sharpen, setSharpen] = useState<SharpenLevel>("low");

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [compare, setCompare] = useState(50);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const sourceUrlRef = useRef<string | null>(null);
    const resultUrlRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        };
    }, []);

    const clearResult = () => {
        if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
            resultUrlRef.current = null;
        }
        setResult(null);
        setCompare(50);
    };

    const loadFile = (file: File) => {
        setError("");
        clearResult();

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file (PNG, JPG, WebP, etc.).");
            return;
        }

        if (file.size > MAX_FILE_BYTES) {
            setError("Please select an image smaller than 10 MB.");
            return;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            if (sourceUrlRef.current) {
                URL.revokeObjectURL(sourceUrlRef.current);
            }
            sourceUrlRef.current = url;
            imgRef.current = img;

            setSource({
                file,
                url,
                width: img.naturalWidth,
                height: img.naturalHeight,
                size: file.size,
            });
            setCustomWidth(String(img.naturalWidth * 2));
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            setError("Unable to read this image. Try a different file.");
        };

        img.src = url;
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) loadFile(file);
        e.target.value = "";
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) loadFile(file);
    };

    const getTarget = () => {
        if (!source) return null;

        if (scaleMode === "custom") {
            const w = Math.round(Number(customWidth));
            if (!Number.isFinite(w) || w <= 0) return null;
            const h = Math.round((w / source.width) * source.height);
            return { w, h, factor: w / source.width };
        }

        const factor = Number(scaleMode);
        return {
            w: Math.round(source.width * factor),
            h: Math.round(source.height * factor),
            factor,
        };
    };

    const target = getTarget();

    const targetError = (() => {
        if (!source || !target) return "";
        if (target.w <= source.width) {
            return "Target width must be larger than the original width.";
        }
        if (
            target.w > MAX_SIDE ||
            target.h > MAX_SIDE ||
            target.w * target.h > MAX_PIXELS
        ) {
            return `Result too large (${target.w} × ${target.h}). Maximum is ${MAX_SIDE}px per side and about 24 megapixels. Choose a smaller scale.`;
        }
        return "";
    })();

    const sharpenCanvas = (canvas: HTMLCanvasElement, amount: number) => {
        const ctx = canvas.getContext("2d");
        if (!ctx || amount <= 0) return;

        const { width, height } = canvas;
        const src = ctx.getImageData(0, 0, width, height);
        const out = ctx.createImageData(width, height);
        const s = src.data;
        const o = out.data;
        const stride = width * 4;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = y * stride + x * 4;

                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    o[i] = s[i];
                    o[i + 1] = s[i + 1];
                    o[i + 2] = s[i + 2];
                    o[i + 3] = s[i + 3];
                    continue;
                }

                for (let c = 0; c < 3; c++) {
                    const center = s[i + c];
                    const sharp =
                        5 * center -
                        s[i - stride + c] -
                        s[i + stride + c] -
                        s[i - 4 + c] -
                        s[i + 4 + c];
                    // Uint8ClampedArray clamps values to 0-255 automatically
                    o[i + c] = center + (sharp - center) * amount;
                }
                o[i + 3] = s[i + 3];
            }
        }

        ctx.putImageData(out, 0, 0);
    };

    const handleUpscale = async () => {
        if (!source || !imgRef.current || !target) {
            setError("Please enter a valid target size.");
            return;
        }

        if (targetError) {
            setError(targetError);
            return;
        }

        setProcessing(true);
        setError("");

        // Let the loading state paint before the heavy work starts
        await new Promise((resolve) => setTimeout(resolve, 60));

        try {
            let current: HTMLImageElement | HTMLCanvasElement = imgRef.current;
            let cw = source.width;
            let ch = source.height;
            let guard = 0;

            // Progressive scaling: grow in steps of at most 2x for smoother results
            while ((cw !== target.w || ch !== target.h) && guard < 8) {
                const nw = cw < target.w ? Math.min(target.w, cw * 2) : target.w;
                const nh = ch < target.h ? Math.min(target.h, ch * 2) : target.h;

                const stepCanvas = document.createElement("canvas");
                stepCanvas.width = nw;
                stepCanvas.height = nh;

                const stepCtx = stepCanvas.getContext("2d");
                if (!stepCtx) {
                    throw new Error("Canvas is not supported by this browser.");
                }

                stepCtx.imageSmoothingEnabled = true;
                stepCtx.imageSmoothingQuality = "high";

                if (format === "jpeg") {
                    stepCtx.fillStyle = "#ffffff";
                    stepCtx.fillRect(0, 0, nw, nh);
                }

                stepCtx.drawImage(current, 0, 0, nw, nh);

                current = stepCanvas;
                cw = nw;
                ch = nh;
                guard++;
            }

            const finalCanvas = current as HTMLCanvasElement;

            sharpenCanvas(finalCanvas, SHARPEN_AMOUNT[sharpen]);

            const mime =
                format === "png"
                    ? "image/png"
                    : format === "webp"
                        ? "image/webp"
                        : "image/jpeg";

            const blob = await new Promise<Blob | null>((resolve) =>
                finalCanvas.toBlob(
                    (b) => resolve(b),
                    mime,
                    format === "png" ? undefined : quality
                )
            );

            if (!blob) {
                throw new Error("Unable to create the output image.");
            }

            clearResult();

            const url = URL.createObjectURL(blob);
            resultUrlRef.current = url;

            setResult({
                url,
                size: blob.size,
                width: cw,
                height: ch,
                format,
            });
        } catch (err) {
            console.error("Upscale error:", err);
            setError(
                "Something went wrong while upscaling. Try a smaller scale factor or a smaller image."
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleReset = () => {
        if (sourceUrlRef.current) {
            URL.revokeObjectURL(sourceUrlRef.current);
            sourceUrlRef.current = null;
        }
        imgRef.current = null;
        clearResult();
        setSource(null);
        setScaleMode("2");
        setCustomWidth("");
        setFormat("png");
        setQuality(0.92);
        setSharpen("low");
        setError("");
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const downloadName = () => {
        if (!source || !result) return "upscaled-image";
        const base = source.file.name.replace(/\.[^/.]+$/, "") || "image";
        const ext = result.format === "jpeg" ? "jpg" : result.format;
        return `${base}-upscaled-${result.width}x${result.height}.${ext}`;
    };

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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
            />

            {/* ================= TOOL CARD ================= */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Maximize2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Image Upscaler &amp; Enlarger
                            </h2>
                            <p className="text-sm text-slate-400">
                                Enlarge photos and graphics up to 4x in your browser, with
                                optional sharpening. No uploads.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Files stay on your device</span>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-950/60 border border-rose-900/50 p-4 text-sm font-medium text-rose-300">
                        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {!source ? (
                    <label
                        htmlFor="upscaler-upload"
                        className={`group block cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition sm:p-14 ${dragActive
                            ? "border-blue-500 bg-blue-950/30"
                            : "border-slate-800 bg-slate-950/50 hover:border-blue-500/50 hover:bg-blue-950/20"
                            }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-md border border-slate-800 text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                                <Upload className="h-8 w-8" />
                            </div>
                            <h2 className="text-lg font-bold text-white">
                                Upload an image to enlarge
                            </h2>
                            <p className="mt-1 max-w-md text-sm text-slate-400 leading-relaxed">
                                Click to choose a file or drag and drop it here.
                            </p>
                            <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition">
                                <Upload className="h-4 w-4" />
                                Choose Image File
                            </span>
                            <p className="mt-4 text-xs text-slate-500">
                                JPG, PNG, WebP, GIF, BMP • Max file size: 10 MB
                            </p>
                            <input
                                id="upscaler-upload"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </label>
                ) : (
                    <div className="space-y-8">
                        {/* File header */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                                    <ImageIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-white text-sm break-all">
                                        {source.file.name}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {formatSize(source.size)} • {source.width} ×{" "}
                                        {source.height} px
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={processing}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition disabled:opacity-50 cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                                Choose Another
                            </button>
                        </div>

                        {/* Preview of source */}
                        {!result && (
                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-xs">
                                    <span className="font-bold text-slate-200">
                                        Original image
                                    </span>
                                    <span className="rounded-md bg-slate-800 px-2.5 py-1 font-semibold text-slate-300">
                                        {source.width} × {source.height}
                                    </span>
                                </div>
                                <div className="flex min-h-64 items-center justify-center p-6">
                                    <img
                                        src={source.url}
                                        alt="Original upload preview"
                                        className="max-h-80 max-w-full rounded-xl object-contain border border-slate-800"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Scale */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                                    <Layers className="h-4 w-4 text-blue-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                        Upscale amount
                                    </h3>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {(
                                        [
                                            ["2", "2x"],
                                            ["3", "3x"],
                                            ["4", "4x"],
                                            ["custom", "Custom"],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => {
                                                setScaleMode(value);
                                                clearResult();
                                            }}
                                            className={`rounded-xl border py-2.5 text-sm font-bold transition cursor-pointer ${scaleMode === value
                                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                                : "border-slate-800 bg-slate-900 text-slate-300 hover:border-blue-500/50"
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {scaleMode === "custom" && (
                                    <div>
                                        <label
                                            htmlFor="custom-width"
                                            className="mb-1.5 block text-xs font-bold text-slate-400"
                                        >
                                            Target width (px) — height follows automatically
                                        </label>
                                        <input
                                            id="custom-width"
                                            type="number"
                                            min={source.width + 1}
                                            max={MAX_SIDE}
                                            value={customWidth}
                                            onChange={(e) => {
                                                setCustomWidth(e.target.value);
                                                clearResult();
                                            }}
                                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                        />
                                    </div>
                                )}

                                <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                                    {target ? (
                                        <>
                                            Output size:{" "}
                                            <span className="font-bold text-white">
                                                {target.w} × {target.h} px
                                            </span>{" "}
                                            <span className="text-slate-500">
                                                ({target.factor.toFixed(2).replace(/\.?0+$/, "")}x)
                                            </span>
                                        </>
                                    ) : (
                                        "Enter a valid width."
                                    )}
                                </div>

                                {targetError && (
                                    <p className="text-xs font-medium text-amber-400">
                                        {targetError}
                                    </p>
                                )}
                            </div>

                            {/* Format */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                                    <FileType className="h-4 w-4 text-blue-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                        Output format
                                    </h3>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {(
                                        [
                                            ["png", "PNG"],
                                            ["jpeg", "JPEG"],
                                            ["webp", "WebP"],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => {
                                                setFormat(value);
                                                clearResult();
                                            }}
                                            className={`rounded-xl border py-2.5 text-sm font-bold transition cursor-pointer ${format === value
                                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                                : "border-slate-800 bg-slate-900 text-slate-300 hover:border-blue-500/50"
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {format !== "png" ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="upscale-quality"
                                                className="text-xs font-bold text-slate-400"
                                            >
                                                Quality
                                            </label>
                                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-md">
                                                {Math.round(quality * 100)}%
                                            </span>
                                        </div>
                                        <input
                                            id="upscale-quality"
                                            type="range"
                                            min="0.5"
                                            max="1"
                                            step="0.01"
                                            value={quality}
                                            onChange={(e) => {
                                                setQuality(Number(e.target.value));
                                                clearResult();
                                            }}
                                            className="w-full accent-blue-600 cursor-pointer"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">
                                        PNG is lossless and keeps transparency. Files are larger.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Sharpen */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                                <Sliders className="h-4 w-4 text-blue-400" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                    Edge sharpening
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(
                                    [
                                        ["off", "Off"],
                                        ["low", "Low"],
                                        ["medium", "Medium"],
                                        ["high", "High"],
                                    ] as const
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            setSharpen(value);
                                            clearResult();
                                        }}
                                        className={`rounded-xl border py-2.5 text-sm font-bold transition cursor-pointer ${sharpen === value
                                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                                            : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500">
                                Enlarging softens an image. Sharpening makes edges crisper.
                                Low suits photos; High suits logos and line art.
                            </p>
                        </div>

                        {/* Action */}
                        <button
                            type="button"
                            onClick={handleUpscale}
                            disabled={processing || !target || !!targetError}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Zap className="h-5 w-5" />
                            )}
                            {processing
                                ? "Enlarging image..."
                                : result
                                    ? "Upscale Again"
                                    : "Upscale Image"}
                        </button>

                        {/* Result */}
                        {result && (
                            <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            Your image has been enlarged
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-0.5">
                                            Drag the slider to compare the original and the
                                            upscaled version.
                                        </p>
                                    </div>
                                </div>

                                {/* Before / After comparison */}
                                <div>
                                    <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 select-none">
                                        {/* After (upscaled) underneath */}
                                        <img
                                            src={result.url}
                                            alt="Upscaled result"
                                            className="absolute inset-0 h-full w-full object-contain"
                                        />
                                        {/* Before (original) clipped on top */}
                                        <img
                                            src={source.url}
                                            alt="Original image"
                                            className="absolute inset-0 h-full w-full object-contain"
                                            style={{
                                                clipPath: `inset(0 ${100 - compare}% 0 0)`,
                                            }}
                                        />
                                        {/* Divider line */}
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow"
                                            style={{ left: `${compare}%` }}
                                        />
                                        <span className="absolute left-3 top-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                                            Original
                                        </span>
                                        <span className="absolute right-3 top-3 rounded-lg bg-emerald-600/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                                            Upscaled
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={compare}
                                        onChange={(e) => setCompare(Number(e.target.value))}
                                        aria-label="Compare original and upscaled image"
                                        className="mt-3 w-full accent-emerald-500 cursor-pointer"
                                    />
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Original
                                        </span>
                                        <p className="font-bold text-white text-sm mt-0.5">
                                            {source.width} × {source.height}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatSize(source.size)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-900/50 bg-slate-900 p-3 text-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                                            Upscaled
                                        </span>
                                        <p className="font-bold text-emerald-400 text-sm mt-0.5">
                                            {result.width} × {result.height}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatSize(result.size)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Scale
                                        </span>
                                        <p className="font-bold text-white text-sm mt-0.5">
                                            {(result.width / source.width)
                                                .toFixed(2)
                                                .replace(/\.?0+$/, "")}
                                            x
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Format
                                        </span>
                                        <p className="font-bold text-white text-sm mt-0.5">
                                            {result.format.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <a
                                        href={result.url}
                                        download={downloadName()}
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download {result.format.toUpperCase()}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={handleUpscale}
                                        disabled={processing}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Re-run
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Feature highlights */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-start gap-3">
                        <Zap className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm text-white">Progressive scaling</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Enlarges in smooth steps for cleaner edges.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-start gap-3">
                        <Sliders className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm text-white">Sharpening + compare</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Tune edges and check the result with a slider.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm text-white">Processed locally</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Your image never leaves your browser.
                            </p>
                        </div>
                    </div>
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
                        About the Image Upscaler &amp; Enlarger
                    </h2>
                </div>
                <p className="text-slate-300 text-base leading-relaxed">
                    The ProTools Hub Image Upscaler makes small images larger directly in
                    your web browser. Upload a photo, logo, screenshot or illustration,
                    choose a 2x, 3x or 4x multiplier (or an exact width), and download the
                    enlarged file as PNG, JPEG or WebP. Because the work is done by your own
                    device, there is no upload, no waiting in a queue and no account to
                    create.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    To get the best result, the tool enlarges the image in gradual steps
                    rather than one big jump, then applies an optional edge-sharpening pass.
                    A before-and-after slider lets you inspect the difference at full size
                    before you download anything.
                </p>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200 leading-relaxed">
                    <strong className="text-amber-300">Honest note:</strong> this tool
                    uses standard high-quality interpolation, not artificial intelligence.
                    It makes images larger and keeps edges clean, but it cannot add detail
                    that was never in the original file. For heavily pixelated or blurry
                    photos, expect a larger but still soft image.
                </div>
            </section>

            {/* How to use + Advantages */}
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
                            "Upload or drag and drop your image (JPG, PNG, WebP, GIF or BMP, up to 10 MB).",
                            "Choose 2x, 3x or 4x, or pick Custom and type the exact width you need.",
                            "Select an output format and, for JPEG or WebP, set the quality.",
                            "Pick a sharpening level, then click Upscale Image.",
                            "Use the slider to compare before and after, then download the result.",
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
                        <h2 className="text-lg font-extrabold text-white">Key Advantages</h2>
                    </div>
                    <ul className="space-y-3.5">
                        {[
                            "Free to use, with no sign-up and no watermark",
                            "Your image is processed in your browser, never uploaded",
                            "2x, 3x, 4x or an exact custom width",
                            "PNG, JPEG and WebP output with quality control",
                            "Adjustable edge sharpening",
                            "Before-and-after comparison slider",
                            "Clear size limits so your browser stays stable",
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

            {/* Use cases */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Users className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                        Who Uses an Image Upscaler?
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {[
                        {
                            t: "Web designers and developers",
                            d: "Create larger versions of logos, icons and banners for high-density (retina) screens when only a small file is available.",
                        },
                        {
                            t: "Online sellers",
                            d: "Meet the minimum image size that marketplaces require for product photos without retaking the picture.",
                        },
                        {
                            t: "Students and office workers",
                            d: "Enlarge small figures and screenshots so they stay readable in reports, slides and posters.",
                        },
                        {
                            t: "Social media creators",
                            d: "Prepare thumbnails, covers and profile images that need a specific width or resolution.",
                        },
                        {
                            t: "Printing and crafts",
                            d: "Increase pixel dimensions before sending a small image to print, so the file passes minimum-size checks.",
                        },
                        {
                            t: "Photographers",
                            d: "Create a larger working copy of an older or cropped photo for a quick preview or layout draft.",
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
                        Tips for the Best Results
                    </h2>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
                    <li>
                        <strong className="text-white">Start with the best source you have.</strong>{" "}
                        An upscaler cannot recover detail that was lost to heavy compression, so
                        use the original file rather than a screenshot or a re-saved copy.
                    </li>
                    <li>
                        <strong className="text-white">Use 2x when in doubt.</strong> Smaller
                        jumps look more natural. Try 4x mainly for graphics, logos and
                        screenshots with clean edges.
                    </li>
                    <li>
                        <strong className="text-white">Go easy on sharpening.</strong> Low or
                        Medium is enough for photos. High can add a harsh halo around edges.
                    </li>
                    <li>
                        <strong className="text-white">Pick PNG for graphics, WebP for the web.</strong>{" "}
                        PNG preserves transparency and sharp lines, while WebP gives much smaller
                        files for photos.
                    </li>
                    <li>
                        <strong className="text-white">Shrink the file afterwards if needed.</strong>{" "}
                        Large results can be heavy. Run them through the{" "}
                        <Link
                            href="/tools/image-compressor"
                            className="text-blue-400 underline hover:text-blue-300"
                        >
                            Image Compressor
                        </Link>{" "}
                        before using them on a website.
                    </li>
                </ul>
            </section>

            {/* How it works */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-4">
                <h2 className="text-xl font-extrabold text-white">
                    How Image Upscaling Works
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                    A digital image is a grid of pixels. To make it larger, software must
                    decide what color each new pixel should be. This is called
                    interpolation: the program looks at neighboring pixels and calculates a
                    smooth blend between them. Higher-quality interpolation methods produce
                    smoother gradients and cleaner edges than simply stretching pixels.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    Doing this in several smaller steps, as this tool does, often looks
                    better than one large jump because each step has less guessing to do.
                    The optional sharpening pass then boosts contrast along edges, which
                    counteracts the softness that enlarging introduces. Deep-learning
                    upscalers go a step further by predicting plausible new detail, but they
                    require heavy computation and usually run on remote servers. This tool
                    deliberately stays on your device so your images remain private.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    Related tools:{" "}
                    <Link
                        href="/tools/image-resizer"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Image Resizer &amp; Converter
                    </Link>
                    ,{" "}
                    <Link
                        href="/tools/image-compressor"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Image Compressor
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