"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench, Shield } from "lucide-react";

export default function Footer() {
    const [currentYear, setCurrentYear] = useState<number>(2026);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="border-t border-slate-800 bg-slate-900 text-slate-200">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand & About */}
                    <div className="space-y-4 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Wrench className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-0.5">
                                    ProTools<span className="text-blue-400">Hub</span>
                                </span>
                                <span className="text-[10px] font-semibold text-slate-300 -mt-1 tracking-wider uppercase">
                                    Developer Toolkit
                                </span>
                            </div>
                        </Link>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Fast, free, and secure client-side tools designed for developers, designers, creators, and everyday productivity.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-300">
                            <li>
                                <Link href="/" className="hover:text-white transition">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools" className="hover:text-white transition">
                                    All Tools
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="hover:text-white transition">
                                    Tool Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-white transition">
                                    Blog & Articles
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-white transition">
                                    Contact Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                            Categories
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-300">
                            <li><Link href="/categories" className="hover:text-white transition">PDF Utilities</Link></li>
                            <li><Link href="/categories" className="hover:text-white transition">Image Processing</Link></li>
                            <li><Link href="/categories" className="hover:text-white transition">Developer Suite</Link></li>
                            <li><Link href="/categories" className="hover:text-white transition">Security & Passwords</Link></li>
                            <li><Link href="/categories" className="hover:text-white transition">Text Utilities</Link></li>
                        </ul>
                    </div>

                    {/* Privacy & Trust Badge */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                            Privacy Guaranteed
                        </h4>
                        <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                                <Shield className="h-4 w-4" />
                                <span>Zero Data Collection</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-normal">
                                All file conversions, password generations, and text parsing occur strictly within your browser.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Bottom Copyright Bar */}
                <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
                    <p>© {currentYear} ProTools Hub. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/contact" className="hover:text-white transition">Privacy Policy</Link>
                        <Link href="/contact" className="hover:text-white transition">Terms of Service</Link>
                        <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}