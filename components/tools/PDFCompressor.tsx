"use client";

import { useState } from "react";
import {
    FileText,
    Upload,
    Download,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ShieldCheck,
    Zap,
    Sliders,
    Sparkles,
    FileCheck2,
} from "lucide-react";

type CompressionLevel = "low" | "medium" | "high";

export default function PDFCompressor() {
    const [file, setFile] = useState<File | null>(null);
    const [compressedPdf, setCompressedPdf] = useState<Blob | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [message, setMessage] = useState("");

    const [compressionLevel, setCompressionLevel] =
        useState<CompressionLevel>("medium");

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (selectedFile.type !== "application/pdf") {
            setMessage("Please select a valid PDF file.");
            setFile(null);
            setCompressedPdf(null);
            return;
        }

        const maxFileSize = 25 * 1024 * 1024;

        if (selectedFile.size > maxFileSize) {
            setMessage(
                "PDF file is too large. Please select a PDF smaller than 25 MB."
            );
            setFile(null);
            setCompressedPdf(null);
            return;
        }

        setFile(selectedFile);
        setCompressedPdf(null);
        setMessage("");
    };

    const getCompressionSettings = () => {
        switch (compressionLevel) {
            case "low":
                return {
                    scale: 1.5,
                    quality: 0.85,
                };

            case "high":
                return {
                    scale: 1.0,
                    quality: 0.55,
                };

            case "medium":
            default:
                return {
                    scale: 1.25,
                    quality: 0.70,
                };
        }
    };

    const compressPDF = async () => {
        if (!file) {
            setMessage("Please select a PDF file first.");
            return;
        }

        try {
            setIsCompressing(true);
            setCompressedPdf(null);
            setMessage("Compressing PDF...");

            // Load libraries only in the browser
            const pdfjsLib = await import(
                "pdfjs-dist/legacy/build/pdf.mjs"
            );

            const { PDFDocument } = await import("pdf-lib");

            // Use PDF.js without a separate worker
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                new URL(
                    "pdfjs-dist/build/pdf.worker.min.mjs",
                    import.meta.url
                ).toString();

            const arrayBuffer = await file.arrayBuffer();

            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(arrayBuffer),
                useWorkerFetch: false,
                isEvalSupported: false,
            });

            const pdf = await loadingTask.promise;

            const newPdf = await PDFDocument.create();

            const settings = getCompressionSettings();

            for (
                let pageNumber = 1;
                pageNumber <= pdf.numPages;
                pageNumber++
            ) {
                const page = await pdf.getPage(pageNumber);

                const viewport = page.getViewport({
                    scale: settings.scale,
                });

                const canvas = document.createElement("canvas");

                const context = canvas.getContext("2d");

                if (!context) {
                    throw new Error("Unable to create canvas.");
                }

                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);

                const renderTask = page.render({
                    canvasContext: context,
                    viewport,
                });

                await renderTask.promise;

                const jpegDataUrl = canvas.toDataURL(
                    "image/jpeg",
                    settings.quality
                );

                const jpegBytes = await fetch(jpegDataUrl).then(
                    (response) => response.arrayBuffer()
                );

                const image = await newPdf.embedJpg(jpegBytes);

                const newPage = newPdf.addPage([
                    viewport.width,
                    viewport.height,
                ]);

                newPage.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: viewport.width,
                    height: viewport.height,
                });

                // Release canvas memory
                canvas.width = 1;
                canvas.height = 1;
            }

            const compressedBytes = await newPdf.save({
                useObjectStreams: true,
            });

            const pdfBuffer = new ArrayBuffer(
                compressedBytes.byteLength
            );

            new Uint8Array(pdfBuffer).set(compressedBytes);

            const blob = new Blob([pdfBuffer], {
                type: "application/pdf",
            });

            setCompressedPdf(blob);

            const originalSize = file.size;
            const compressedSize = blob.size;

            if (compressedSize < originalSize) {
                const reduction =
                    ((originalSize - compressedSize) /
                        originalSize) *
                    100;

                setMessage(
                    `Compression completed successfully. Your PDF was reduced by ${reduction.toFixed(
                        1
                    )}%.`
                );
            } else {
                setMessage(
                    "Processing completed, but this PDF could not be reduced further. Try High compression for a smaller file."
                );
            }
        } catch (error) {
            console.error("PDF compression error:", error);

            setCompressedPdf(null);

            setMessage(
                "Unable to compress this PDF. Please try another PDF file."
            );
        } finally {
            setIsCompressing(false);
        }
    };

    const downloadPDF = () => {
        if (!compressedPdf) {
            return;
        }

        const url = URL.createObjectURL(compressedPdf);

        const link = document.createElement("a");

        link.href = url;
        link.download = "compressed.pdf";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        setFile(null);
        setCompressedPdf(null);
        setMessage("");

        const fileInput = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement | null;

        if (fileInput) {
            fileInput.value = "";
        }
    };

    const removeFile = () => {
        setFile(null);
        setCompressedPdf(null);
        setMessage("");

        const fileInput = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement | null;

        if (fileInput) {
            fileInput.value = "";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const originalSize = file?.size ?? 0;

    const compressedSize = compressedPdf?.size ?? 0;

    const reduction =
        originalSize > 0 && compressedSize > 0
            ? Math.max(
                0,
                ((originalSize - compressedSize) /
                    originalSize) *
                100
            )
            : 0;

    const savedBytes =
        originalSize > compressedSize
            ? originalSize - compressedSize
            : 0;

    return (
        <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            PDF Compressor
                        </h3>
                        <p className="text-xs text-slate-500">
                            Reduce the size of your PDF directly in your browser securely.
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload Zone */}
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center hover:border-blue-400 hover:bg-blue-50/20 transition sm:p-10">
                <div className="flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 text-blue-600 mb-4">
                        <Upload className="h-8 w-8" />
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                        Choose a PDF File
                    </h2>

                    <p className="mt-1 max-w-md text-xs text-slate-500 leading-relaxed">
                        Select a PDF document from your computer to compress locally.
                    </p>

                    <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition">
                        <Upload className="h-4 w-4" />
                        <span>Browse PDF File</span>
                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    <p className="mt-4 text-[11px] text-slate-400">
                        PDF format only • Maximum file size: 25 MB
                    </p>
                </div>
            </div>

            {/* Compression Level Selector */}
            {file && (
                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2">
                            <Sliders className="h-4 w-4 text-blue-600" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                Compression Level
                            </h3>
                        </div>

                        <span className="rounded-md bg-blue-100/70 px-2.5 py-1 text-xs font-bold text-blue-700">
                            {compressionLevel === "low"
                                ? "Quality Priority"
                                : compressionLevel === "medium"
                                    ? "Recommended"
                                    : "Size Priority"}
                        </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                        Choose the right balance between PDF visual clarity and output file size.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => setCompressionLevel("low")}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${compressionLevel === "low"
                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-blue-300"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 text-sm">Low</p>
                                {compressionLevel === "low" && (
                                    <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                        Selected
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">Better quality</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCompressionLevel("medium")}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${compressionLevel === "medium"
                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-blue-300"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 text-sm">Medium</p>
                                {compressionLevel === "medium" && (
                                    <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                        Selected
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">Recommended</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCompressionLevel("high")}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${compressionLevel === "high"
                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-blue-300"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 text-sm">High</p>
                                {compressionLevel === "high" && (
                                    <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                        Selected
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">Smaller size</p>
                        </button>
                    </div>
                </div>
            )}

            {/* Selected File Details */}
            {file && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-bold text-slate-900 text-sm">
                                        {file.name}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                                        <span>
                                            Original size:{" "}
                                            <strong className="text-slate-800">
                                                {formatFileSize(originalSize)}
                                            </strong>
                                        </span>
                                        <span>•</span>
                                        <span>
                                            Compression:{" "}
                                            <strong className="capitalize text-blue-600">
                                                {compressionLevel}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    disabled={isCompressing}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remove File
                                </button>

                                <button
                                    type="button"
                                    onClick={compressPDF}
                                    disabled={isCompressing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
                                >
                                    {isCompressing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Compressing PDF...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-4 w-4" />
                                            <span>Compress PDF</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-2.5 text-xs text-slate-500 flex justify-between items-center">
                        <span>Selected compression level</span>
                        <span className="font-bold text-slate-700">
                            {compressionLevel === "low"
                                ? "Low — Quality Priority"
                                : compressionLevel === "medium"
                                    ? "Medium — Recommended"
                                    : "High — Size Priority"}
                        </span>
                    </div>
                </div>
            )}

            {/* Status / Alert Message */}
            {message && (
                <div
                    className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium ${message.includes("successfully")
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : message.includes("too large") || message.includes("could not")
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : message.includes("Please")
                                    ? "border-rose-200 bg-rose-50 text-rose-800"
                                    : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                >
                    {message.includes("successfully") ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : message.includes("too large") || message.includes("could not") ? (
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{message}</span>
                </div>
            )}

            {/* Processing Result Details */}
            {compressedPdf && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60 shadow-sm">
                    <div className="border-b border-emerald-100 bg-emerald-100/50 px-5 py-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                            <FileCheck2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">
                                Compression Complete! 🎉
                            </h3>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Your PDF has been processed and optimized successfully.
                            </p>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Original Size
                                </span>
                                <p className="font-bold text-slate-900 text-xs mt-0.5">
                                    {formatFileSize(originalSize)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Processed Size
                                </span>
                                <p className="font-bold text-slate-900 text-xs mt-0.5">
                                    {formatFileSize(compressedSize)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-emerald-200 bg-white p-3 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                    Reduction
                                </span>
                                <p className="font-bold text-emerald-700 text-xs mt-0.5">
                                    {reduction > 0 ? `${reduction.toFixed(1)}%` : "0%"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-blue-200 bg-white p-3 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                    Space Saved
                                </span>
                                <p className="font-bold text-blue-700 text-xs mt-0.5">
                                    {formatFileSize(savedBytes)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white p-4">
                            <div>
                                <p className="font-bold text-emerald-800 text-xs">
                                    {reduction > 0
                                        ? `Your PDF is ${reduction.toFixed(1)}% smaller!`
                                        : "Your PDF size could not be reduced further."}
                                </p>
                                <p className="text-[11px] text-emerald-600 mt-0.5">
                                    Compression level used: <span className="font-bold capitalize">{compressionLevel}</span>
                                </p>
                            </div>

                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                {compressionLevel === "low"
                                    ? "Quality Priority"
                                    : compressionLevel === "medium"
                                        ? "Recommended"
                                        : "Size Priority"}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={downloadPDF}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                        >
                            <Download className="h-4 w-4" />
                            Download Compressed PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Privacy Badges */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">Browser Execution</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Engineered via PDF.js & pdf-lib right in your browser.</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">Custom Quality Presets</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Choose Low, Medium, or High compression target modes.</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">100% Private</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Files never travel to any server or cloud database.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}