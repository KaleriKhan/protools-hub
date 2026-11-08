import Link from "next/link";
import { Shield } from "lucide-react";
import Logo from "./Logo";

const categories = [
    ["PDF Utilities", "PDF"],
    ["Image Processing", "Image"],
    ["Developer Suite", "Developer"],
    ["Security & Passwords", "Security"],
    ["Text Utilities", "Text"],
];

const company = [
    ["Home", "/"],
    ["All Tools", "/tools"],
    ["Blog & Articles", "/blog"],
    ["About Us", "/about"],
    ["Contact", "/contact"],
];

export default function Footer() {
    const year = new Date().getFullYear();
    const linkCls = "transition hover:text-white focus:outline-none focus-visible:underline";

    return (
        <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <Logo size="sm" />
                        <p className="text-xs leading-relaxed text-slate-400">
                            Free, fast online tools for developers, designers and everyday work. Most tools process your files directly in your browser.
                        </p>
                    </div>

                    <nav aria-label="Quick links">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h2>
                        <ul className="space-y-2.5 text-xs text-slate-400">
                            {company.map(([label, href]) => (
                                <li key={href}><Link href={href} className={linkCls}>{label}</Link></li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Tool categories">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Categories</h2>
                        <ul className="space-y-2.5 text-xs text-slate-400">
                            {categories.map(([label, key]) => (
                                <li key={key}><Link href={`/categories?category=${key}`} className={linkCls}>{label}</Link></li>
                            ))}
                        </ul>
                    </nav>

                    <div>
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Your Files Stay Yours</h2>
                        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                                <Shield className="h-4 w-4" aria-hidden="true" />
                                <span>Browser-side processing</span>
                            </div>
                            <p className="text-[11px] leading-normal text-slate-400">
                                Files you convert, compress or edit are handled on your device and are not uploaded to our servers. See our{" "}
                                <Link href="/privacy" className="text-blue-400 underline-offset-2 hover:underline">Privacy Policy</Link>{" "}
                                for how ads and cookies work.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row">
                    <p>© {year} ProTools Hub. All rights reserved.</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                        <Link href="/privacy" className={linkCls}>Privacy Policy</Link>
                        <Link href="/terms" className={linkCls}>Terms of Service</Link>
                        <Link href="/about" className={linkCls}>About</Link>
                        <Link href="/contact" className={linkCls}>Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}