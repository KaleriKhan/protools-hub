"use client";

import { Zap, ShieldCheck, UserCheck, Smartphone } from "lucide-react";

type FeatureItem = {
    title: string;
    description: string;
    icon: any;
    iconColor: string;
    bgColor: string;
};

const FEATURES: FeatureItem[] = [
    {
        title: "100% Free",
        description: "All tools are free to use without hidden charges or premium paywalls.",
        icon: Zap,
        iconColor: "text-amber-500",
        bgColor: "bg-amber-50/80 border-amber-100",
    },
    {
        title: "Fast & Secure",
        description: "Your files are processed instantly right inside your browser with complete privacy.",
        icon: ShieldCheck,
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-50/80 border-emerald-100",
    },
    {
        title: "No Registration",
        description: "Use tools instantly without creating an account, logging in, or sharing emails.",
        icon: UserCheck,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50/80 border-blue-100",
    },
    {
        title: "Works Everywhere",
        description: "Fully responsive desktop, tablet, and mobile-friendly experience across all browsers.",
        icon: Smartphone,
        iconColor: "text-purple-600",
        bgColor: "bg-purple-50/80 border-purple-100",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-24 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 border-b border-slate-200/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
                {/* Header */}
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Why Choose ProTools Hub?
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                        Everything you need in one place — fast, simple and secure.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((feature) => {
                        const IconComponent = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="space-y-5">
                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${feature.bgColor} ${feature.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                                    >
                                        <IconComponent className="h-7 w-7" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-normal">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}