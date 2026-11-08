"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { navigation, isActivePath, legalLinks } from "@/data/navigation";

const groups = [
    { key: "main", label: "Toolkit" },
    { key: "resources", label: "Resources & Help" },
] as const;

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden h-full shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:flex md:w-64">
            <div className="flex h-20 shrink-0 items-center px-6">
                <Logo />
            </div>

            <nav aria-label="Sidebar" className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
                {groups.map((g) => (
                    <div key={g.key} className="pb-2">
                        <div className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {g.label}
                        </div>
                        {navigation.filter((n) => n.group === g.key).map((item) => {
                            const Icon = item.icon;
                            const active = isActivePath(pathname, item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                                        active
                                            ? "border-blue-500/20 bg-blue-600/10 text-blue-400"
                                            : "border-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="shrink-0 space-y-2 border-t border-slate-800 p-4 text-center text-xs text-slate-500">
                <div className="flex items-center justify-center gap-3 text-slate-400">
                    {legalLinks.map((l, i) => (
                        <span key={l.href} className="flex items-center gap-3">
                            {i > 0 && <span aria-hidden="true">·</span>}
                            <Link href={l.href} className="transition hover:text-white">{l.name}</Link>
                        </span>
                    ))}
                </div>
                <p>© {new Date().getFullYear()} ProTools Hub</p>
            </div>
        </aside>
    );
}