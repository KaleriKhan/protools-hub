"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Palette, Layers } from "lucide-react";

export default function QRCodeGenerator() {
    const [text, setText] = useState("https://protoolshub.com");
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateQRCode = useCallback(() => {
        if (canvasRef.current && text.trim()) {
            QRCode.toCanvas(
                canvasRef.current,
                text,
                {
                    width: size,
                    margin: 2,
                    color: {
                        dark: fgColor,
                        light: bgColor,
                    },
                },
                (error) => {
                    if (error) console.error(error);
                }
            );
        }
    }, [text, size, fgColor, bgColor]);

    useEffect(() => {
        generateQRCode();
    }, [generateQRCode]);

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement("a");
        link.download = "qr-code.png";
        link.href = canvasRef.current.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                    <QrCode className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Free QR Code Generator</h3>
                    <p className="text-xs text-slate-500">Create customizable, high-resolution QR codes in seconds.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Left Inputs */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                            Website URL or Text
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text or URL..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                        />
                    </div>

                    {/* Customizations */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                <Palette className="h-3.5 w-3.5" /> QR Color
                            </label>
                            <input
                                type="color"
                                value={fgColor}
                                onChange={(e) => setFgColor(e.target.value)}
                                className="h-10 w-full rounded-xl border border-slate-200 p-1 cursor-pointer bg-white"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                <Palette className="h-3.5 w-3.5" /> Background
                            </label>
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="h-10 w-full rounded-xl border border-slate-200 p-1 cursor-pointer bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                            <Layers className="h-3.5 w-3.5" /> Resolution Size
                        </label>
                        <select
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                            className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value={180}>Small (180x180)</option>
                            <option value={256}>Medium (256x256)</option>
                            <option value={384}>Large (384x384)</option>
                        </select>
                    </div>
                </div>

                {/* Right Canvas Preview */}
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 text-center">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md mb-6">
                        <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={!text.trim()}
                        className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        Download PNG Image
                    </button>
                </div>

            </div>

        </div>
    );
}