"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KeyRound, Copy, Check, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

export default function PasswordGenerator() {
    const [password, setPassword] = useState("");
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [copied, setCopied] = useState(false);

    const generatePassword = useCallback(() => {
        let chars = "";
        if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
        if (includeNumbers) chars += "0123456789";
        if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

        if (!chars) {
            setPassword("");
            return;
        }

        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
    }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const handleCopy = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Strength Indicator
    const getStrength = () => {
        if (length < 8) return { label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
        if (length < 12) return { label: "Medium", color: "bg-amber-500", text: "text-amber-600" };
        return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
    };

    const strength = getStrength();

    return (
        <div className="w-full max-w-3xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                    <KeyRound className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Strong Password Generator</h3>
                    <p className="text-xs text-slate-500">Create customized, military-grade secure passwords instantly.</p>
                </div>
            </div>

            {/* Password Output Box */}
            <div className="relative mb-6">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <span className="font-mono text-lg font-bold text-slate-900 tracking-wider break-all pr-4">
                        {password || "Select options..."}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={generatePassword}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition"
                            title="Regenerate Password"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                        >
                            {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                {/* Strength Bar */}
                <div className="mt-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                        {length >= 12 ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <ShieldAlert className="h-4 w-4 text-amber-500" />}
                        <span className="text-slate-500">Strength:</span>
                        <span className={strength.text}>{strength.label}</span>
                    </div>
                    <div className="h-2 w-32 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(length / 32) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-6 border-t border-slate-100 pt-6">

                {/* Length Slider */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Password Length</label>
                        <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                            {length} Characters
                        </span>
                    </div>
                    <input
                        type="range"
                        min={6}
                        max={32}
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                    />
                </div>

                {/* Checkbox Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                        <input
                            type="checkbox"
                            checked={includeUppercase}
                            onChange={(e) => setIncludeUppercase(e.target.checked)}
                            className="h-4 w-4 accent-blue-600 rounded"
                        />
                        <span className="text-xs font-semibold text-slate-700">Uppercase Letters (A-Z)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                        <input
                            type="checkbox"
                            checked={includeLowercase}
                            onChange={(e) => setIncludeLowercase(e.target.checked)}
                            className="h-4 w-4 accent-blue-600 rounded"
                        />
                        <span className="text-xs font-semibold text-slate-700">Lowercase Letters (a-z)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                        <input
                            type="checkbox"
                            checked={includeNumbers}
                            onChange={(e) => setIncludeNumbers(e.target.checked)}
                            className="h-4 w-4 accent-blue-600 rounded"
                        />
                        <span className="text-xs font-semibold text-slate-700">Include Numbers (0-9)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                        <input
                            type="checkbox"
                            checked={includeSymbols}
                            onChange={(e) => setIncludeSymbols(e.target.checked)}
                            className="h-4 w-4 accent-blue-600 rounded"
                        />
                        <span className="text-xs font-semibold text-slate-700">Special Symbols (!@#$)</span>
                    </label>
                </div>

            </div>

        </div>
    );
}