"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/navigation";

export default function DesktopNav() {
    const pathname = usePathname();

    return (
        <nav className="hidden md:flex items-center gap-4" aria-label="Desktop Main Navigation">
            {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive
                                ? "text-blue-600 bg-blue-50/80"
                                : "text-slate-600 hover:text-blue-600 hover:bg-slate-100/60"
                            }`}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}