import Link from "next/link";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm text-slate-700">

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Home</span>
                </Link>

                <div className="space-y-3 border-b border-slate-100 pb-6">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
                        <Lock className="h-3.5 w-3.5" />
                        <span>100% Client-Side Data Security</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-xs text-slate-400">Last updated: September 2026</p>
                </div>

                <div className="space-y-6 text-sm leading-relaxed">
                    <p>
                        At <strong>ProTools Hub</strong>, we prioritize the complete privacy and security of our users. This Privacy Policy outlines how your data is handled when you use our browser-based utilities.
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 pt-2">1. Zero Server File Processing</h2>
                    <p>
                        All file processing, image resizing, text summarization, and conversions occur entirely within your browser using modern WebAssembly and HTML5 Canvas APIs. <strong>Your files and text are never uploaded to, transmitted across, or stored on any remote cloud server.</strong>
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 pt-2">2. Data Collection & Analytics</h2>
                    <p>
                        We do not collect personal identification information. Standard, aggregated server logs and basic web analytics may be used solely to monitor website performance and prevent abuse.
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 pt-2">3. Third-Party Services & Cookies</h2>
                    <p>
                        We may use standard third-party advertising services (such as Google AdSense) and analytics tools that use cookies to serve non-personalized ads based on general site visits.
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 pt-2">4. Contact Us</h2>
                    <p>
                        If you have questions regarding our privacy practices, you can reach out via our official contact channel at <Link href="/contact" className="text-blue-600 underline font-semibold">Contact Support</Link>.
                    </p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>ProTools Hub — Client-Side Protected & Privacy Guaranteed</span>
                </div>

            </div>
        </main>
    );
}