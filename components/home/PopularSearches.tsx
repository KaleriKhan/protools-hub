"use client";

import React from "react";

const searches = [
    "PDF to Word",
    "Image Compressor",
    "QR Code Generator",
    "Password Generator",
    "JSON Formatter",
    "Age Calculator",
];

export default function PopularSearches() {
    return (
        <div className="mt-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Popular Searches
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
                {searches.map((item) => (
                    <button
                        key={item}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-md cursor-pointer"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}