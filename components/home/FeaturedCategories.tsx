import { tools } from "@/data/tools";
import ToolCard from "@/components/ui/ToolCard";

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
                {tools
                    .filter((tool) => tool.featured)
                    .map((tool) => (
                        <ToolCard
                            key={tool.id}
                            name={tool.name}
                            description={tool.description}
                        />
                    ))}
            </div>
        </section>
    );
};