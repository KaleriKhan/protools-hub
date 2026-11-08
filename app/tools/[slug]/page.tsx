import type { ComponentType } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { tools } from "@/data/tools";
import { toolMetadata } from "@/lib/seo";
import ToolJsonLd from "@/components/seo/ToolJsonLd";

// Tool components. Each one already contains its own about text, how-to, tips and FAQ.
import JsonFormatter from "@/components/tools/JsonFormatter";
import ImageCompressor from "@/components/tools/ImageCompressor";
import QRCodeGenerator from "@/components/tools/QRCodeGenerator";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import TextCaseConverter from "@/components/tools/TextCaseConverter";
import WordCounter from "@/components/tools/WordCounter";
import PDFCompressor from "@/components/tools/PDFCompressor";
import PDFToWord from "@/components/tools/PDFToWord";
import MarkdownToHtml from "@/components/tools/MarkdownToHtml";
import LoremIpsumGenerator from "@/components/tools/LoremIpsumGenerator";
import GlassmorphismGenerator from "@/components/tools/glassmorphismgenerator";
// Added: these tools existed in your data but were not connected to this page.
// If a file name differs in your project, change only the text after "tools/".
import ImageResizer from "@/components/tools/ImageResizer";
import ImageUpscaler from "@/components/tools/imageupscaler";
import TextSummarizer from "@/components/tools/TextSummarizer";
import Base64EncoderTool from "@/components/tools/Base64EncoderTool";
import JSONSchemaGenerator from "@/components/tools/JsonSchemaGeneratorClient";

type PageProps = { params: Promise<{ slug: string }> };

// slug -> component. Exact slugs only; there is no "anything containing generator" fallback.
const COMPONENTS: Record<string, ComponentType> = {
  "json-formatter": JsonFormatter,
  "json-schema-generator": JSONSchemaGenerator,
  "image-compressor": ImageCompressor,
  "image-resizer": ImageResizer,
  "image-upscaler": ImageUpscaler,
  "qr-code-generator": QRCodeGenerator,
  "password-generator": PasswordGenerator,
  "text-case-converter": TextCaseConverter,
  "word-counter": WordCounter,
  "text-summarizer": TextSummarizer,
  "pdf-compressor": PDFCompressor,
  "pdf-to-word": PDFToWord,
  "markdown-to-html": MarkdownToHtml,
  "lorem-ipsum-generator": LoremIpsumGenerator,
  "base64-encoder": Base64EncoderTool,
  "css-generators": GlassmorphismGenerator,
  "glassmorphism-generator": GlassmorphismGenerator,
};

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);

  if (!tool) {
    return { title: "Tool Not Found", robots: { index: false, follow: false } };
  }

  const meta = toolMetadata(tool);
  // A tool with no component yet should not be indexed as an empty page.
  return COMPONENTS[slug] ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) notFound();

  const ToolComponent = COMPONENTS[slug];

  // Internal links: same-category tools first, then the rest.
  const related = [
    ...tools.filter((t) => t.slug !== slug && t.category === tool.category),
    ...tools.filter((t) => t.slug !== slug && t.category !== tool.category),
  ].slice(0, 3);

  return (
    <div className="w-full bg-slate-950 text-slate-100">
      <ToolJsonLd tool={tool} />

      <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 pt-8 text-xs font-semibold text-slate-400 sm:px-6">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link href="/tools" className="hover:text-blue-400">Tools</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-slate-300">{tool.name}</span>
      </nav>

      <header className="mx-auto max-w-3xl px-4 pb-10 pt-8 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {tool.category} utility
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">{tool.name}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-400 sm:text-lg">{tool.description}</p>
      </header>

      <div className="mb-16">
        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="font-medium text-slate-300">This tool is being updated. Please check back soon.</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6 text-xl font-bold text-white">More free tools</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((t) => (
              <Link
                key={t.id}
                href={`/tools/${t.slug}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500/50"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">{t.category}</span>
                <h3 className="mt-2 text-base font-bold text-white transition group-hover:text-blue-400">{t.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{t.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-400">
                  Open tool <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}