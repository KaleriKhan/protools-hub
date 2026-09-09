"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/navigation";

export default function DesktopNav() {
    const pathname = usePathname();

    return (
        <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`text-xs font-bold transition-colors ${isActive
                                ? "text-blue-600"
                                : "text-slate-600 hover:text-blue-600"
                            }`}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}