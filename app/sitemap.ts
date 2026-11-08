// app/sitemap.ts
import type { MetadataRoute } from "next";
import { tools } from "@/data/tools";
import { POSTS } from "@/data/posts";
import { SITE_URL } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

// Tool URLs come from data/tools.ts, so the sitemap can never list a page that does not exist
// and new tools are added automatically. Update these dates when you actually change a page.
const SITE_UPDATED = new Date("2026-11-07");

export default function sitemap(): MetadataRoute.Sitemap {
    const pages: Entry[] = [
        { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
        { url: `${SITE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 },
        { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.5 },
        { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
        { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ].map((e) => ({ ...e, lastModified: SITE_UPDATED }) as Entry);

    const toolPages: Entry[] = tools.map((t) => ({
        url: `${SITE_URL}/tools/${t.slug}`,
        lastModified: SITE_UPDATED,
        changeFrequency: "monthly",
        priority: 0.9,
    }));

    const blogPages: Entry[] = POSTS.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.updated ?? p.date),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    return [...pages, ...toolPages, ...blogPages];
}