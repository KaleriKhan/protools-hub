"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navigation, isActivePath, legalLinks } from "@/data/navigation";

export default function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const wrapRef = useRef<HTMLDivElement>(null);

    // Close after navigating
    useEffect(() => setOpen(false), [pathname]);

    // Close on Escape or outside click
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onClick = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, [open]);

    return (
        <div ref={wrapRef} className="relative md:hidden">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="mobile-nav-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 p-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span>{open ? "Close" : "Menu"}</span>
            </button>

            {open && (
                <nav
                    id="mobile-nav-menu"
                    aria-label="Mobile navigation"
                    className="absolute right-0 top-full z-50 mt-2 w-64 space-y-1 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl"
                >
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActivePath(pathname, item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                                    active ? "bg-blue-500/10 text-blue-400" : "text-slate-200 hover:bg-slate-800 hover:text-blue-400"
                                }`}
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                {item.name}
                            </Link>
                        );
                    })}
                    <div className="mt-2 flex items-center justify-center gap-4 border-t border-slate-800 pt-3 text-xs text-slate-400">
                        {legalLinks.map((l) => (
                            <Link key={l.href} href={l.href} className="transition hover:text-white">{l.name}</Link>
                        ))}
                    </div>
                </nav>
            )}
        </div>
    );
}