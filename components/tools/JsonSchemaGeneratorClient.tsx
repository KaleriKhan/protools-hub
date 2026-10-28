"use client";

import React, { useState } from "react";
import { Code, Copy, Check, ShieldCheck, HelpCircle, FileJson, Zap, CheckCircle2, Trash2 } from "lucide-react";

export default function JsonSchemaGeneratorClient() {
    const [schemaType, setSchemaType] = useState("Article");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [author, setAuthor] = useState("");
    const [datePublished, setDatePublished] = useState("");
    const [copied, setCopied] = useState(false);

    // Generate JSON-LD based on selected type and user inputs
    const generateSchema = () => {
        let schemaObj: any = {
            "@context": "https://schema.org",
            "@type": schemaType,
        };

        if (schemaType === "Article" || schemaType === "BlogPosting") {
            schemaObj = {
                ...schemaObj,
                headline: name || "Article Title",
                description: description || "Article description goes here.",
                url: url || "https://myprotoolshub.com",
                author: {
                    "@type": "Person",
                    name: author || "Author Name",
                },
                datePublished: datePublished || new Date().toISOString().split("T")[0],
            };
        } else if (schemaType === "Organization") {
            schemaObj = {
                ...schemaObj,
                name: name || "Organization Name",
                url: url || "https://myprotoolshub.com",
                logo: author || "https://myprotoolshub.com/logo.png",
                description: description || "Organization description.",
            };
        } else if (schemaType === "WebSite") {
            schemaObj = {
                ...schemaObj,
                name: name || "Website Name",
                url: url || "https://myprotoolshub.com",
                description: description || "Website description.",
            };
        } else if (schemaType === "SoftwareApplication") {
            schemaObj = {
                ...schemaObj,
                name: name || "Tool Name",
                url: url || "https://myprotoolshub.com",
                operatingSystem: "All",
                applicationCategory: "DeveloperApplication",
                offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                },
                description: description || "Utility description.",
            };
        }

        return JSON.stringify(schemaObj, null, 2);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateSchema());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setName("");
        setDescription("");
        setUrl("");
        setAuthor("");
        setDatePublished("");
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">

            {/* Main Tool Card Wrapper */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-10 shadow-xl shadow-slate-100 space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                            <FileJson className="h-7 w-7 text-amber-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">JSON-LD Schema Generator</h1>
                            <p className="text-xs font-medium text-slate-500">Generate Google-compliant structured data markup instantly for high SEO rankings.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold hover:bg-rose-100 transition shadow-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Clear Data</span>
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold w-fit">
                            <ShieldCheck className="h-4 w-4" />
                            <span>SEO Rich Snippets Ready</span>
                        </div>
                    </div>
                </div>

                {/* Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Form Inputs */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Schema Type</label>
                            <select
                                value={schemaType}
                                onChange={(e) => setSchemaType(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                            >
                                <option value="Article">Article</option>
                                <option value="BlogPosting">Blog Posting</option>
                                <option value="Organization">Organization</option>
                                <option value="WebSite">WebSite</option>
                                <option value="SoftwareApplication">Software Application</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Name / Headline</label>
                            <input
                                type="text"
                                placeholder="e.g. ProTools Hub Toolkit"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Description</label>
                            <textarea
                                rows={3}
                                placeholder="Brief summary or description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 transition resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Canonical URL</label>
                            <input
                                type="url"
                                placeholder="https://myprotoolshub.com/tool-page"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                            />
                        </div>

                        {(schemaType === "Article" || schemaType === "BlogPosting") && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Author Name</label>
                                    <input
                                        type="text"
                                        placeholder="Kaleri Khan"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Publish Date</label>
                                    <input
                                        type="date"
                                        value={datePublished}
                                        onChange={(e) => setDatePublished(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Output Code Box */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                <Code className="h-4 w-4 text-indigo-600" />
                                Generated JSON-LD Markup
                            </span>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                                <span>{copied ? "Copied!" : "Copy Code"}</span>
                            </button>
                        </div>

                        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 p-6 shadow-inner flex flex-col">
                            <pre className="flex-1 overflow-auto text-xs font-mono text-emerald-400 leading-relaxed scrollbar-thin">
                                {generateSchema()}
                            </pre>
                            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                                <span>Format: application/ld+json</span>
                                <span className="text-indigo-400 font-bold">Google Rich Results Compatible</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 md:p-8 shadow-xl shadow-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">About JSON-LD Schema Generator</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Create Google-compliant structured data markup instantly right inside your browser. Powered by clean client-side JavaScript, ensuring complete privacy with zero server file uploads and maximum SEO visibility.
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
                            <p className="text-xs text-slate-600 pt-1">Select your desired schema type from the dropdown menu.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">2</span>
                            <p className="text-xs text-slate-600 pt-1">Fill in your website or article details into the input fields.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">3</span>
                            <p className="text-xs text-slate-600 pt-1">Click copy code and paste your structured data markup instantly.</p>
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
                            <span>100% free with no registration or limits</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Google Rich Results & SEO friendly markup</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Zero cloud uploads, guaranteeing maximum privacy</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Lightning-fast client-side JavaScript execution</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}