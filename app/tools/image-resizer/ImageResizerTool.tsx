"use client";

import { useState, ChangeEvent } from "react";
import {
    Sparkles,
    Upload,
    Download,
    Zap,
    Layers,
    ShieldCheck,
    BookOpen,
    HelpCircle,
    CheckCircle2,
    Image as ImageIcon
} from "lucide-react";

export default function ImageResizer() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [originalAspect, setOriginalAspect] = useState<number>(1);
    const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
    const [format, setFormat] = useState<string>("image/png");
    const [quality, setQuality] = useState<number>(0.9);
    const [resizedImage, setResizedImage] = useState<string | null>(null);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setImageSrc(event.target?.result as string);
                    setWidth(img.width);
                    setHeight(img.height);
                    setOriginalAspect(img.width / img.height);
                    setResizedImage(null);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
        if (keepAspectRatio && originalAspect) {
            setHeight(Math.round(newWidth / originalAspect));
        }
    };

    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight);
        if (keepAspectRatio && originalAspect) {
            setWidth(Math.round(newHeight * originalAspect));
        }
    };

    const processResize = () => {
        if (!imageSrc) return;
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL(format, quality);
                setResizedImage(dataUrl);
            }
        };
        img.src = imageSrc;
    };

    return (
        <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-8">

                {/* Top Category Tag & Main Title */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100/80 px-3 py-1 text-xs font-bold text-blue-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Image Utility</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                        Image Resizer
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base">
                        Resize images and adjust dimensions without losing quality.
                    </p>
                </div>

                {/* Main Tool Container Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-10 shadow-sm space-y-8">

                    {/* Card Title & Icon Header */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Smart Image Resizer & Converter
                            </h2>
                            <p className="text-xs text-slate-500">
                                Compress, resize, and convert images locally without server uploads.
                            </p>
                        </div>
                    </div>

                    {/* Upload Dropzone */}
                    {!imageSrc ? (
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-blue-400 transition bg-slate-50/30">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-slate-900">Upload an Image</h3>
                                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                        Select an image from your device to compress, resize, or convert formats securely.
                                    </p>
                                </div>
                                <button type="button" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition">
                                    <Upload className="h-4 w-4" />
                                    <span>Choose Image File</span>
                                </button>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    JPG, PNG, WebP, GIF, BMP • Max File Size: 20 MB
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Image Controls Section */
                        <div className="space-y-6 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Width (px)</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Height (px)</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="aspect"
                                    checked={keepAspectRatio}
                                    onChange={(e) => setKeepAspectRatio(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="aspect" className="text-xs font-semibold text-slate-600 cursor-pointer">
                                    Maintain aspect ratio
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Output Format</label>
                                    <select
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                                    >
                                        <option value="image/png">PNG</option>
                                        <option value="image/jpeg">JPEG</option>
                                        <option value="image/webp">WEBP</option>
                                    </select>
                                </div>
                                {format === "image/jpeg" && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Quality ({Math.round(quality * 100)}%)</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={quality}
                                            onChange={(e) => setQuality(Number(e.target.value))}
                                            className="w-full mt-2 accent-blue-600"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={processResize}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                                >
                                    Resize Image Now
                                </button>
                                <button
                                    onClick={() => setImageSrc(null)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    Change Image
                                </button>
                            </div>

                            {resizedImage && (
                                <div className="pt-6 border-t border-slate-100 text-center space-y-4">
                                    <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden">
                                        <img src={resizedImage} alt="Resized output" className="max-h-64 mx-auto object-contain rounded-lg" />
                                    </div>
                                    <a
                                        href={resizedImage}
                                        download={`resized-image.${format.split("/")[1]}`}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download Resized File</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3 Horizontal Feature Badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="rounded-2xl bg-amber-50/50 border border-amber-100/80 p-3.5 flex items-center gap-3">
                            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-xs text-slate-900">Browser Processing</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Canvas HTML5 rendering engine running locally.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-blue-50/50 border border-blue-100/80 p-3.5 flex items-center gap-3">
                            <Layers className="h-4 w-4 text-blue-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-xs text-slate-900">Multiple Output Formats</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Export to JPEG, PNG, WebP, or custom dimensions.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100/80 p-3.5 flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-xs text-slate-900">100% Private</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">No image bytes ever leave your client device.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Tool Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">About Image Resizer</h2>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                        Resize images and adjust dimensions without losing quality. Fast, secure, and browser-processed utility designed for seamless everyday productivity without registration.
                    </p>
                </div>

                {/* Bottom 2 Grid Cards (How to Use & Key Advantages) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* How to Use */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <h3 className="text-sm font-bold text-slate-900">How to Use</h3>
                        </div>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">1</span>
                                <span>Input or select your target file / text.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">2</span>
                                <span>Adjust tool parameters or options if available.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">3</span>
                                <span>Click the action button to process.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">4</span>
                                <span>Download or copy your final output instantly.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Key Advantages */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Layers className="h-4 w-4 text-blue-500" />
                            <h3 className="text-sm font-bold text-slate-900">Key Advantages</h3>
                        </div>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>100% Client-Side privacy assurance</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>No file size limits or hidden charges</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>Optimized for desktop and mobile devices</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>Instant response without queue waiting times</span>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </main>
    );
}