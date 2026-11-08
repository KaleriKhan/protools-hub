// components/seo/ToolJsonLd.tsx
import { toolJsonLd, type ToolLike } from "@/lib/seo";

export default function ToolJsonLd({ tool }: { tool: ToolLike }) {
    return (
        <>
            {toolJsonLd(tool).map((d, i) => (
                <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />
            ))}
        </>
    );
}