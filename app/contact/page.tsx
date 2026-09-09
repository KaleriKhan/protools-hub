"use client";

import React, { useState, FormEvent } from "react";
import {
    Mail,
    Send,
    CheckCircle2,
    Clock,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("general");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setName("");
            setEmail("");
            setMessage("");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Get In Touch</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        We'd Love to Hear From You
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Have a feature request, bug report, or business inquiry? Drop us a message below.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Info Cards */}
                    <div className="space-y-4 lg:col-span-1">
                        {/* Direct Email Card */}
                        <a
                            href="mailto:support@protools.com?subject=Inquiry%20from%20ProTools%20Hub"
                            className="group block rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition duration-200">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                                    Direct Email
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Reach our support team anytime</p>
                            </div>
                            <p className="text-xs font-bold text-blue-600 group-hover:underline">
                                support@protools.com
                            </p>
                        </a>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Response Time</h3>
                                <p className="text-xs text-slate-500 mt-0.5">We typically respond within 24 hours.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Privacy Guaranteed</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Your email address will never be shared with third parties.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
                        {submitted ? (
                            <div className="text-center py-12 space-y-4">
                                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Message Sent Successfully!</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                    Thank you for reaching out. Our team has received your message and will get back to you shortly.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Topic / Subject
                                    </label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition"
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="bug">Report a Bug / Issue</option>
                                        <option value="feature">Request a Feature</option>
                                        <option value="business">Business / Custom Coding Work</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Message
                                    </label>
                                    <textarea
                                        rows={5}
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How can we help you?"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? (
                                        <span>Sending...</span>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}