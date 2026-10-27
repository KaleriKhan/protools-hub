"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    // Keyboard accessibility: Close mobile menu on pressing 'Escape'
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    return (
        <div className="md:hidden relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
                aria-controls="mobile-nav-menu"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span>{isOpen ? "Close" : "Menu"}</span>
            </button>

            {/* Mobile Navigation Drawer / Links */}
            {isOpen && (
                <div
                    id="mobile-nav-menu"
                    className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg p-4 space-y-3 z-50"
                >
                    <a
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    >
                        Home
                    </a>
                    <a
                        href="/tools"
                        onClick={() => setIsOpen(false)}
                        className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    >
                        All Tools
                    </a>
                    <a
                        href="/categories"
                        onClick={() => setIsOpen(false)}
                        className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    >
                        Categories
                    </a>
                    <a
                        href="/blog"
                        onClick={() => setIsOpen(false)}
                        className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    >
                        Blog
                    </a>
                    <a
                        href="/contact"
                        onClick={() => setIsOpen(false)}
                        className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    >
                        Contact
                    </a>
                </div>
            )}
        </div>
    );
}