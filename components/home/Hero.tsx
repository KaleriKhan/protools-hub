import SearchBar from "@/components/ui/SearchBar";
import PopularSearches from "@/components/home/PopularSearches";

export default function Hero() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-4xl">
                <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                    🚀 100% Free • Fast • Secure
                </span>

                <h1 className="mt-8 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
                    Free Online Tools for
                    <span className="text-blue-600"> Everyone</span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                    Use powerful online tools for PDF, Images, Text, Developers,
                    Calculators and AI — all in one place, completely free.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                    <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                        Explore Tools
                    </button>

                    <button className="rounded-xl border border-slate-300 px-6 py-3 font-semibold transition hover:bg-slate-100">
                        View Categories
                    </button>

                    <SearchBar />
                    <PopularSearches />
                </div>
            </div>
        </section>
    );
};