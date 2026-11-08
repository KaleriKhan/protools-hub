"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
    QrCode,
    Download,
    Copy,
    Check,
    HelpCircle,
    Zap,
    ShieldCheck,
    CheckCircle2,
    Link2,
    Type,
    Wifi,
    Contact,
    Mail,
    MessageSquare,
    Phone,
    AlertTriangle,
    Lightbulb,
    ArrowRight,
    Palette,
} from "lucide-react";

/* PURE HELPERS START */

type ContentType = "url" | "text" | "wifi" | "vcard" | "email" | "sms" | "phone";
type WifiSecurity = "WPA" | "WEP" | "nopass";

// Wi-Fi QR format: special characters \ ; , : " must be escaped with a backslash.
const escapeWifi = (s: string): string => s.replace(/([\\;,:"])/g, "\\$1");

const buildWifi = (ssid: string, password: string, security: WifiSecurity, hidden: boolean): string => {
    if (!ssid) return "";
    let out = `WIFI:T:${security};S:${escapeWifi(ssid)};`;
    if (security !== "nopass" && password) out += `P:${escapeWifi(password)};`;
    if (hidden) out += "H:true;";
    return out + ";";
};

// vCard 3.0 values: escape backslash, comma, semicolon and newlines.
const escapeVCard = (s: string): string =>
    s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

interface VCardFields {
    first: string;
    last: string;
    org: string;
    title: string;
    phone: string;
    email: string;
    url: string;
}

const buildVCard = (f: VCardFields): string => {
    if (!f.first.trim() && !f.last.trim() && !f.org.trim()) return "";
    const lines = ["BEGIN:VCARD", "VERSION:3.0"];
    lines.push(`N:${escapeVCard(f.last.trim())};${escapeVCard(f.first.trim())};;;`);
    lines.push(`FN:${escapeVCard([f.first.trim(), f.last.trim()].filter(Boolean).join(" ") || f.org.trim())}`);
    if (f.org.trim()) lines.push(`ORG:${escapeVCard(f.org.trim())}`);
    if (f.title.trim()) lines.push(`TITLE:${escapeVCard(f.title.trim())}`);
    if (f.phone.trim()) lines.push(`TEL;TYPE=CELL:${f.phone.trim().replace(/[^\d+]/g, "")}`);
    if (f.email.trim()) lines.push(`EMAIL:${f.email.trim()}`);
    if (f.url.trim()) lines.push(`URL:${f.url.trim()}`);
    lines.push("END:VCARD");
    return lines.join("\r\n");
};

const buildMailto = (to: string, subject: string, body: string): string => {
    if (!to.trim()) return "";
    const params: string[] = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    return `mailto:${to.trim()}${params.length ? "?" + params.join("&") : ""}`;
};

const cleanPhone = (p: string): string => p.trim().replace(/[^\d+]/g, "");

const buildSms = (number: string, message: string): string => {
    const n = cleanPhone(number);
    if (!n) return "";
    return `sms:${n}${message ? `?body=${encodeURIComponent(message)}` : ""}`;
};

const buildTel = (number: string): string => {
    const n = cleanPhone(number);
    return n ? `tel:${n}` : "";
};

// Adds https:// when the user typed a bare domain.
const normalizeUrl = (u: string): string => {
    const t = u.trim();
    if (!t) return "";
    return /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
};

const hexToRgb = (hex: string): [number, number, number] => {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = (hex: string): number => {
    const [r, g, b] = hexToRgb(hex).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// WCAG contrast ratio, 1 (identical) to 21 (black on white).
const contrastRatio = (a: string, b: string): number => {
    const la = luminance(a);
    const lb = luminance(b);
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
};

/* PURE HELPERS END */

type EcLevel = "L" | "M" | "Q" | "H";

const EC_LEVELS: { id: EcLevel; label: string; note: string }[] = [
    { id: "L", label: "L (7%)", note: "Most data, least damage tolerance" },
    { id: "M", label: "M (15%)", note: "Good default" },
    { id: "Q", label: "Q (25%)", note: "For printed codes that may get scuffed" },
    { id: "H", label: "H (30%)", note: "Most robust, holds the least data" },
];

const TYPES: { id: ContentType; label: string; icon: React.ReactNode }[] = [
    { id: "url", label: "URL", icon: <Link2 className="h-4 w-4" /> },
    { id: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
    { id: "wifi", label: "Wi-Fi", icon: <Wifi className="h-4 w-4" /> },
    { id: "vcard", label: "Contact", icon: <Contact className="h-4 w-4" /> },
    { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
    { id: "sms", label: "SMS", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "phone", label: "Phone", icon: <Phone className="h-4 w-4" /> },
];

const FAQS: { q: string; a: string }[] = [
    {
        q: "Is this QR code generator free, and are my codes tracked?",
        a: "It is free with no sign-up and no watermark. The codes it creates are static: the data is written directly into the pattern of squares. They never expire, we do not track scans, and nothing you type is sent to our servers because the code is generated in your browser.",
    },
    {
        q: "What is the difference between static and dynamic QR codes?",
        a: "A static QR code contains your data itself, so it works forever but cannot be edited after printing. A dynamic QR code contains a short redirect link owned by a service, which lets that service change the destination and count scans, but it usually stops working if you stop paying. This tool makes static codes only.",
    },
    {
        q: "Which error correction level should I choose?",
        a: "Error correction lets a code still scan when part of it is dirty or covered. L recovers about 7% damage, M 15%, Q 25% and H 30%. M suits screens and clean prints. Choose Q or H for stickers, packaging or outdoor use, keeping in mind higher levels make the pattern denser, so a long link may need a bigger code.",
    },
    {
        q: "How big should I print a QR code?",
        a: "As a rule of thumb, a code should be at least 2 cm (about 0.8 inch) wide, and you should allow about one tenth of the scanning distance in width: 10 cm for a poster read from 1 metre. Denser codes (more data or higher error correction) need more size. Always test with a real phone before printing a large batch.",
    },
    {
        q: "Why will my QR code not scan?",
        a: "The usual causes are low contrast, light-on-dark (inverted) colours, a code that is too small, no blank border (quiet zone) around it, a glossy surface with glare, or too much data making the pattern very dense. Use dark squares on a light background, keep the margin at 4 modules or more, and shorten your link if needed.",
    },
    {
        q: "How do I make a Wi-Fi QR code?",
        a: "Choose the Wi-Fi tab, enter the network name exactly as it appears, pick the security type (WPA or WPA2/WPA3 networks use WPA) and enter the password. Most modern phones will offer to join the network when the camera scans it. Anyone who can scan the code can read the password, so only display it where you are happy to share the network.",
    },
    {
        q: "What is the maximum amount of data a QR code can hold?",
        a: "At the lowest error-correction level a QR code can hold up to about 2,950 bytes of text, but real-world codes scan best with far less. If you see a too-much-data message, shorten the text or URL, lower the error-correction level, or use a short link.",
    },
    {
        q: "Can I use the QR codes commercially?",
        a: "Yes. The codes you generate are yours to use on products, menus, flyers and business cards without attribution. QR Code is a registered trademark of Denso Wave, but using the code format itself is free. You remain responsible for the content you encode.",
    },
];

const TIPS: string[] = [
    "Use dark squares on a light background. Many scanners cannot read inverted (light on dark) codes.",
    "Keep a blank margin of at least 4 modules around the code. This quiet zone is how scanners find the edges.",
    "Shorter data makes a simpler code that scans faster and at smaller sizes. Shorten long URLs.",
    "Print at least 2 cm wide, and larger for anything read from a distance.",
    "Test the printed result with two or three different phones before you print a large batch.",
    "Do not stretch the code or place it on a curved, shiny or patterned surface.",
    "Add a short label such as Scan to join Wi-Fi so people know what the code does.",
];

const MISTAKES: { t: string; b: string }[] = [
    {
        t: "Low-contrast colours",
        b: "Pale grey on white or yellow on white looks stylish but fails in poor light. Keep a contrast ratio of at least 3:1, ideally much higher.",
    },
    {
        t: "Inverting the colours",
        b: "A white code on a black background is not read by every scanner. If you must, test it on several phones.",
    },
    {
        t: "Typing the URL wrong",
        b: "A static code cannot be corrected after printing. Open the link yourself first and scan the code before you publish it.",
    },
    {
        t: "Using a tiny size",
        b: "Dense codes scanned from a distance need space. If it is hard to scan on screen at full size, it will fail on paper.",
    },
];

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";
const inputCls =
    "w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30";

export default function QRCodeGenerator() {
    const [type, setType] = useState<ContentType>("url");

    const [url, setUrl] = useState("https://myprotoolshub.com");
    const [text, setText] = useState("");
    const [ssid, setSsid] = useState("");
    const [wifiPass, setWifiPass] = useState("");
    const [wifiSec, setWifiSec] = useState<WifiSecurity>("WPA");
    const [wifiHidden, setWifiHidden] = useState(false);
    const [vc, setVc] = useState<VCardFields>({ first: "", last: "", org: "", title: "", phone: "", email: "", url: "" });
    const [mailTo, setMailTo] = useState("");
    const [mailSubject, setMailSubject] = useState("");
    const [mailBody, setMailBody] = useState("");
    const [smsNumber, setSmsNumber] = useState("");
    const [smsMessage, setSmsMessage] = useState("");
    const [phone, setPhone] = useState("");

    const [ec, setEc] = useState<EcLevel>("M");
    const [size, setSize] = useState(320);
    const [margin, setMargin] = useState(4);
    const [fg, setFg] = useState("#000000");
    const [bg, setBg] = useState("#ffffff");

    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [notice, setNotice] = useState("");

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const payload = useMemo(() => {
        switch (type) {
            case "url":
                return normalizeUrl(url);
            case "text":
                return text;
            case "wifi":
                return buildWifi(ssid, wifiPass, wifiSec, wifiHidden);
            case "vcard":
                return buildVCard(vc);
            case "email":
                return buildMailto(mailTo, mailSubject, mailBody);
            case "sms":
                return buildSms(smsNumber, smsMessage);
            case "phone":
                return buildTel(phone);
        }
    }, [type, url, text, ssid, wifiPass, wifiSec, wifiHidden, vc, mailTo, mailSubject, mailBody, smsNumber, smsMessage, phone]);

    const ratio = contrastRatio(fg, bg);
    const inverted = luminance(fg) > luminance(bg);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let cancelled = false;

        if (!payload.trim()) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setError("");
            return;
        }

        QRCode.toCanvas(canvas, payload, {
            width: size,
            margin,
            errorCorrectionLevel: ec,
            color: { dark: fg, light: bg },
        })
            .then(() => {
                if (!cancelled) setError("");
            })
            .catch(() => {
                if (cancelled) return;
                const ctx = canvas.getContext("2d");
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
                setError(
                    "This is too much data for one QR code at this error-correction level. Shorten the text, use a short link, or choose a lower level such as L."
                );
            });

        return () => {
            cancelled = true;
        };
    }, [payload, size, margin, ec, fg, bg]);

    const flash = (msg: string) => {
        setNotice(msg);
        setTimeout(() => setNotice(""), 2500);
    };

    const save = (blob: Blob, name: string) => {
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = u;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 1500);
    };

    const canExport = !!payload.trim() && !error;

    const downloadPng = () => {
        const c = canvasRef.current;
        if (!c || !canExport) return;
        c.toBlob((b) => b && save(b, "qr-code.png"), "image/png");
    };

    const downloadSvg = async () => {
        if (!canExport) return;
        try {
            const svg = await QRCode.toString(payload, {
                type: "svg",
                margin,
                errorCorrectionLevel: ec,
                color: { dark: fg, light: bg },
            });
            save(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
        } catch {
            setError("Could not create the SVG file for this content.");
        }
    };

    const copyImage = async () => {
        const c = canvasRef.current;
        if (!c || !canExport) return;
        try {
            const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
            if (!blob || typeof ClipboardItem === "undefined") throw new Error("unsupported");
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            flash("Your browser blocked copying images. Use Download PNG instead.");
        }
    };

    const jsonLd = useMemo(
        () =>
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
            }).replace(/</g, "\\u003c"),
        []
    );

    const setVcField = (k: keyof VCardFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setVc((v) => ({ ...v, [k]: e.target.value }));

    const colorWarning =
        inverted
            ? "The code is lighter than its background. Many scanners cannot read inverted codes, so swap the colours unless you have tested it."
            : ratio < 3
                ? `Contrast is very low (${ratio.toFixed(1)}:1). This code will likely fail to scan. Aim for at least 3:1, ideally above 7:1.`
                : ratio < 4.5
                    ? `Contrast is on the low side (${ratio.toFixed(1)}:1). It may be hard to scan in poor light.`
                    : "";

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

            {/* ---------------- Tool ---------------- */}
            <div className={`${card} shadow-xl shadow-black/20`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                            <QrCode className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">QR Code Generator</h2>
                            <p className="text-xs text-slate-400">
                                Create static QR codes for links, text, Wi-Fi, contacts, email, SMS and phone numbers.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Generated in your browser
                    </div>
                </div>

                {/* Type tabs */}
                <div role="tablist" aria-label="QR code content type" className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-1.5">
                    {TYPES.map((t) => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={type === t.id}
                            onClick={() => setType(t.id)}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${type === t.id ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Left: inputs */}
                    <div className="space-y-5">
                        {type === "url" && (
                            <div>
                                <label htmlFor="qr-url" className={fieldLabel}>Website address</label>
                                <input id="qr-url" type="text" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={inputCls} />
                                <p className="mt-1.5 text-[11px] text-slate-500">If you leave out https://, we add it for you.</p>
                            </div>
                        )}

                        {type === "text" && (
                            <div>
                                <label htmlFor="qr-text" className={fieldLabel}>Text</label>
                                <textarea id="qr-text" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Any text, up to about 2,000 characters" className={inputCls} />
                            </div>
                        )}

                        {type === "wifi" && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="qr-ssid" className={fieldLabel}>Network name (SSID)</label>
                                    <input id="qr-ssid" type="text" value={ssid} onChange={(e) => setSsid(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label htmlFor="qr-sec" className={fieldLabel}>Security</label>
                                    <select id="qr-sec" value={wifiSec} onChange={(e) => setWifiSec(e.target.value as WifiSecurity)} className={inputCls}>
                                        <option value="WPA">WPA / WPA2 / WPA3</option>
                                        <option value="WEP">WEP</option>
                                        <option value="nopass">No password</option>
                                    </select>
                                </div>
                                {wifiSec !== "nopass" && (
                                    <div>
                                        <label htmlFor="qr-wpass" className={fieldLabel}>Password</label>
                                        <input id="qr-wpass" type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className={inputCls} />
                                    </div>
                                )}
                                <label className="flex cursor-pointer items-center gap-3 text-xs font-semibold text-slate-300">
                                    <input type="checkbox" checked={wifiHidden} onChange={(e) => setWifiHidden(e.target.checked)} className="h-4 w-4 accent-cyan-500" />
                                    Hidden network
                                </label>
                                <p className="text-[11px] text-amber-300/80">Anyone who scans this code can read the Wi-Fi password.</p>
                            </div>
                        )}

                        {type === "vcard" && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {([
                                    ["first", "First name"],
                                    ["last", "Last name"],
                                    ["org", "Company"],
                                    ["title", "Job title"],
                                    ["phone", "Phone"],
                                    ["email", "Email"],
                                ] as [keyof VCardFields, string][]).map(([k, l]) => (
                                    <div key={k}>
                                        <label htmlFor={`vc-${k}`} className={fieldLabel}>{l}</label>
                                        <input id={`vc-${k}`} type="text" value={vc[k]} onChange={setVcField(k)} className={inputCls} />
                                    </div>
                                ))}
                                <div className="sm:col-span-2">
                                    <label htmlFor="vc-url" className={fieldLabel}>Website</label>
                                    <input id="vc-url" type="text" value={vc.url} onChange={setVcField("url")} className={inputCls} />
                                </div>
                            </div>
                        )}

                        {type === "email" && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="qr-mto" className={fieldLabel}>To</label>
                                    <input id="qr-mto" type="email" value={mailTo} onChange={(e) => setMailTo(e.target.value)} placeholder="name@example.com" className={inputCls} />
                                </div>
                                <div>
                                    <label htmlFor="qr-msub" className={fieldLabel}>Subject (optional)</label>
                                    <input id="qr-msub" type="text" value={mailSubject} onChange={(e) => setMailSubject(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label htmlFor="qr-mbody" className={fieldLabel}>Message (optional)</label>
                                    <textarea id="qr-mbody" rows={3} value={mailBody} onChange={(e) => setMailBody(e.target.value)} className={inputCls} />
                                </div>
                            </div>
                        )}

                        {type === "sms" && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="qr-sn" className={fieldLabel}>Phone number</label>
                                    <input id="qr-sn" type="tel" value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)} placeholder="+92 300 1234567" className={inputCls} />
                                </div>
                                <div>
                                    <label htmlFor="qr-sm" className={fieldLabel}>Message (optional)</label>
                                    <textarea id="qr-sm" rows={3} value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} className={inputCls} />
                                </div>
                            </div>
                        )}

                        {type === "phone" && (
                            <div>
                                <label htmlFor="qr-ph" className={fieldLabel}>Phone number</label>
                                <input id="qr-ph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className={inputCls} />
                                <p className="mt-1.5 text-[11px] text-slate-500">Include the country code so it works from anywhere.</p>
                            </div>
                        )}

                        {/* Appearance */}
                        <div className="space-y-5 border-t border-slate-800 pt-5">
                            <div>
                                <span className={fieldLabel}>Error correction</span>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {EC_LEVELS.map((l) => (
                                        <button
                                            key={l.id}
                                            type="button"
                                            onClick={() => setEc(l.id)}
                                            aria-pressed={ec === l.id}
                                            title={l.note}
                                            className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${ec === l.id ? "border-cyan-500 bg-cyan-500/10 text-cyan-200" : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                                                }`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-1.5 text-[11px] text-slate-500">{EC_LEVELS.find((l) => l.id === ec)?.note}</p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label htmlFor="qr-size" className="text-xs font-bold uppercase tracking-wider text-slate-400">Size</label>
                                        <span className="text-xs font-bold text-cyan-300">{size} px</span>
                                    </div>
                                    <input id="qr-size" type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full cursor-pointer accent-cyan-500" />
                                </div>
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label htmlFor="qr-margin" className="text-xs font-bold uppercase tracking-wider text-slate-400">Margin</label>
                                        <span className="text-xs font-bold text-cyan-300">{margin} modules</span>
                                    </div>
                                    <input id="qr-margin" type="range" min={0} max={8} step={1} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full cursor-pointer accent-cyan-500" />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="qr-fg" className={`${fieldLabel} flex items-center gap-1.5`}><Palette className="h-3.5 w-3.5" /> Code colour</label>
                                    <div className="flex items-center gap-2">
                                        <input id="qr-fg" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-1" />
                                        <span className="font-mono text-xs text-slate-400">{fg}</span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="qr-bg" className={`${fieldLabel} flex items-center gap-1.5`}><Palette className="h-3.5 w-3.5" /> Background</label>
                                    <div className="flex items-center gap-2">
                                        <input id="qr-bg" type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-1" />
                                        <span className="font-mono text-xs text-slate-400">{bg}</span>
                                    </div>
                                </div>
                            </div>

                            {colorWarning && (
                                <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{colorWarning}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: preview */}
                    <div className="flex flex-col items-center rounded-3xl border border-slate-800 bg-slate-950/60 p-6 text-center">
                        <div className="flex min-h-[200px] w-full items-center justify-center overflow-auto rounded-2xl bg-slate-900 p-4">
                            {payload.trim() && !error ? null : (
                                <p className="max-w-[16rem] text-xs leading-relaxed text-slate-500">
                                    {error || "Fill in the details and your QR code will appear here."}
                                </p>
                            )}
                            <canvas
                                ref={canvasRef}
                                aria-label="Generated QR code preview"
                                className={`h-auto max-w-full rounded-lg ${payload.trim() && !error ? "" : "hidden"}`}
                            />
                        </div>
                        {error && payload.trim() && (
                            <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-left text-xs text-rose-200">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <p className="mt-3 text-[11px] text-slate-500">
                            Exports at {size} x {size} px. The preview may look smaller on narrow screens.
                        </p>

                        <div className="mt-5 grid w-full gap-2.5 sm:grid-cols-3">
                            <button onClick={downloadPng} disabled={!canExport} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40">
                                <Download className="h-4 w-4" /> PNG
                            </button>
                            <button onClick={downloadSvg} disabled={!canExport} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-slate-100 transition hover:bg-slate-700 disabled:opacity-40">
                                <Download className="h-4 w-4" /> SVG
                            </button>
                            <button onClick={copyImage} disabled={!canExport} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-slate-100 transition hover:bg-slate-700 disabled:opacity-40">
                                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                        {notice && <p role="status" className="mt-3 text-xs text-amber-300">{notice}</p>}
                        <p className="mt-3 text-[11px] text-slate-500">SVG is a vector file that stays sharp at any print size.</p>
                    </div>
                </div>
            </div>

            {/* ---------------- About ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">About the QR Code Generator</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        A QR (Quick Response) code is a two-dimensional barcode that a phone camera can read in a moment. It
                        can hold a web address, plain text, Wi-Fi login details, a contact card, a pre-filled email or text
                        message, or a phone number. Scanning it saves people from typing, which is why you see QR codes on
                        menus, posters, business cards, packaging and product manuals.
                    </p>
                    <p>
                        This generator builds <strong className="text-slate-100">static</strong> QR codes entirely in your browser.
                        Your data is encoded straight into the pattern, so the code never expires, we do not track scans, and
                        nothing you enter is sent to a server. You can export a PNG for screens, an SVG for professional
                        printing, or copy the image to paste it into a document.
                    </p>
                </div>
            </section>

            {/* ---------------- How to / features ---------------- */}
            <div className="grid gap-6 md:grid-cols-2">
                <section className={`${card} space-y-4`}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100">How to Use</h2>
                    </div>
                    <ol className="space-y-3 text-sm text-slate-300">
                        {[
                            "Pick what the code should do: open a link, show text, join Wi-Fi, save a contact, write an email, send an SMS or dial a number.",
                            "Fill in the details. The code updates as you type.",
                            "Choose an error-correction level, size and margin. Keep dark squares on a light background.",
                            "Download a PNG or SVG, or copy the image. Scan it with your phone before you share or print it.",
                        ].map((t, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">{i + 1}</span>
                                <span>{t}</span>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className={`${card} space-y-4`}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100">Key Features</h2>
                    </div>
                    <ul className="space-y-2.5 text-sm text-slate-300">
                        {[
                            "Seven content types: URL, text, Wi-Fi, contact (vCard), email, SMS and phone",
                            "Four error-correction levels and adjustable size up to 1024 px",
                            "PNG and SVG download, plus copy-to-clipboard",
                            "Warns about low contrast and inverted colours that fail to scan",
                            "Clear message when your data is too long for a QR code",
                            "Static codes: no expiry, no tracking, no account",
                            "Private: everything is generated on your device",
                        ].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ---------------- Static vs dynamic ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Static vs. Dynamic QR Codes</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[520px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">&nbsp;</th>
                                <th className="px-4 py-3 font-bold">Static (this tool)</th>
                                <th className="px-4 py-3 font-bold">Dynamic</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {[
                                ["Where the data lives", "Inside the code itself", "On the provider's server, behind a short link"],
                                ["Can you change it later?", "No", "Yes"],
                                ["Scan tracking", "None", "Usually included"],
                                ["Expires?", "Never", "Often stops if a subscription ends"],
                                ["Works offline", "Yes (text, Wi-Fi, contact)", "No, needs the redirect"],
                                ["Cost", "Free", "Often paid"],
                            ].map((r) => (
                                <tr key={r[0]}>
                                    <td className="px-4 py-3 font-semibold text-slate-200">{r[0]}</td>
                                    <td className="px-4 py-3">{r[1]}</td>
                                    <td className="px-4 py-3">{r[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                    Because static codes cannot be edited, double-check your content before printing. If you may need to change the
                    destination later, a dynamic code from a dedicated provider is the better fit.
                </p>
            </section>

            {/* ---------------- QR basics ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">How a QR Code Works</h2>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        A QR code is a grid of black and white squares called modules. Three large squares in the corners tell a
                        scanner where the code is and which way it is turned. Your data is converted to bits, protected with
                        Reed-Solomon error-correction codes, and spread across the grid. Because of that redundancy, a code can
                        still be read when a part is dirty, scratched or covered, which is how codes with a logo in the middle
                        keep working.
                    </p>
                    <p>
                        The more data you encode, or the higher the error-correction level, the more modules are needed and the
                        denser the code looks. Denser codes need to be printed larger to stay readable. That is why short links
                        make better QR codes than long ones.
                    </p>
                </div>
            </section>

            {/* ---------------- Printing tips ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Tips for Printing and Using QR Codes</h2>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                    {TIPS.map((t) => (
                        <li key={t} className="flex items-start gap-2.5">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            <span>{t}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ---------------- Mistakes ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Common QR Code Mistakes</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {MISTAKES.map((m) => (
                        <div key={m.t} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                            <h3 className="mb-1.5 text-sm font-bold text-slate-100">{m.t}</h3>
                            <p className="text-xs leading-relaxed text-slate-400">{m.b}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- FAQ ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {FAQS.map((f) => (
                        <details key={f.q} className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-4 open:border-slate-700">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-100">
                                {f.q}
                                <span className="text-slate-500 transition group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-xs leading-relaxed text-slate-400">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ---------------- Related ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-base font-bold text-slate-100">More Free Tools</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        { href: "/tools/image-compressor", t: "Image Compressor", d: "Shrink your exported QR image." },
                        { href: "/tools/image-resizer", t: "Image Resizer", d: "Resize images to exact dimensions." },
                        { href: "/tools/word-counter", t: "Word Counter", d: "Count words and characters in your text." },
                        { href: "/tools/json-formatter", t: "JSON Formatter", d: "Format, validate and minify JSON." },
                    ].map((l) => (
                        <Link key={l.href} href={l.href} className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40">
                            <span>
                                <span className="block text-sm font-semibold text-slate-100">{l.t}</span>
                                <span className="block text-xs text-slate-400">{l.d}</span>
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}