"use client";

import { FormEvent, useState } from "react";
import { Mail, Send, Clock, ShieldCheck, Sparkles, Copy, Check } from "lucide-react";

const EMAIL = "support@myprotoolshub.com";

const TOPICS: Record<string, string> = {
    general: "General inquiry",
    bug: "Bug report",
    feature: "Feature request",
    business: "Business / custom work",
};

const field =
    "w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-3 text-xs font-medium text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [topic, setTopic] = useState("general");
    const [message, setMessage] = useState("");
    const [opened, setOpened] = useState(false);
    const [copied, setCopied] = useState(false);

    // Opens the visitor's own email app with the message filled in. Nothing is sent
    // from this page, so we never claim a message was delivered.
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const subject = `[ProTools Hub] ${TOPICS[topic]}`;
        const body = `${message}\n\n--\nName: ${name}\nReply to: ${email}`;
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setOpened(true);
    };

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard blocked */ }
    };

    return (
        <div className="bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-10">
                <div className="mx-auto max-w-2xl space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Contact</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Contact ProTools Hub</h1>
                    <p className="text-sm leading-relaxed text-slate-400">
                        Found a bug, want a new tool, or have a question about the site? Write to us and we will reply by email.
                    </p>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    <div className="space-y-4">
                        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                <Mail className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h2 className="text-sm font-bold text-white">Email</h2>
                            <a href={`mailto:${EMAIL}`} className="block break-all text-xs font-bold text-blue-400 hover:underline">{EMAIL}</a>
                            <button type="button" onClick={copyEmail} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white">
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? "Copied" : "Copy address"}
                            </button>
                        </div>
                        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                <Clock className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h2 className="text-sm font-bold text-white">Response time</h2>
                            <p className="text-xs text-slate-400">We aim to reply within 1–3 working days.</p>
                        </div>
                        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h2 className="text-sm font-bold text-white">Your details</h2>
                            <p className="text-xs text-slate-400">We use your email only to answer your message. Please do not send passwords or private files.</p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:p-8 lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="c-name" className="mb-1.5 block text-xs font-bold text-slate-300">Your name</label>
                                    <input id="c-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
                                </div>
                                <div>
                                    <label htmlFor="c-email" className="mb-1.5 block text-xs font-bold text-slate-300">Your email</label>
                                    <input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="c-topic" className="mb-1.5 block text-xs font-bold text-slate-300">Topic</label>
                                <select id="c-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={`${field} cursor-pointer`}>
                                    {Object.entries(TOPICS).map(([v, l]) => (
                                        <option key={v} value={v} className="bg-slate-900 text-white">{l}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="c-msg" className="mb-1.5 block text-xs font-bold text-slate-300">Message</label>
                                <textarea id="c-msg" rows={6} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us which tool you were using and what happened." className={`${field} resize-none`} />
                            </div>
                            <button type="submit" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500">
                                <Send className="h-4 w-4" aria-hidden="true" /> Open in my email app
                            </button>
                            <p className="text-center text-[11px] text-slate-400" role="status">
                                {opened
                                    ? `If your email app did not open, send your message to ${EMAIL} directly.`
                                    : "This opens your email app with the message ready to send."}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}