const features = [
    {
        title: "100% Free",
        description: "All tools are free to use without hidden charges.",
    },
    {
        title: "Fast & Secure",
        description: "Your files are processed quickly with privacy in mind.",
    },
    {
        title: "No Registration",
        description: "Use tools instantly without creating an account.",
    },
    {
        title: "Works Everywhere",
        description: "Desktop, tablet and mobile friendly experience.",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="text-center">
                <h2 className="text-3xl font-bold">
                    Why Choose ProTools Hub?
                </h2>

                <p className="mt-4 text-slate-600">
                    Everything you need in one place — fast, simple and secure.
                </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <h3 className="text-xl font-semibold">
                            {feature.title}
                        </h3>

                        <p className="mt-3 text-slate-600">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};