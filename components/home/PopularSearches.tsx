import Link from "next/link";

// Each term opens the tool directory filtered by that search.
const searches = [
    "PDF to Word",
    "Image Compressor",
    "Image Resizer",
    "QR Code",
    "Password",
    "JSON",
    "Word Counter",
    "Markdown",
];

export default function PopularSearches() {
    return (
        <div className="mt-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Popular searches</p>
            <ul className="flex flex-wrap items-center justify-center gap-2.5">
                {searches.map((item) => (
                    <li key={item}>
                        <Link
                            href={`/categories?q=${encodeURIComponent(item)}`}
                            className="inline-block rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 shadow-sm transition-all duration-200 hover:border-blue-500 hover:bg-blue-600/10 hover:text-blue-400"
                        >
                            {item}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}