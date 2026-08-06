export default function SearchBar() {
    return (
        <div className="mt-10 w-full max-w-2xl">
            <input
                type="text"
                placeholder="Search tools... (PDF, Image, AI, Calculator)"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
        </div>
    );
}