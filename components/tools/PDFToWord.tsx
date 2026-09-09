"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
} from "docx";
import { createWorker } from "tesseract.js";
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
    RefreshCw,
    Sparkles
} from "lucide-react";

/* ==========================================================================
   PDF.js Worker
   ========================================================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/* ==========================================================================
   Types
   ========================================================================== */

type ConversionStatus =
    | "idle"
    | "reading"
    | "ocr"
    | "creating"
    | "done"
    | "error";

/* ==========================================================================
   RTL Detection
   ========================================================================== */

const containsRTL = (text: string) => {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
};

/* ==========================================================================
   PDF To Word
   ========================================================================== */

export default function PDFToWord() {
    const [file, setFile] = useState<File | null>(null);
    const [converting, setConverting] = useState(false);
    const [status, setStatus] = useState<ConversionStatus>("idle");
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [error, setError] = useState("");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    /* ==========================================================================
       File Selection
       ========================================================================== */

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        const isPDF =
            selectedFile.type === "application/pdf" ||
            selectedFile.name.toLowerCase().endsWith(".pdf");

        if (!isPDF) {
            setError("Please select a valid PDF file.");
            event.target.value = "";
            return;
        }

        if (selectedFile.size === 0) {
            setError("The selected PDF file is empty.");
            event.target.value = "";
            return;
        }

        if (selectedFile.size > 100 * 1024 * 1024) {
            setError("PDF file is too large. Please select a PDF smaller than 100 MB.");
            event.target.value = "";
            return;
        }

        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
        }

        setFile(selectedFile);
        setError("");
        setStatus("idle");
        setProgress(0);
        setStatusText("");
        setDownloadUrl(null);

        event.target.value = "";
    };

    /* ==========================================================================
       Remove File
       ========================================================================== */

    const removeFile = () => {
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
        }

        setFile(null);
        setError("");
        setStatus("idle");
        setProgress(0);
        setStatusText("");
        setDownloadUrl(null);
    };

    /* ==========================================================================
       Extract Normal PDF Text
       ========================================================================== */

    const extractTextFromPage = async (
        page: pdfjsLib.PDFPageProxy
    ) => {
        const textContent = await page.getTextContent();

        const text = textContent.items
            .map((item) => {
                if ("str" in item) {
                    return item.str;
                }
                return "";
            })
            .join(" ");

        return text.trim();
    };

    /* ==========================================================================
       Render PDF Page For OCR
       ========================================================================== */

    const renderPageToImage = async (
        page: pdfjsLib.PDFPageProxy
    ) => {
        const viewport = page.getViewport({ scale: 4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (!context) {
            throw new Error("Could not create canvas context.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
            canvasContext: context,
            viewport,
        }).promise;

        const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];

            const gray = 0.299 * red + 0.587 * green + 0.114 * blue;
            let value = (gray - 128) * 1.08 + 128;

            value = Math.max(0, Math.min(255, value));

            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }

        context.putImageData(imageData, 0, 0);

        const image = canvas.toDataURL("image/png");
        canvas.remove();

        return image;
    };

    /* ==========================================================================
       OCR One Page
       ========================================================================== */

    const performOCR = async (
        page: pdfjsLib.PDFPageProxy,
        worker: Awaited<ReturnType<typeof createWorker>>
    ) => {
        const image = await renderPageToImage(page);
        const result = await worker.recognize(image);
        return result.data.text.trim();
    };

    /* ==========================================================================
       Convert PDF To Word
       ========================================================================== */

    const convertToWord = async () => {
        if (!file || converting) {
            return;
        }

        let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

        try {
            setConverting(true);
            setError("");
            setDownloadUrl(null);
            setProgress(0);

            setStatus("reading");
            setStatusText("Opening PDF...");

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            const totalPages = pdf.numPages;

            if (!totalPages) {
                throw new Error("This PDF does not contain any pages.");
            }

            const extractedPages: string[] = new Array(totalPages).fill("");
            const pagesNeedingOCR: number[] = [];

            for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
                setStatusText(`Reading page ${pageNumber} of ${totalPages}...`);
                const page = await pdf.getPage(pageNumber);
                const text = await extractTextFromPage(page);

                if (text.trim()) {
                    extractedPages[pageNumber - 1] = text;
                } else {
                    pagesNeedingOCR.push(pageNumber);
                }

                setProgress(Math.round((pageNumber / totalPages) * 30));
            }

            if (pagesNeedingOCR.length > 0) {
                setStatus("ocr");
                setStatusText(
                    `Preparing OCR for ${pagesNeedingOCR.length} scanned page${pagesNeedingOCR.length === 1 ? "" : "s"
                    }...`
                );

                const ocrLanguage = "eng+urd";

                worker = await createWorker(ocrLanguage);

                await worker.setParameters({
                    preserve_interword_spaces: "1",
                    user_defined_dpi: "300",
                });

                for (let index = 0; index < pagesNeedingOCR.length; index++) {
                    const pageNumber = pagesNeedingOCR[index];

                    setStatusText(
                        `OCR processing page ${pageNumber} of ${totalPages}...`
                    );

                    const page = await pdf.getPage(pageNumber);
                    const text = await performOCR(page, worker);

                    extractedPages[pageNumber - 1] = text;

                    setProgress(
                        30 +
                        Math.round(
                            ((index + 1) / pagesNeedingOCR.length) * 55
                        )
                    );
                }

                await worker.terminate();
                worker = null;
            }

            const hasAnyText = extractedPages.some(
                (pageText) => pageText.trim().length > 0
            );

            if (!hasAnyText) {
                throw new Error("No readable text could be detected from this PDF.");
            }

            setStatus("creating");
            setStatusText("Creating Word document...");
            setProgress(90);

            const paragraphs: Paragraph[] = [];

            extractedPages.forEach((pageText, pageIndex) => {
                const cleanText = pageText.trim();

                if (cleanText) {
                    const lines = cleanText
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter(Boolean);

                    const finalLines = lines.length > 0 ? lines : [cleanText];

                    finalLines.forEach((line) => {
                        const isRTL = containsRTL(line);

                        paragraphs.push(
                            new Paragraph({
                                bidirectional: isRTL,
                                alignment: isRTL
                                    ? AlignmentType.RIGHT
                                    : AlignmentType.LEFT,
                                spacing: { after: 120 },
                                children: [
                                    new TextRun({
                                        text: line,
                                        rightToLeft: isRTL,
                                        font: {
                                            name: isRTL
                                                ? "Noto Nastaliq Urdu"
                                                : "Arial",
                                        },
                                        size: 24,
                                    }),
                                ],
                            })
                        );
                    });
                }

                if (pageIndex < extractedPages.length - 1) {
                    paragraphs.push(
                        new Paragraph({
                            children: [new TextRun("")],
                            spacing: { after: 200 },
                        })
                    );
                }
            });

            if (paragraphs.length === 0) {
                throw new Error("No readable text was found in this PDF.");
            }

            setStatusText("Generating Word file...");
            setProgress(95);

            const wordDocument = new Document({
                sections: [
                    {
                        properties: {},
                        children: paragraphs,
                    },
                ],
            });

            const blob = await Packer.toBlob(wordDocument);
            const url = URL.createObjectURL(blob);

            setDownloadUrl(url);
            setProgress(100);
            setStatus("done");
            setStatusText("Conversion completed successfully!");
        } catch (err) {
            console.error("PDF to Word conversion error:", err);
            setStatus("error");
            setProgress(0);
            setStatusText("");
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while converting the PDF."
            );
        } finally {
            if (worker) {
                try {
                    await worker.terminate();
                } catch {
                    // Ignore cleanup errors.
                }
            }
            setConverting(false);
        }
    };

    /* ==========================================================================
       Download Word
       ========================================================================== */

    const downloadWord = () => {
        if (!downloadUrl || !file) {
            return;
        }

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${file.name.replace(/\.pdf$/i, "")}.docx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    /* ==========================================================================
       UI
       ========================================================================== */

    return (
        <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">PDF to Word Converter</h3>
                        <p className="text-xs text-slate-500">Convert normal and scanned PDF files into editable Word documents.</p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && !file && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Upload Zone */}
            {!file ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center hover:border-blue-400 hover:bg-blue-50/20 transition">
                    <div className="flex flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 text-blue-600 mb-4">
                            <Upload className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Upload your PDF File</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-md">
                            Normal PDFs and scanned documents containing English and Urdu text are supported automatically.
                        </p>
                        <span className="text-[11px] text-slate-400 mt-1">Maximum file size: 100 MB</span>

                        <label className="mt-6 inline-flex items-center gap-2 cursor-pointer rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition">
                            <Upload className="h-4 w-4" />
                            Choose PDF Document
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                    {/* Selected File Details */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-4">
                        <div>
                            <p className="break-all font-bold text-slate-900 text-sm">{file.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        {!converting && (
                            <button
                                type="button"
                                onClick={removeFile}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        )}
                    </div>

                    {/* OCR Info Badge */}
                    <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3.5 text-xs text-blue-800 font-medium">
                        <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>OCR Engine Ready: Scanned PDFs automatically process English + Urdu Nastaliq text.</span>
                    </div>

                    {/* Convert Button */}
                    {!downloadUrl && (
                        <button
                            type="button"
                            onClick={convertToWord}
                            disabled={converting}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-60 cursor-pointer"
                        >
                            {converting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                            {converting ? "Processing Conversion..." : "Convert PDF to Word"}
                        </button>
                    )}

                    {/* Progress Bar & Status Text */}
                    {converting && (
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-600">{statusText}</span>
                                <span className="text-blue-600 font-bold">{progress}%</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Error Box */}
                    {status === "error" && error && (
                        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700">
                            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Download Banner */}
                    {status === "done" && downloadUrl && (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white mx-auto mb-3 shadow-md">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Conversion Completed!</h3>
                            <p className="text-xs text-slate-600 mt-1">Your editable Word document (.docx) is ready for download.</p>

                            <div className="mt-5 flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={downloadWord}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Word Document
                                </button>

                                <button
                                    type="button"
                                    onClick={convertToWord}
                                    disabled={converting}
                                    className="inline-flex items-center gap-2 rounded-xl border border-blue-600 bg-white px-6 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition disabled:opacity-60"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Re-convert
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Features Info Badges */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">Text PDFs</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Extract text directly from digital PDF documents.</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">Scanned PDFs</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Auto OCR extraction for scanned English & Urdu text.</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-slate-900">100% Private</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Files process strictly inside your local browser.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}