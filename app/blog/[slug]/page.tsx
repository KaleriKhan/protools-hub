// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Lightbulb, Wrench } from "lucide-react";
import { POSTS, AUTHOR, SITE, getPost, formatDate } from "@/data/posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${SITE}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    authors: [{ name: AUTHOR }],
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: "ProTools Hub",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
    twitter: { card: "summary", title: post.title, description: post.description },
  };
}

const safeJson = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE}/blog/${post.slug}`;
  const related = post.related.map((s) => getPost(s)).filter((p): p is NonNullable<typeof p> => !!p);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: url,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      author: { "@type": "Organization", name: AUTHOR, url: SITE },
      publisher: { "@type": "Organization", name: "ProTools Hub", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(d) }} />
      ))}

      <article className="bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/blog" className="inline-flex items-center gap-1.5 transition hover:text-blue-400">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-300">{post.category}</span>
          </nav>

          <header className="space-y-5">
            <span className="inline-block rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-400">
              {post.category}
            </span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">{post.title}</h1>
            <p className="text-base leading-relaxed text-slate-300 md:text-lg">{post.excerpt}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-slate-800 py-4 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" aria-hidden="true" />{AUTHOR}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{post.readTime}</span>
            </div>
          </header>

          <aside className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
              <Lightbulb className="h-4 w-4" aria-hidden="true" /> Key takeaways
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
              {post.takeaways.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </aside>

          <nav aria-label="Table of contents" className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">In this article</h2>
            <ol className="space-y-2 text-sm">
              {post.sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-slate-300 transition hover:text-blue-400">
                    <span className="mr-2 text-slate-500">{i + 1}.</span>{s.heading}
                  </a>
                </li>
              ))}
              <li><a href="#faq" className="text-slate-300 transition hover:text-blue-400"><span className="mr-2 text-slate-500">{post.sections.length + 1}.</span>Frequently asked questions</a></li>
            </ol>
          </nav>

          <div className="space-y-10">
            {post.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-white">{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="text-[15px] leading-8 text-slate-300">{p}</p>
                ))}
                {s.bullets && (
                  <ul className="space-y-2.5 pl-1">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-[15px] leading-7 text-slate-300">
                        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <Link
            href={post.tool.href}
            className="group flex flex-col items-start justify-between gap-4 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-600/15 to-indigo-600/10 p-6 transition hover:border-blue-400/60 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Try it free</p>
                <h3 className="text-lg font-bold text-white">{post.tool.name}</h3>
                <p className="mt-1 text-sm text-slate-300">{post.tool.blurb}</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition group-hover:bg-blue-500">
              Open tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>

          <section id="faq" className="scroll-mt-24 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Frequently asked questions</h2>
            <div className="space-y-3">
              {post.faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 open:border-blue-500/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white">
                    {f.q}
                    <span className="text-blue-400 transition group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section className="space-y-4 border-t border-slate-800 pt-10">
              <h2 className="text-xl font-bold text-white">Keep reading</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">{r.category}</span>
                    <h3 className="mt-2 text-base font-bold text-white transition group-hover:text-blue-400">{r.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{r.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-500">
            Written by the {AUTHOR}. This article is for general information. Features and browser support change over time, so check current documentation for anything critical.
          </p>
        </div>
      </article>
    </>
  );
}