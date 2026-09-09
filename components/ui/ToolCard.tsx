import Link from "next/link";

type ToolCardProps = {
    name: string;
    description: string;
    slug: string;
};

export default function ToolCard({
    name,
    description,
    slug,
}: ToolCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-slate-900">
                {name}
            </h3>

            <p className="mt-3 text-slate-600">
                {description}
            </p>

            <Link
                href={`/tools/${slug}`}
                className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
                Open Tool
            </Link>
        </div>
    );
};