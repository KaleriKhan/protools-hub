"use client";

import { useState, useRef, ChangeEvent } from "react";

export default function ImageResizer() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [originalAspect, setOriginalAspect] = useState<number>(1);
    const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
    const [format, setFormat] = useState<string>("image/png");
    const [quality, setQuality] = useState<number>(0.9);
    const [resizedImage, setResizedImage] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                    Image Resizer & Converter
                </h1>
                <p className="text-slate-600">
                    Resize, adjust dimensions, and convert images instantly in your browser. 100% private.
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Upload Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                </div>

                {imageSrc && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Width (px)
                                </label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Height (px)
                                </label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="aspect"
                                checked={keepAspectRatio}
                                onChange={(e) => setKeepAspectRatio(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="aspect" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Maintain aspect ratio
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Export Format
                                </label>
                                <select
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="image/png">PNG</option>
                                    <option value="image/jpeg">JPG / JPEG</option>
                                    <option value="image/webp">WEBP</option>
                                </select>
                            </div>

                            {format === "image/jpeg" && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Quality ({Math.round(quality * 100)}%)
                                    </label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={quality}
                                        onChange={(e) => setQuality(Number(e.target.value))}
                                        className="w-full mt-2"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={processResize}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Resize Image
                        </button>

                        {resizedImage && (
                            <div className="mt-8 text-center pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Preview & Download</h3>
                                <div className="max-w-md mx-auto mb-4 border rounded-lg overflow-hidden bg-slate-100 p-2">
                                    <img src={resizedImage} alt="Resized output" className="max-h-64 mx-auto object-contain" />
                                </div>
                                <a
                                    href={resizedImage}
                                    download={`resized-image.${format.split("/")[1]}`}
                                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
                                >
                                    Download Image
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}