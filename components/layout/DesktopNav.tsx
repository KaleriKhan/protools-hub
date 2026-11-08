"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, isActivePath } from "@/data/navigation";

export default function DesktopNav() {
    const pathname = usePathname();

    return (
        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Main navigation">
            {navigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active
                                ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                : "border-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}