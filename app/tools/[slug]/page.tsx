import { notFound } from "next/navigation";
import { tools } from "@/data/tools";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;

  const tool = tools.find((item) => item.slug === slug);

  if (!tool) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold">{tool.name}</h1>

      <p className="mt-4 text-lg text-slate-600">
        {tool.description}
      </p>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-slate-700">
          🚀 Tool interface will be built here in the next parts.
        </p>
      </div>
    </main>
  );
}