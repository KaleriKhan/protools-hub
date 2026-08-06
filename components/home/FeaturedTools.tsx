const featuredTools = [
    {
        title: "PDF to Word",
        description: "Convert PDF documents into editable Word files.",
    },
    {
        title: "Image Compressor",
        description: "Reduce image size without losing quality.",
    },
    {
        title: "QR Code Generator",
        description: "Generate QR codes for URLs, text and more.",
    },
    {
        title: "Password Generator",
        description: "Create strong and secure random passwords.",
    },
    {
        title: "JSON Formatter",
        description: "Format and validate JSON instantly.",
    },
    {
        title: "Age Calculator",
        description: "Calculate your exact age in seconds.",
    },
];

export default function FeaturedTools() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-slate-900">
                    Featured Tools
                </h2>

                <p className="mt-3 text-slate-600">
                    Our most popular and frequently used online tools.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredTools.map((tool) => (
                    <div
                        key={tool.title}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <h3 className="text-xl font-semibold">
                            {tool.title}
                        </h3>

                        <p className="mt-3 text-slate-600">
                            {tool.description}
                        </p>

                        <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                            Open Tool
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};