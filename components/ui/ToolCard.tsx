import Link from "next/link";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";

type ToolCardProps = {
    name: string;
    description: string;
    slug: string;
    category?: string;
    icon?: LucideIcon;
};

export default function ToolCard({ name, description, slug, category, icon: Icon = Sparkles }: ToolCardProps) {
    return (
        <Link
            href={`/tools/${slug}`}
            aria-label={`Open ${name}`}
            className="group flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
            <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {category && (
                        <span className="rounded-lg bg-slate-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                            {category}
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-blue-400">{name}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{description}</p>
            </div>

            <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400">
                Open tool
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
        </Link>
    );
}