type ToolCardProps = {
    name: string;
    description: string;
};

export default function ToolCard({
    name,
    description,
}: ToolCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-xl font-semibold">
                {name}
            </h3>

            <p className="mt-3 text-slate-600">
                {description}
            </p>

            <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                Open Tool
            </button>
        </div>
    );
};