import Link from "next/link";
import { FileText, ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermsPage() {
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
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Usage Guidelines</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Terms of Service
                    </h1>
                    <p className="text-xs text-slate-400">Last updated: September 2026</p>
                </div>

                <div className="space-y-6 text-sm leading-relaxed">
                    <p>
                        Welcome to <strong>ProTools Hub</strong>. By accessing and using our web utilities, you agree to comply with the following terms and conditions.
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 pt-2">1. Acceptance of Terms</h2>
                    <p>
                        By using our website, you acknowledge that all services are provided "as-is" for personal, educational, and commercial productivity purposes.
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 pt-2">2. Client-Side Processing Disclaimer</h2>
                    <p>
                        Our web tools operate locally in your web browser. You retain full ownership and responsibility for any files, text, or data processed using ProTools Hub.
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 pt-2">3. Intellectual Property</h2>
                    <p>
                        All source code, design elements, tools, and written content on ProTools Hub are protected by copyright laws and intellectual property rights.
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 pt-2">4. Limitation of Liability</h2>
                    <p>
                        ProTools Hub is not liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our tools.
                    </p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>ProTools Hub — Terms & Conditions Standard</span>
                </div>

            </div>
        </main>
    );
}