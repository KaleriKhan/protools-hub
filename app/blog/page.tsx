"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Clock,
    User,
    ArrowRight,
    Tag,
    Sparkles,
    BookOpen,
    Mail,
    CheckCircle2,
} from "lucide-react";

type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    featured?: boolean;
};

const POSTS: BlogPost[] = [
    {
        id: "1",
        slug: "how-to-resize-images-without-losing-quality",
        title: "How to Resize Images Without Losing Quality (Fast & Free)",
        excerpt:
            "Learn how to crop, adjust dimensions, and convert images into WebP/PNG formats directly in your browser without losing quality.",
        category: "Optimization",
        author: "Dev Team",
        date: "Sep 11, 2026",
        readTime: "4 min read",
        featured: true,
    },
    {
        id: "2",
        slug: "how-ai-text-summarization-saves-time",
        title: "How AI Text Summarization Saves Hours of Reading Time",
        excerpt:
            "Extract key insights from lengthy articles, essays, and reports in seconds with complete privacy.",
        category: "Tools",
        author: "Dev Team",
        date: "Sep 11, 2026",
        readTime: "5 min read",
    },
    {
        id: "3",
        slug: "how-local-image-compression-speeds-up-seo",
        title: "How Local Image Compression Speeds Up Your Website SEO",
        excerpt:
            "Learn how client-side image optimization reduces page load times and boosts Google ranking without sacrificing visual clarity.",
        category: "Optimization",
        author: "Dev Team",
        date: "Sep 04, 2026",
        readTime: "4 min read",
    },
    {
        id: "4",
        slug: "understanding-pdf-compression",
        title: "Understanding PDF Compression: Lossless vs Lossy Settings",
        excerpt:
            "A deep dive into how PDF pages render into high-resolution images and re-encode to save up to 80% storage space.",
        category: "Tutorials",
        author: "Engineering",
        date: "Aug 28, 2026",
        readTime: "6 min read",
    },
    {
        id: "5",
        slug: "why-in-browser-file-processing-means-100-percent-privacy",
        title: "Why In-Browser File Processing Means 100% Privacy",
        excerpt:
            "Why uploading sensitive business files to external cloud servers is a risk, and how WebAssembly keeps data local.",
        category: "Security",
        author: "Security Team",
        date: "Aug 15, 2026",
        readTime: "3 min read",
    },
];

const CATEGORIES = ["All", "Optimization", "Tutorials", "Security", "Tools"];

export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const filteredPosts = POSTS.filter((post) => {
        const matchesCategory =
            selectedCategory === "All" || post.category === selectedCategory;
        const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredPost = POSTS.find((p) => p.featured);

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Insights & Guides</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Resources & Latest Articles
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Discover tips on web optimization, file compression workflows, and browser-first tools.
                    </p>
                </div>

                {/* Search & Category Filter Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    {/* Categories */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${selectedCategory === cat
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition"
                        />
                    </div>
                </div>

                {/* Featured Post Card */}
                {featuredPost && selectedCategory === "All" && !searchQuery && (
                    <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="group block relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40 transition hover:border-blue-400 hover:shadow-2xl"
                    >
                        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                        Featured
                                    </span>
                                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                        {featuredPost.category}
                                    </span>
                                </div>

                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                                    {featuredPost.title}
                                </h2>

                                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                    {featuredPost.excerpt}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-2">
                                    <span className="flex items-center gap-1.5 text-slate-700">
                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                        {featuredPost.author}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {featuredPost.readTime}
                                    </span>
                                    <span>•</span>
                                    <span>{featuredPost.date}</span>
                                </div>
                            </div>

                            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white group-hover:bg-blue-600 transition shrink-0">
                                <span>Read Article</span>
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </Link>
                )}

                {/* Posts Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-lg transition cursor-pointer"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                        <Tag className="h-3 w-3" />
                                        {post.category}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-400">
                                        {post.readTime}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                                    {post.title}
                                </h3>

                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                                    {post.excerpt}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-400">
                                <span className="text-slate-600 font-semibold">{post.author}</span>
                                <span className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                                    Read <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Newsletter Subscription Box */}
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                                <BookOpen className="h-4 w-4" />
                                <span>Stay Informed</span>
                            </div>
                            <h3 className="text-xl font-bold">Get tool updates & performance tips</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Join our newsletter to receive the latest web optimization tricks directly in your inbox.
                            </p>
                        </div>

                        {subscribed ? (
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-5 py-3 text-xs font-bold text-emerald-300">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span>Subscribed Successfully!</span>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setSubscribed(true);
                                }}
                                className="flex w-full md:w-auto items-center gap-2"
                            >
                                <div className="relative flex-1 md:w-64">
                                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email..."
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shrink-0 cursor-pointer"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}