"use client";

import React, { useState } from "react";
import { Sparkles, Upload, Download, RefreshCw, Image as ImageIcon, ShieldCheck, CheckCircle2, Trash2, Zap, HelpCircle } from "lucide-react";

export default function BackgroundRemover() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressText, setProgressText] = useState("Optimizing & Processing AI...");
    const [dragActive, setDragActive] = useState(false);

    // Helper function to resize image for fast AI processing
    const resizeImage = (dataUrl: string, maxWidth = 640, maxHeight = 640): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.src = dataUrl;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
                setSelectedImage(uploadEvent.target?.result as string);
                setProcessedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProcessAi = async () => {
        if (!selectedImage) return;
        setIsProcessing(true);
        setProgressText("Optimizing image for speed...");

        try {
            // Resize image first for lightning-fast server processing
            const optimizedImage = await resizeImage(selectedImage, 640, 640);

            setProgressText("Removing background instantly...");

            const res = await fetch("/api/remove-bg", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: optimizedImage }),
            });

            const data = await res.json();
            if (data.success) {
                setProcessedImage(data.image);
            } else {
                alert("Processing failed. Please try another image.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setProcessedImage(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">

            {/* Clean Professional Card Wrapper */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-10 shadow-xl shadow-slate-100 space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                            <Sparkles className="h-7 w-7 text-amber-300 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">AI Background Remover</h1>
                            <p className="text-xs font-medium text-slate-500">Remove image backgrounds instantly with high-precision server AI.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold w-fit">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Lightning Fast AI</span>
                    </div>
                </div>

                {/* Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left Box: Upload & Original */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">1</span>
                                Upload Source Image
                            </span>
                            {selectedImage && (
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Clear Image</span>
                                </button>
                            )}
                        </div>

                        {!selectedImage ? (
                            <label
                                className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${dragActive ? "border-indigo-600 bg-indigo-50/70" : "border-slate-300 bg-slate-50 hover:bg-slate-100/60"
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) {
                                        const r = new FileReader();
                                        r.onload = (ev) => setSelectedImage(ev.target?.result as string);
                                        r.readAsDataURL(file);
                                    }
                                }}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center space-y-3">
                                    <div className="p-4 bg-white shadow-md rounded-2xl text-indigo-600">
                                        <Upload className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-800">Click to upload or drag & drop</p>
                                        <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 10MB</p>
                                    </div>
                                    <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                                        Browse File
                                    </span>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        ) : (
                            <div className="relative w-full h-80 rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center shadow-inner">
                                <img src={selectedImage} alt="Original Source" className="max-h-full max-w-full object-contain p-2" />
                                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold text-white uppercase tracking-wider">
                                    Original Source
                                </div>
                            </div>
                        )}

                        {selectedImage && !processedImage && (
                            <button
                                onClick={handleProcessAi}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>{progressText}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 text-amber-300" />
                                        <span>Remove Background Fast AI</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Right Box: Output Result */}
                    <div className="space-y-4">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">2</span>
                            Transparent Output Result
                        </span>

                        <div className="w-full h-80 rounded-3xl border border-slate-200 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] flex items-center justify-center relative overflow-hidden shadow-inner">
                            {processedImage ? (
                                <>
                                    <img src={processedImage} alt="Transparent Output" className="max-h-full max-w-full object-contain p-2 relative z-10 drop-shadow-lg" />
                                    <div className="absolute bottom-3 left-3 bg-emerald-600 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold text-white uppercase tracking-wider z-20 flex items-center gap-1.5 shadow">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                                        <span>Background Removed</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6 space-y-3">
                                    <div className="inline-flex p-4 bg-white shadow-md rounded-2xl text-slate-400">
                                        <ImageIcon className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-700">Transparent result will appear here</p>
                                        <p className="text-[11px] text-slate-400">Upload source image and click process</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {processedImage && (
                            <a
                                href={processedImage}
                                download="transparent-protools.png"
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30"
                            >
                                <Download className="h-4 w-4" />
                                <span>Download High-Res PNG</span>
                            </a>
                        )}
                    </div>

                </div>

                {/* Feature Highlights Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Zap className="h-4 w-4 text-indigo-600" />
                            Optimized Fast AI Cutout
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Auto-downscales photos for lightning-fast server performance.
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            Secure & Reliable
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Powered by high-precision server-side neural networks.
                        </p>
                    </div>
                </div>

            </div>

            {/* About Section */}
            <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">About AI Background Remover</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Remove image backgrounds instantly with high-precision AI edge detection. Fast, secure, and server-processed utility designed for seamless everyday productivity without registration.
                </p>
            </div>

            {/* How to Use & Key Advantages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* How to Use */}
                <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">How to Use</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
                            <p className="text-xs text-slate-600 pt-1">Upload or drag & drop your image file.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">2</span>
                            <p className="text-xs text-slate-600 pt-1">Click remove background for fast AI processing.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">3</span>
                            <p className="text-xs text-slate-600 pt-1">Download your clean transparent PNG instantly.</p>
                        </div>
                    </div>
                </div>

                {/* Key Advantages */}
                <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Key Advantages</h3>
                    </div>
                    <div className="space-y-3.5">
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Real AI cutout with optimized speed</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Server-accelerated edge detection</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Optimized for desktop and mobile devices</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Lightning fast response on all images</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}