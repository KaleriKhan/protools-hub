import { Zap, ShieldCheck, UserCheck, Smartphone, type LucideIcon } from "lucide-react";

type FeatureItem = { title: string; description: string; icon: LucideIcon; iconColor: string; bgColor: string };

const FEATURES: FeatureItem[] = [
    {
        title: "Free to use",
        description: "Every tool is free with no premium tier or file-size paywall. The site is supported by advertising, so you never have to pay.",
        icon: Zap, iconColor: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20",
    },
    {
        title: "Private by design",
        description: "Files you compress, convert or edit are processed in your browser and are not uploaded to our servers.",
        icon: ShieldCheck, iconColor: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
        title: "No account needed",
        description: "Open a tool and use it. There is no sign-up, login or email request standing between you and the result.",
        icon: UserCheck, iconColor: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
        title: "Works on any device",
        description: "Responsive pages that run in current versions of Chrome, Edge, Firefox and Safari on desktop, tablet and phone.",
        icon: Smartphone, iconColor: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="border-b border-slate-800 bg-slate-950 py-24">
            <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl space-y-3 text-center">
                    <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Why people use ProTools Hub</h2>
                    <p className="text-sm leading-relaxed text-slate-400 md:text-base">
                        Simple tools that do one job well, explained clearly and built to respect your files.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map(({ title, description, icon: Icon, iconColor, bgColor }) => (
                        <div
                            key={title}
                            className="group rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
                        >
                            <div className="space-y-5">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-110 ${bgColor} ${iconColor}`}>
                                    <Icon className="h-7 w-7" aria-hidden="true" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-200 transition-colors group-hover:text-blue-400">{title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">{description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}