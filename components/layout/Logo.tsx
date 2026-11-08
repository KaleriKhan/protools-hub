import Link from "next/link";
import { Wrench } from "lucide-react";

export default function Logo({ size = "md" }: { size?: "sm" | "md" }) {
    const box = size === "sm" ? "h-9 w-9" : "h-10 w-10";
    return (
        <Link
            href="/"
            aria-label="ProTools Hub home"
            className="group flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
            <div className={`flex ${box} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105`}>
                <Wrench className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight text-white">
                    ProTools<span className="text-blue-400">Hub</span>
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Free Online Tools
                </span>
            </div>
        </Link>
    );
}