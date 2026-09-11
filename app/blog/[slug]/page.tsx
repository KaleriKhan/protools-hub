"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles } from "lucide-react";

export default function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    // Unwrap the async params Promise using React.use()
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const slugTitleMap: Record<
        string,
        {
            title: string;
            category: string;
            date: string;
            readTime: string;
            author: string;
            content: string;
        }
    > = {
        "how-to-resize-images-without-losing-quality": {
            title: "How to Resize Images Without Losing Quality (Fast & Free)",
            category: "Image Optimization",
            date: "Sep 11, 2026",
            readTime: "4 min read",
            author: "Dev Team",
            content:
                "Large image file sizes slow down website loading speeds and waste bandwidth. Learn how to crop, adjust dimensions, and convert images into WebP/PNG formats directly in your browser using local HTML5 canvas processing. Zero server uploads, instant export, and 100% privacy guaranteed.",
        },
        "how-local-image-compression-speeds-up-seo": {
            title: "How Local Image Compression Speeds Up Your Website SEO",
            category: "Optimization",
            date: "Sep 04, 2026",
            readTime: "4 min read",
            author: "Dev Team",
            content:
                "Learn how client-side image optimization reduces page load times and boosts Google ranking without sacrificing visual clarity. By processing images directly in the browser canvas using WebAssembly and WebP encoding, you eliminate server round-trips while maintaining crisp quality for your users.",
        },
        "understanding-pdf-compression": {
            title: "Understanding PDF Compression: Lossless vs Lossy Settings",
            category: "Tutorials",
            date: "Sep 02, 2026",
            readTime: "6 min read",
            author: "Engineering",
            content:
                "A deep dive into how PDF pages render into high-resolution images and re-encode to save up to 80% storage space. We break down when to use vector preserve algorithms versus raster compression.",
        },
        "why-in-browser-file-processing-means-100-percent-privacy": {
            title: "Why In-Browser File Processing Means 100% Privacy",
            category: "Security",
            date: "Aug 28, 2026",
            readTime: "3 min read",
            author: "Security Team",
            content:
                "Why uploading sensitive business files to external cloud servers is a risk, and how WebAssembly keeps data strictly on your local device without sending byte data over network channels.",
        },
    };

    const post = slugTitleMap[slug] || {
        title: slug ? slug.replace(/-/g, " ").toUpperCase() : "ARTICLE DETAILS",
        category: "General",
        date: "Sep 04, 2026",
        readTime: "5 min read",
        author: "ProTools Hub",
        content:
            "This article discusses modern client-side web optimization, performance practices, and browser security guidelines.",
    };

    return (
        <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <article className="max-w-3xl mx-auto space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Articles</span>
                </Link>

                <div className="space-y-4">
                    <span className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-100">
                        {post.category}
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 border-y border-slate-100 py-3">
                        <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                            <span>{post.author}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-blue-600" />
                            <span>{post.readTime}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            <span>{post.date}</span>
                        </div>
                    </div>
                </div>

                <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 pt-2">
                    <p>{post.content}</p>
                    <p>
                        Client-side processing guarantees that no third-party server intercepts your confidential data. With local browser APIs, performance scales with your machine's hardware capabilities rather than waiting for remote cloud queue servers.
                    </p>

                    {/* CTA Box linking directly to the Image Resizer Tool */}
                    {slug === "how-to-resize-images-without-losing-quality" && (
                        <div className="mt-6 rounded-2xl bg-blue-50/60 border border-blue-100 p-6 space-y-3">
                            <h3 className="font-bold text-slate-900 text-base">
                                Need to Resize an Image Right Now?
                            </h3>
                            <p className="text-xs text-slate-600">
                                Use our 100% free, browser-native Image Resizer tool. Zero uploads required.
                            </p>
                            <Link
                                href="/tools/image-resizer"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                            >
                                <span>Try Free Image Resizer Tool</span>
                                <span>→</span>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span>ProTools Hub Knowledge Base</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => alert("Article link copied to clipboard!")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share Article</span>
                    </button>
                </div>
            </article>
        </main>
    );
}