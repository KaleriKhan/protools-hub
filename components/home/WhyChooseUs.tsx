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
        bgColor: "bg-amber-50 border-amber-100",
    },
    {
        title: "Fast & Secure",
        description: "Your files are processed instantly right inside your browser with complete privacy.",
        icon: ShieldCheck,
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-50 border-emerald-100",
    },
    {
        title: "No Registration",
        description: "Use tools instantly without creating an account, logging in, or sharing emails.",
        icon: UserCheck,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-100",
    },
    {
        title: "Works Everywhere",
        description: "Fully responsive desktop, tablet, and mobile-friendly experience across all browsers.",
        icon: Smartphone,
        iconColor: "text-purple-600",
        bgColor: "bg-purple-50 border-purple-100",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-16 bg-white border-b border-slate-200/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Header */}
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Why Choose ProTools Hub?
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
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
                                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-sm hover:border-blue-400 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200"
                            >
                                <div className="space-y-4">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.bgColor} ${feature.iconColor} group-hover:scale-110 transition-transform duration-200`}
                                    >
                                        <IconComponent className="h-6 w-6" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                                            {feature.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">
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