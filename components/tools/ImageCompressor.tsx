"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
    Image as ImageIcon,
    Upload,
    Download,
    RefreshCw,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ShieldCheck,
    Zap,
    Maximize2,
    Sliders,
    FileType,
    Sparkles,
} from "lucide-react";

type OutputFormat = "jpeg" | "png" | "webp" | "pdf";

type ImageInfo = {
    file: File;
    preview: string;
    size: number;
    width: number;
    height: number;
};

export default function ImageCompressor() {
    const [image, setImage] = useState<ImageInfo | null>(null);

    const [quality, setQuality] = useState(0.75);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");

    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [keepAspectRatio, setKeepAspectRatio] = useState(true);

    const [compressedUrl, setCompressedUrl] = useState("");
    const [compressedSize, setCompressedSize] = useState(0);
    const [compressedWidth, setCompressedWidth] = useState(0);
    const [compressedHeight, setCompressedHeight] = useState(0);

    const [compressing, setCompressing] = useState(false);
    const [error, setError] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageUrlRef = useRef<string | null>(null);
    const resultUrlRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (imageUrlRef.current) {
                URL.revokeObjectURL(imageUrlRef.current);
            }

            if (resultUrlRef.current) {
                URL.revokeObjectURL(resultUrlRef.current);
            }
        };
    }, []);

    const clearResult = () => {
        if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
            resultUrlRef.current = null;
        }

        setCompressedUrl("");
        setCompressedSize(0);
        setCompressedWidth(0);
        setCompressedHeight(0);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        setError("");
        clearResult();

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setError("Please select an image smaller than 20 MB.");
            event.target.value = "";
            return;
        }

        if (imageUrlRef.current) {
            URL.revokeObjectURL(imageUrlRef.current);
        }

        const preview = URL.createObjectURL(file);
        imageUrlRef.current = preview;

        const img = new Image();

        img.onload = () => {
            setImage({
                file,
                preview,
                size: file.size,
                width: img.width,
                height: img.height,
            });

            setWidth(String(img.width));
            setHeight(String(img.height));
            setError("");
        };

        img.onerror = () => {
            URL.revokeObjectURL(preview);
            imageUrlRef.current = null;
            setError("Unable to read this image.");
        };

        img.src = preview;
    };

    const handleWidthChange = (value: string) => {
        setWidth(value);

        if (!keepAspectRatio || !image) {
            return;
        }

        const newWidth = Number(value);

        if (!newWidth || newWidth <= 0) {
            return;
        }

        const newHeight = Math.round((newWidth / image.width) * image.height);

        setHeight(String(newHeight));
    };

    const handleHeightChange = (value: string) => {
        setHeight(value);

        if (!keepAspectRatio || !image) {
            return;
        }

        const newHeight = Number(value);

        if (!newHeight || newHeight <= 0) {
            return;
        }

        const newWidth = Math.round((newHeight / image.height) * image.width);

        setWidth(String(newWidth));
    };

    const getMimeType = () => {
        if (outputFormat === "png") {
            return "image/png";
        }

        if (outputFormat === "webp") {
            return "image/webp";
        }

        return "image/jpeg";
    };

    const getExtension = () => {
        if (outputFormat === "pdf") {
            return "pdf";
        }

        if (outputFormat === "png") {
            return "png";
        }

        if (outputFormat === "webp") {
            return "webp";
        }

        return "jpg";
    };

    const blobToDataUrl = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("Unable to create image data."));
                }
            };

            reader.onerror = () => {
                reject(new Error("Unable to read image data."));
            };

            reader.readAsDataURL(blob);
        });
    };

    const createPdf = async (
        imageBlob: Blob,
        imageWidth: number,
        imageHeight: number
    ) => {
        const imageDataUrl = await blobToDataUrl(imageBlob);

        const pdf = new jsPDF({
            orientation:
                imageWidth >= imageHeight ? "landscape" : "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;

        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;

        const imageRatio = imageWidth / imageHeight;
        const pageRatio = maxWidth / maxHeight;

        let pdfWidth: number;
        let pdfHeight: number;

        if (imageRatio > pageRatio) {
            pdfWidth = maxWidth;
            pdfHeight = pdfWidth / imageRatio;
        } else {
            pdfHeight = maxHeight;
            pdfWidth = pdfHeight * imageRatio;
        }

        const x = (pageWidth - pdfWidth) / 2;
        const y = (pageHeight - pdfHeight) / 2;

        pdf.addImage(
            imageDataUrl,
            "JPEG",
            x,
            y,
            pdfWidth,
            pdfHeight,
            undefined,
            "FAST"
        );

        const pdfArrayBuffer = pdf.output("arraybuffer");

        return new Blob([pdfArrayBuffer], {
            type: "application/pdf",
        });
    };

    const downloadImage = () => {
        if (!compressedUrl) {
            return;
        }

        const link = document.createElement("a");

        link.href = compressedUrl;

        link.download = `protools-${outputFormat}-image.${getExtension()}`;

        document.body.appendChild(link);

        link.click();

        link.remove();
    };

    const compressImage = async () => {
        if (!image) {
            return;
        }

        const newWidth = Number(width);
        const newHeight = Number(height);

        if (
            !Number.isFinite(newWidth) ||
            !Number.isFinite(newHeight) ||
            newWidth <= 0 ||
            newHeight <= 0
        ) {
            setError("Please enter a valid width and height.");
            return;
        }

        if (newWidth > 10000 || newHeight > 10000) {
            setError(
                "Maximum supported dimension is 10,000 × 10,000 pixels."
            );
            return;
        }

        setCompressing(true);
        setError("");

        try {
            const img = new Image();

            img.src = image.preview;

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();

                img.onerror = () =>
                    reject(new Error("Image could not be loaded."));
            });

            const canvas = document.createElement("canvas");

            canvas.width = newWidth;
            canvas.height = newHeight;

            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Canvas is not supported by this browser.");
            }

            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";

            if (outputFormat === "jpeg") {
                context.fillStyle = "#ffffff";

                context.fillRect(0, 0, newWidth, newHeight);
            }

            context.drawImage(img, 0, 0, newWidth, newHeight);

            let finalBlob: Blob;

            if (outputFormat === "pdf") {
                const jpegBlob = await new Promise<Blob | null>((resolve) => {
                    canvas.toBlob(
                        (result) => resolve(result),
                        "image/jpeg",
                        quality
                    );
                });

                if (!jpegBlob) {
                    throw new Error("Unable to create the JPEG image.");
                }

                finalBlob = await createPdf(jpegBlob, newWidth, newHeight);
            } else {
                const mimeType = getMimeType();

                const processedBlob = await new Promise<Blob | null>(
                    (resolve) => {
                        canvas.toBlob(
                            (result) => resolve(result),
                            mimeType,
                            outputFormat === "png" ? undefined : quality
                        );
                    }
                );

                if (!processedBlob) {
                    throw new Error("Unable to create the processed image.");
                }

                finalBlob = processedBlob;
            }

            clearResult();

            const resultUrl = URL.createObjectURL(finalBlob);

            resultUrlRef.current = resultUrl;

            setCompressedUrl(resultUrl);
            setCompressedSize(finalBlob.size);
            setCompressedWidth(newWidth);
            setCompressedHeight(newHeight);
        } catch (processingError) {
            console.error("Image processing error:", processingError);

            setError(
                "Something went wrong while processing the image. Please try again."
            );
        } finally {
            setCompressing(false);
        }
    };

    const resetTool = () => {
        if (imageUrlRef.current) {
            URL.revokeObjectURL(imageUrlRef.current);
            imageUrlRef.current = null;
        }

        clearResult();

        setImage(null);
        setQuality(0.75);
        setOutputFormat("jpeg");
        setWidth("");
        setHeight("");
        setKeepAspectRatio(true);
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const savedBytes =
        image && compressedSize
            ? Math.max(0, image.size - compressedSize)
            : 0;

    const compressionPercentage =
        image && compressedSize
            ? Math.max(
                  0,
                  Math.round(((image.size - compressedSize) / image.size) * 100)
              )
            : 0;

    return (
        <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <ImageIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            Smart Image Compressor & Converter
                        </h3>
                        <p className="text-xs text-slate-500">
                            Compress, resize, and convert images locally without server uploads.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {!image ? (
                <label
                    htmlFor="image-upload"
                    className="group block cursor-pointer"
                >
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center hover:border-blue-400 hover:bg-blue-50/20 transition sm:p-12">
                        <div className="flex flex-col items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 text-blue-600 mb-4 group-hover:scale-105 transition-transform">
                                <Upload className="h-8 w-8" />
                            </div>

                            <h2 className="text-lg font-bold text-slate-900">
                                Upload an Image
                            </h2>

                            <p className="mt-1 max-w-md text-xs text-slate-500 leading-relaxed">
                                Select an image from your device to compress, resize, or convert formats securely.
                            </p>

                            <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
                                <Upload className="h-4 w-4" />
                                Choose Image File
                            </span>

                            <p className="mt-4 text-[11px] text-slate-400">
                                JPG, PNG, WebP, GIF, BMP • Max File Size: 20 MB
                            </p>

                            <input
                                id="image-upload"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>
                </label>
            ) : (
                <div className="space-y-8">
                    {/* Selected File Header & Reset */}
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                <ImageIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm break-all">
                                    {image.file.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {formatSize(image.size)} • {image.width} × {image.height} px
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={resetTool}
                            disabled={compressing}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            Choose Another
                        </button>
                    </div>

                    {/* Image Preview Box */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 text-xs">
                            <span className="font-bold text-slate-800">Source Image Preview</span>
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                                {image.width} × {image.height}
                            </span>
                        </div>

                        <div className="flex min-h-64 items-center justify-center bg-slate-100/50 p-6 sm:min-h-72">
                            <img
                                src={image.preview}
                                alt="Selected preview"
                                className="max-h-[22rem] max-w-full rounded-xl object-contain shadow-sm border border-slate-200/60"
                            />
                        </div>
                    </div>

                    {/* Options Grid: Resize & Formats & Quality */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 1. Resize Settings Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                                <Maximize2 className="h-4 w-4 text-blue-600" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Resize Dimensions
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="width" className="mb-1.5 block text-xs font-bold text-slate-600">
                                        Width (px)
                                    </label>
                                    <input
                                        id="width"
                                        type="number"
                                        min="1"
                                        max="10000"
                                        value={width}
                                        onChange={(e) => handleWidthChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="height" className="mb-1.5 block text-xs font-bold text-slate-600">
                                        Height (px)
                                    </label>
                                    <input
                                        id="height"
                                        type="number"
                                        min="1"
                                        max="10000"
                                        value={height}
                                        onChange={(e) => handleHeightChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={keepAspectRatio}
                                    onChange={(e) => setKeepAspectRatio(e.target.checked)}
                                    className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-slate-700">
                                    Maintain Original Aspect Ratio
                                </span>
                            </label>
                        </div>

                        {/* 2. Output Format Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                                <FileType className="h-4 w-4 text-blue-600" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Target Output Format
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(
                                    [
                                        ["jpeg", "JPEG"],
                                        ["png", "PNG"],
                                        ["webp", "WebP"],
                                        ["pdf", "PDF"],
                                    ] as const
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setOutputFormat(value)}
                                        className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                                            outputFormat === value
                                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quality Range Slider */}
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-blue-600" />
                                <label htmlFor="quality" className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Compression Quality
                                </label>
                            </div>
                            <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-3 py-1 rounded-md">
                                {Math.round(quality * 100)}%
                            </span>
                        </div>

                        <input
                            id="quality"
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                        />

                        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                            <span>Smaller File Size</span>
                            <span>
                                {quality <= 0.3
                                    ? "High Compression"
                                    : quality <= 0.55
                                    ? "Balanced"
                                    : quality <= 0.8
                                    ? "Good Quality"
                                    : "Best Quality"}
                            </span>
                            <span>Higher Quality</span>
                        </div>

                        <div className="grid grid-cols-5 gap-2 pt-2">
                            {[20, 40, 60, 80, 100].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setQuality(val / 100)}
                                    className={`rounded-lg border py-1.5 text-xs font-bold transition ${
                                        Math.round(quality * 100) === val
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {val}%
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compress Trigger Button */}
                    <button
                        type="button"
                        onClick={compressImage}
                        disabled={compressing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-60 cursor-pointer"
                    >
                        {compressing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Zap className="h-5 w-5" />
                        )}
                        {compressing
                            ? "Processing Image..."
                            : `Convert & Compress to ${outputFormat.toUpperCase()}`}
                    </button>

                    {/* Compression Results Banner & Side-by-Side Comparison */}
                    {compressedUrl && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Image Processed Successfully! 🎉
                                    </h3>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Your image has been optimized and converted to {outputFormat.toUpperCase()}.
                                    </p>
                                </div>
                            </div>

                            {/* Before vs After Visual Comparison */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700">
                                        Original
                                    </div>
                                    <div className="flex min-h-56 items-center justify-center p-4 bg-slate-50/50">
                                        <img
                                            src={image.preview}
                                            alt="Original image"
                                            className="max-h-64 max-w-full object-contain rounded-md"
                                        />
                                    </div>
                                    <div className="border-t border-slate-200 p-3 text-xs bg-white">
                                        <p className="font-bold text-slate-900">{formatSize(image.size)}</p>
                                        <p className="text-slate-500 text-[11px]">{image.width} × {image.height} px</p>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-emerald-300 bg-white">
                                    <div className="border-b border-emerald-200 bg-emerald-100/60 px-4 py-2.5 text-xs font-bold text-emerald-800 flex justify-between">
                                        <span>Result ({outputFormat.toUpperCase()})</span>
                                        <span className="text-emerald-700 font-extrabold">{compressionPercentage}% Saved</span>
                                    </div>
                                    <div className="flex min-h-56 items-center justify-center p-4 bg-emerald-50/30">
                                        {outputFormat === "pdf" ? (
                                            <div className="text-center p-6">
                                                <div className="text-5xl mb-2">📄</div>
                                                <p className="font-bold text-slate-800 text-xs">PDF Document Ready</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={compressedUrl}
                                                alt="Compressed image"
                                                className="max-h-64 max-w-full object-contain rounded-md"
                                            />
                                        )}
                                    </div>
                                    <div className="border-t border-emerald-200 p-3 text-xs bg-white">
                                        <p className="font-bold text-emerald-700">{formatSize(compressedSize)}</p>
                                        <p className="text-slate-500 text-[11px]">{compressedWidth} × {compressedHeight} px</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stat Highlights */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original</span>
                                    <p className="font-bold text-slate-900 text-xs mt-0.5">{formatSize(image.size)}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Size</span>
                                    <p className="font-bold text-slate-900 text-xs mt-0.5">{formatSize(compressedSize)}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-200 bg-white p-3 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Saved</span>
                                    <p className="font-bold text-emerald-700 text-xs mt-0.5">{formatSize(savedBytes)}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-200 bg-white p-3 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Reduction</span>
                                    <p className="font-bold text-emerald-700 text-xs mt-0.5">{compressionPercentage}%</p>
                                </div>
                            </div>

                            {/* Download Button Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={downloadImage}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                                >
                                    <Download className="h-4 w-4" />
                                    Download {outputFormat.toUpperCase()}
                                </button>

                                <button
                                    type="button"
                                    onClick={compressImage}
                                    disabled={compressing}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-6 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Re-compress
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Privacy Highlights */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">Browser Processing</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Canvas HTML5 rendering engine running locally.</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">Multiple Output Formats</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Export to JPEG, PNG, WebP, or single-page PDF.</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">100% Private</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">No image bytes ever leave your client device.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}