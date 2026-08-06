const searches = [
    "PDF to Word",
    "Image Compressor",
    "QR Code Generator",
    "Password Generator",
    "JSON Formatter",
    "Age Calculator",
];

export default function PopularSearches() {
    return (
        <div className="mt-8">
            <p className="mb-3 text-sm font-semibold text-slate-500">
                Popular Searches
            </p>

            <div className="flex flex-wrap gap-3">
                {searches.map((item) => (
                    <button
                        key={item}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
};