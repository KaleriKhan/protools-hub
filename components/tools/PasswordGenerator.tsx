"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    KeyRound,
    Copy,
    Check,
    RefreshCw,
    ShieldCheck,
    ShieldAlert,
    HelpCircle,
    Zap,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Hash,
    Type,
    AlertTriangle,
    Lightbulb,
    ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Secure randomness                                                  */
/* ------------------------------------------------------------------ */

// Uniform random integer in [0, max) using crypto.getRandomValues with
// rejection sampling, so there is no modulo bias.
const secureInt = (max: number): number => {
    if (max <= 1) return 0;
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do {
        crypto.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % max;
};

const pick = <T,>(arr: readonly T[]): T => arr[secureInt(arr.length)];

const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = secureInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

/* ------------------------------------------------------------------ */
/*  Character sets and word list                                       */
/* ------------------------------------------------------------------ */

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const SIMILAR = /[il1Lo0O]/g;
const AMBIGUOUS = /[{}\[\]()\/\\'"`~,;:.<>]/g;

const WORDS: string[] = Array.from(
    new Set(
        (
            "able acid acorn actor adapt agent alarm album alpine amber anchor angle ankle apple arch arena armor arrow " +
            "atlas autumn avenue badge baker bamboo banner barrel basket beach beacon bench berry bicycle bishop blanket " +
            "blossom border bottle branch bridge bronze bubble bucket buffalo cabin cable cactus camel candle canyon " +
            "carbon carpet castle cattle cedar cellar chapel cherry chimney circle citrus clever cliff clock cloud clover " +
            "cobalt coconut comet compass copper coral cotton cradle crater crystal curtain cypress dagger daisy dawn " +
            "delta desert diamond dolphin dragon dune eagle echo ember engine falcon feather fiddle forest fossil fountain " +
            "galaxy garden garlic gazelle ginger glacier goblet granite gravel guitar hammer harbor hazel helmet heron " +
            "hollow honey horizon island ivory jacket jaguar jasmine jungle kettle kitten ladder lagoon lantern laurel " +
            "lemon lever library lizard lotus magnet mango maple marble meadow melody mirror monsoon mosaic mountain " +
            "nectar needle nickel noodle oasis ocean olive onyx orchard otter oyster paddle palace panda parrot pebble " +
            "pepper piano pillar planet plume pocket prairie pumpkin puzzle quartz quiver rabbit radar raven reef ribbon " +
            "river rocket saddle saffron salmon sapphire shadow silver sketch spruce squirrel starlight summit sunset " +
            "tablet temple thunder timber tulip tunnel turtle valley velvet violin walnut whisper willow window winter " +
            "wizard yonder zephyr zigzag"
        ).split(" ")
    )
);

/* ------------------------------------------------------------------ */
/*  Types and generators                                               */
/* ------------------------------------------------------------------ */

type Mode = "password" | "passphrase" | "pin";

interface PasswordOpts {
    length: number;
    upper: boolean;
    lower: boolean;
    numbers: boolean;
    symbols: boolean;
    noSimilar: boolean;
    noAmbiguous: boolean;
}

interface PassphraseOpts {
    words: number;
    separator: string;
    capitalize: boolean;
    addNumber: boolean;
}

const buildSets = (o: PasswordOpts): string[] => {
    const clean = (s: string) => {
        let r = s;
        if (o.noSimilar) r = r.replace(SIMILAR, "");
        if (o.noAmbiguous) r = r.replace(AMBIGUOUS, "");
        return r;
    };
    const sets: string[] = [];
    if (o.upper) sets.push(clean(UPPER));
    if (o.lower) sets.push(clean(LOWER));
    if (o.numbers) sets.push(clean(DIGITS));
    if (o.symbols) sets.push(clean(SYMBOLS));
    return sets.filter((s) => s.length > 0);
};

const generatePassword = (o: PasswordOpts): { value: string; bits: number } => {
    const sets = buildSets(o);
    if (sets.length === 0) return { value: "", bits: 0 };
    const pool = sets.join("");
    const chars: string[] = [];
    // guarantee at least one character from every selected set
    sets.forEach((s) => {
        if (chars.length < o.length) chars.push(pick(s.split("")));
    });
    while (chars.length < o.length) chars.push(pool[secureInt(pool.length)]);
    return {
        value: shuffle(chars).join(""),
        bits: o.length * Math.log2(pool.length),
    };
};

const generatePassphrase = (o: PassphraseOpts): { value: string; bits: number } => {
    const parts: string[] = [];
    for (let i = 0; i < o.words; i++) {
        const w = pick(WORDS);
        parts.push(o.capitalize ? w[0].toUpperCase() + w.slice(1) : w);
    }
    let value = parts.join(o.separator);
    let bits = o.words * Math.log2(WORDS.length);
    if (o.addNumber) {
        value += o.separator + String(secureInt(100));
        bits += Math.log2(100);
    }
    return { value, bits };
};

const generatePin = (length: number): { value: string; bits: number } => {
    let v = "";
    for (let i = 0; i < length; i++) v += String(secureInt(10));
    return { value: v, bits: length * Math.log2(10) };
};

/* ------------------------------------------------------------------ */
/*  Strength helpers                                                   */
/* ------------------------------------------------------------------ */

const GUESSES_PER_SECOND = 1e10; // a fast offline attack on a weakly hashed password

const formatCrackTime = (bits: number): string => {
    if (bits <= 0) return "n/a";
    const seconds = Math.pow(2, bits - 1) / GUESSES_PER_SECOND;
    if (seconds < 1) return "instantly";
    const units: [string, number][] = [
        ["year", 31557600],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
        ["second", 1],
    ];
    const years = seconds / 31557600;
    if (years > 1e15) return "longer than the age of the universe";
    if (years >= 1e9) return `${(years / 1e9).toFixed(1)} billion years`;
    if (years >= 1e6) return `${(years / 1e6).toFixed(1)} million years`;
    if (years >= 1000) return `${Math.round(years).toLocaleString()} years`;
    for (const [name, size] of units) {
        if (seconds >= size) {
            const n = Math.round(seconds / size);
            return `${n.toLocaleString()} ${name}${n === 1 ? "" : "s"}`;
        }
    }
    return "instantly";
};

const getStrength = (bits: number) => {
    if (bits <= 0) return { label: "None", bar: "bg-slate-700", text: "text-slate-400", pct: 0, good: false };
    if (bits < 40) return { label: "Weak", bar: "bg-rose-500", text: "text-rose-400", pct: 25, good: false };
    if (bits < 60) return { label: "Fair", bar: "bg-amber-500", text: "text-amber-400", pct: 50, good: false };
    if (bits < 80) return { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-400", pct: 75, good: true };
    return { label: "Very strong", bar: "bg-teal-400", text: "text-teal-300", pct: 100, good: true };
};

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const ENTROPY_ROWS = [
    { label: "Digits only (10)", size: 10, lengths: [4, 6, 8] },
    { label: "Lowercase letters (26)", size: 26, lengths: [8, 12, 16] },
    { label: "Upper + lower + digits (62)", size: 62, lengths: [8, 12, 16] },
    { label: "All printable symbols (about 90)", size: 90, lengths: [8, 12, 16] },
].map((r) => ({
    ...r,
    cells: r.lengths.map((len) => {
        const bits = len * Math.log2(r.size);
        return { len, bits: Math.round(bits), time: formatCrackTime(bits) };
    }),
}));

const MISTAKES: { title: string; body: string }[] = [
    {
        title: "Reusing one password everywhere",
        body: "When one site is breached, attackers try the leaked email and password combination on banks, email and social networks. This is called credential stuffing and it is the most common way accounts are taken over. Use a different password for every account.",
    },
    {
        title: "Using personal information",
        body: "Names, birthdays, phone numbers, pet names and favourite teams are the first things an attacker guesses, and many of them can be found on your public profiles. Random generation removes the pattern completely.",
    },
    {
        title: "Predictable substitutions",
        body: "Swapping an a for @ or an o for 0 in a dictionary word (p@ssw0rd) fools nobody. Cracking tools apply these substitutions automatically. Length and true randomness matter far more than clever tricks.",
    },
    {
        title: "Short passwords with many symbols",
        body: "Every extra character multiplies the number of guesses needed, while a larger character set only adds a small amount. A 16-character password with letters and digits is stronger than an 8-character one with every symbol.",
    },
    {
        title: "Storing passwords in notes or chats",
        body: "Plain text notes, spreadsheets and messaging apps are easy to search and easy to leak. Use a password manager, which stores passwords encrypted behind one strong master password.",
    },
    {
        title: "Skipping two-factor authentication",
        body: "Even a perfect password can be phished. Turn on two-factor authentication, preferably with an authenticator app or a hardware key, for email, banking and any account that can reset others.",
    },
];

const FAQS: { q: string; a: string }[] = [
    {
        q: "Is this password generator safe to use?",
        a: "Yes. Passwords are generated entirely in your browser using the Web Crypto API (crypto.getRandomValues), the same source of randomness browsers use for cryptography. Nothing is sent to our servers, stored, or logged. You can even disconnect from the internet after the page loads and it will keep working.",
    },
    {
        q: "How long should my password be?",
        a: "For most accounts, 16 characters with a mix of character types is a strong choice. For your email, password manager master password and financial accounts, consider 20 characters or more, or a passphrase of five to six random words. Anything under 12 characters is increasingly easy to crack with modern hardware.",
    },
    {
        q: "What does the entropy figure mean?",
        a: "Entropy, measured in bits, describes how unpredictable a password is. Each extra bit doubles the number of guesses an attacker needs. Under 40 bits is weak, 60 bits is reasonable for low-value accounts, and 80 bits or more is very strong. We calculate it from the length and the size of the character pool, assuming every character is chosen at random.",
    },
    {
        q: "How accurate is the crack time estimate?",
        a: "It is a rough illustration, not a guarantee. We assume an attacker with a stolen password database can make ten billion guesses per second and needs to search half the possibilities on average. Real speeds depend on how the site stores passwords: a well-designed site using bcrypt, scrypt or Argon2 slows attackers by many orders of magnitude, while a poorly designed one may be much weaker than the estimate.",
    },
    {
        q: "Should I use a password or a passphrase?",
        a: "Passwords are best when a password manager will remember them for you. Passphrases, such as five unrelated words, are easier to type and remember, which makes them ideal for things you must enter by hand: a device login, your password manager master password or disk encryption. Our word list has about " +
            WORDS.length +
            " words, so each word adds roughly " +
            Math.log2(WORDS.length).toFixed(1) +
            " bits of entropy.",
    },
    {
        q: "Why exclude similar or ambiguous characters?",
        a: "Characters such as l, 1, I, O and 0 look alike in many fonts, which causes mistakes when you read a password aloud or type it from paper. Excluding them slightly reduces entropy but makes the result easier to transcribe. Excluding ambiguous symbols helps when a site or a shell script does not accept quotes, brackets or slashes.",
    },
    {
        q: "Do you save the passwords I generate?",
        a: "No. Generated values exist only in your browser tab. When you refresh or close the page they are gone, so copy a password into your password manager or the site's sign-up form before leaving.",
    },
    {
        q: "Is a PIN as secure as a password?",
        a: "No. A six-digit PIN has only a million possibilities, about 20 bits of entropy. PINs are only appropriate where the system limits the number of attempts, such as a phone lock screen or a bank card. Never use a PIN to protect something an attacker can try offline.",
    },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8";
const fieldLabel = "text-xs font-bold uppercase tracking-wider text-slate-400";

export default function PasswordGenerator() {
    const [mode, setMode] = useState<Mode>("password");

    const [length, setLength] = useState(16);
    const [upper, setUpper] = useState(true);
    const [lower, setLower] = useState(true);
    const [numbers, setNumbers] = useState(true);
    const [symbols, setSymbols] = useState(true);
    const [noSimilar, setNoSimilar] = useState(false);
    const [noAmbiguous, setNoAmbiguous] = useState(false);

    const [words, setWords] = useState(5);
    const [separator, setSeparator] = useState("-");
    const [capitalize, setCapitalize] = useState(true);
    const [addNumber, setAddNumber] = useState(true);

    const [pinLength, setPinLength] = useState(6);

    const [count, setCount] = useState(1);
    const [results, setResults] = useState<{ value: string; bits: number }[]>([]);
    const [hidden, setHidden] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const generate = useCallback(() => {
        const out: { value: string; bits: number }[] = [];
        for (let i = 0; i < count; i++) {
            if (mode === "password") {
                out.push(
                    generatePassword({ length, upper, lower, numbers, symbols, noSimilar, noAmbiguous })
                );
            } else if (mode === "passphrase") {
                out.push(generatePassphrase({ words, separator, capitalize, addNumber }));
            } else {
                out.push(generatePin(pinLength));
            }
        }
        setResults(out);
        setCopiedIndex(null);
    }, [
        mode, count, length, upper, lower, numbers, symbols, noSimilar, noAmbiguous,
        words, separator, capitalize, addNumber, pinLength,
    ]);

    // Generated on the client only, so server and client HTML never disagree.
    useEffect(() => {
        generate();
    }, [generate]);

    const copy = async (value: string, index: number) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex((c) => (c === index ? null : c)), 2000);
        } catch {
            /* clipboard blocked: user can still select the text */
        }
    };

    const first = results[0];
    const bits = first?.bits ?? 0;
    const strength = getStrength(bits);
    const noneSelected = mode === "password" && buildSets({ length, upper, lower, numbers, symbols, noSimilar, noAmbiguous }).length === 0;

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

    const modeTabs: { id: Mode; label: string; icon: React.ReactNode }[] = [
        { id: "password", label: "Password", icon: <KeyRound className="h-4 w-4" /> },
        { id: "passphrase", label: "Passphrase", icon: <Type className="h-4 w-4" /> },
        { id: "pin", label: "PIN", icon: <Hash className="h-4 w-4" /> },
    ];

    const Toggle = ({
        checked,
        onChange,
        label,
        hint,
    }: {
        checked: boolean;
        onChange: (v: boolean) => void;
        label: string;
        hint?: string;
    }) => (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 transition hover:border-slate-700">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-500"
            />
            <span>
                <span className="block text-xs font-semibold text-slate-200">{label}</span>
                {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
            </span>
        </label>
    );

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

            {/* ---------------- Tool ---------------- */}
            <div className={`${card} shadow-xl shadow-black/20`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                            <KeyRound className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Strong Password Generator</h2>
                            <p className="text-xs text-slate-400">
                                Random passwords, passphrases and PINs created locally in your browser.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        <Lock className="h-3.5 w-3.5" />
                        Nothing leaves your device
                    </div>
                </div>

                {/* Mode tabs */}
                <div role="tablist" aria-label="Generator type" className="mb-6 inline-flex rounded-2xl border border-slate-800 bg-slate-950/60 p-1">
                    {modeTabs.map((t) => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={mode === t.id}
                            onClick={() => setMode(t.id)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${mode === t.id
                                ? "bg-cyan-500 text-slate-950"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Output */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <span
                            aria-live="polite"
                            className="min-w-0 flex-1 break-all font-mono text-lg font-bold tracking-wider text-slate-100 md:text-xl"
                        >
                            {noneSelected
                                ? "Select at least one character type"
                                : first
                                    ? hidden
                                        ? "•".repeat(Math.min(first.value.length, 40))
                                        : first.value
                                    : ""}
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                onClick={() => setHidden((h) => !h)}
                                aria-label={hidden ? "Show password" : "Hide password"}
                                title={hidden ? "Show" : "Hide"}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                            >
                                {hidden ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={generate}
                                aria-label="Generate a new one"
                                title="Generate new"
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => first && copy(first.value, 0)}
                                disabled={!first?.value}
                                aria-label="Copy to clipboard"
                                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
                            >
                                {copiedIndex === 0 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copiedIndex === 0 ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>

                    {/* Strength */}
                    <div className="mt-4 grid gap-3 border-t border-slate-800 pt-4 sm:grid-cols-3">
                        <div>
                            <div className={fieldLabel}>Strength</div>
                            <div className={`mt-1 flex items-center gap-1.5 text-sm font-bold ${strength.text}`}>
                                {strength.good ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                {strength.label}
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className={`h-full ${strength.bar} transition-all duration-300`}
                                    style={{ width: `${strength.pct}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className={fieldLabel}>Entropy</div>
                            <div className="mt-1 text-sm font-bold text-slate-100">{Math.round(bits)} bits</div>
                        </div>
                        <div>
                            <div className={fieldLabel}>Estimated crack time</div>
                            <div className="mt-1 text-sm font-bold text-slate-100">{formatCrackTime(bits)}</div>
                            <div className="text-[10px] text-slate-500">at 10 billion guesses per second</div>
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div className="mt-6 space-y-6">
                    {mode === "password" && (
                        <>
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label htmlFor="pw-length" className={fieldLabel}>
                                        Length
                                    </label>
                                    <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-extrabold text-cyan-300">
                                        {length} characters
                                    </span>
                                </div>
                                <input
                                    id="pw-length"
                                    type="range"
                                    min={8}
                                    max={64}
                                    value={length}
                                    onChange={(e) => setLength(Number(e.target.value))}
                                    className="w-full cursor-pointer accent-cyan-500"
                                />
                                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                                    <span>8</span>
                                    <span>16 recommended</span>
                                    <span>64</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Toggle checked={upper} onChange={setUpper} label="Uppercase letters" hint="A B C" />
                                <Toggle checked={lower} onChange={setLower} label="Lowercase letters" hint="a b c" />
                                <Toggle checked={numbers} onChange={setNumbers} label="Numbers" hint="1 2 3" />
                                <Toggle checked={symbols} onChange={setSymbols} label="Symbols" hint="! @ # $ %" />
                                <Toggle
                                    checked={noSimilar}
                                    onChange={setNoSimilar}
                                    label="Exclude similar characters"
                                    hint="Skips i, l, 1, L, o, 0, O"
                                />
                                <Toggle
                                    checked={noAmbiguous}
                                    onChange={setNoAmbiguous}
                                    label="Exclude ambiguous symbols"
                                    hint="Skips { } [ ] ( ) / \ ' &quot; ` ~ , ; : . < >"
                                />
                            </div>
                        </>
                    )}

                    {mode === "passphrase" && (
                        <>
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label htmlFor="pp-words" className={fieldLabel}>
                                        Number of words
                                    </label>
                                    <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-extrabold text-cyan-300">
                                        {words} words
                                    </span>
                                </div>
                                <input
                                    id="pp-words"
                                    type="range"
                                    min={3}
                                    max={10}
                                    value={words}
                                    onChange={(e) => setWords(Number(e.target.value))}
                                    className="w-full cursor-pointer accent-cyan-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <label htmlFor="pp-sep" className={`${fieldLabel} mb-1 block`}>
                                        Separator
                                    </label>
                                    <select
                                        id="pp-sep"
                                        value={separator}
                                        onChange={(e) => setSeparator(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                                    >
                                        <option value="-">Hyphen ( - )</option>
                                        <option value=".">Dot ( . )</option>
                                        <option value="_">Underscore ( _ )</option>
                                        <option value=" ">Space</option>
                                        <option value="">None</option>
                                    </select>
                                </div>
                                <div className="sm:pt-5">
                                    <Toggle checked={capitalize} onChange={setCapitalize} label="Capitalize words" />
                                </div>
                                <div className="sm:pt-5">
                                    <Toggle checked={addNumber} onChange={setAddNumber} label="Add a number" hint="0 to 99 at the end" />
                                </div>
                            </div>
                        </>
                    )}

                    {mode === "pin" && (
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="pin-length" className={fieldLabel}>
                                    PIN length
                                </label>
                                <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-extrabold text-cyan-300">
                                    {pinLength} digits
                                </span>
                            </div>
                            <input
                                id="pin-length"
                                type="range"
                                min={4}
                                max={12}
                                value={pinLength}
                                onChange={(e) => setPinLength(Number(e.target.value))}
                                className="w-full cursor-pointer accent-cyan-500"
                            />
                            <p className="mt-2 text-[11px] text-slate-500">
                                PINs are only safe where the system limits the number of attempts, such as a phone or bank card.
                            </p>
                        </div>
                    )}

                    {/* Bulk */}
                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-5">
                        <label htmlFor="pw-count" className={fieldLabel}>
                            How many?
                        </label>
                        <select
                            id="pw-count"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                        >
                            {[1, 5, 10, 20].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={generate}
                            className="ml-auto flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-100 transition hover:bg-slate-700"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Generate again
                        </button>
                    </div>

                    {results.length > 1 && (
                        <ul className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                            {results.map((r, i) => (
                                <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
                                    <span className="min-w-0 break-all font-mono text-sm text-slate-200">
                                        {hidden ? "•".repeat(Math.min(r.value.length, 24)) : r.value}
                                    </span>
                                    <button
                                        onClick={() => copy(r.value, i)}
                                        aria-label={`Copy item ${i + 1}`}
                                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                                    >
                                        {copiedIndex === i ? (
                                            <Check className="h-4 w-4 text-emerald-400" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* ---------------- About ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">About the Strong Password Generator</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        This free tool creates random passwords, memorable passphrases and numeric PINs directly in your
                        browser. Randomness comes from the Web Crypto API (<code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">crypto.getRandomValues</code>),
                        the cryptographically secure generator built into modern browsers, rather than{" "}
                        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300">Math.random()</code>, which is not designed for security.
                        Characters are drawn without modulo bias, and every character type you select is guaranteed to
                        appear at least once.
                    </p>
                    <p>
                        Nothing you generate is transmitted, stored or logged. There is no account, no limit and no
                        tracking of the passwords themselves. Alongside each result you get an entropy figure and a
                        rough crack-time estimate so you can see why length matters more than complexity.
                    </p>
                </div>
            </section>

            {/* ---------------- How to use + features ---------------- */}
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
                            "Choose a type: Password for password-manager accounts, Passphrase for things you must type from memory, PIN for numeric codes.",
                            "Set the length and the character types. 16 characters with all four types is a good default.",
                            "Watch the strength meter and entropy. Aim for 80 bits or more for important accounts.",
                            "Click Copy and paste it straight into your password manager or the sign-up form. The value is not saved here.",
                        ].map((t, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">
                                    {i + 1}
                                </span>
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
                            "Cryptographically secure randomness, with no modulo bias",
                            "Passwords from 8 to 64 characters with a guarantee of every selected type",
                            "Passphrase mode with an adjustable word count and separator",
                            "Exclude look-alike characters (l, 1, O, 0) and awkward symbols",
                            "Entropy in bits and a crack-time estimate for every result",
                            "Bulk generation of up to 20 at once, with show and hide",
                            "Free, no sign-up, and works offline after the page loads",
                        ].map((t) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ---------------- What makes a password strong ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">What Makes a Password Strong?</h2>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                    <p>
                        Password strength is measured in <strong className="text-slate-100">entropy</strong>: the number of bits of
                        unpredictability. A password with N bits of entropy takes about 2<sup>N</sup> guesses to find by
                        brute force, and every extra bit doubles the work. Entropy comes from two things only: how many
                        characters you use, and how many different characters each position could be, provided each one
                        is picked at random.
                    </p>
                    <p>
                        That is why a human-chosen password is weaker than it looks. People follow patterns, such as a
                        capital first letter and digits at the end, and attackers check those patterns first. A randomly
                        generated password has no pattern to exploit. The table below shows the entropy of random
                        passwords and how long an attacker making ten billion guesses per second would need on average.
                    </p>
                </div>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[560px] text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-bold">Character set</th>
                                <th className="px-4 py-3 font-bold">Shorter</th>
                                <th className="px-4 py-3 font-bold">Medium</th>
                                <th className="px-4 py-3 font-bold">Longer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {ENTROPY_ROWS.map((r) => (
                                <tr key={r.label}>
                                    <td className="px-4 py-3 font-semibold text-slate-200">{r.label}</td>
                                    {r.cells.map((c) => (
                                        <td key={c.len} className="px-4 py-3">
                                            <div className="font-semibold text-slate-100">
                                                {c.len} chars, {c.bits} bits
                                            </div>
                                            <div className="text-[11px] text-slate-500">{c.time}</div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                    Estimates assume purely random characters and a fast offline attack on a weakly protected password
                    database. Sites that use slow hashing such as bcrypt or Argon2 are far harder to attack.
                </p>
            </section>

            {/* ---------------- Passphrases ---------------- */}
            <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-slate-100">Passwords vs. Passphrases vs. PINs</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            icon: <KeyRound className="h-5 w-5" />,
                            title: "Passwords",
                            body: "Best for accounts managed by a password manager. A 16 to 20 character random string is strong and you never have to remember it.",
                        },
                        {
                            icon: <Type className="h-5 w-5" />,
                            title: "Passphrases",
                            body: `Several random words joined together. Each word from our ${WORDS.length}-word list adds about ${Math.log2(WORDS.length).toFixed(1)} bits, so five words give roughly ${Math.round(5 * Math.log2(WORDS.length))} bits. Ideal for your master password or device login.`,
                        },
                        {
                            icon: <Hash className="h-5 w-5" />,
                            title: "PINs",
                            body: "Short numeric codes with very little entropy. Acceptable only where the system locks you out after a few wrong tries.",
                        },
                    ].map((c) => (
                        <div key={c.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                                {c.icon}
                            </div>
                            <h3 className="mb-1.5 text-sm font-bold text-slate-100">{c.title}</h3>
                            <p className="text-xs leading-relaxed text-slate-400">{c.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Mistakes ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Common Password Mistakes</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {MISTAKES.map((m) => (
                        <div key={m.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                            <h3 className="mb-1.5 text-sm font-bold text-slate-100">{m.title}</h3>
                            <p className="text-xs leading-relaxed text-slate-400">{m.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Best practices ---------------- */}
            <section className={card}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">Best Practices for Staying Secure</h2>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                    {[
                        "Use a reputable password manager so every account can have a unique, random password without you memorising any of them.",
                        "Protect the manager itself with a long passphrase of five or more random words and turn on two-factor authentication.",
                        "Enable two-factor authentication on your email first. Email can reset almost every other account.",
                        "Change a password straight away if a service reports a breach, and check whether your address appears in known leaks.",
                        "Do not change passwords on a fixed schedule without a reason. Frequent forced changes lead to weaker, predictable choices; change them when there is evidence of compromise.",
                        "Be careful on shared computers: copy the password, paste it, and clear the clipboard afterwards.",
                    ].map((t) => (
                        <li key={t} className="flex items-start gap-2.5">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            <span>{t}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ---------------- FAQ ---------------- */}
            <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-100">Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {FAQS.map((f) => (
                        <details
                            key={f.q}
                            className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-4 open:border-slate-700"
                        >
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
                        { href: "/tools/word-counter", t: "Word Counter", d: "Count words, characters and reading time." },
                        { href: "/tools/json-formatter", t: "JSON Formatter", d: "Format, validate and minify JSON." },
                    ].map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40"
                        >
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