import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://myprotoolshub.com";

    const tools = [
        "image-upscaler",
        "background-remover",
        "glassmorphism-generator",
        "image-compressor",
        "image-resizer",
        "json-formatter",
        "lorem-ipsum-generator",
        "markdown-to-html",
        "password-generator",
        "pdf-compressor",
        "pdf-to-word",
        "qr-code-generator",
        "text-case-converter",
        "text-summarizer",
        "word-counter",
        "base64-encoder"
    ];

    const toolUrls = tools.map((tool) => ({
        url: `${baseUrl}/tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/tools`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        ...toolUrls,
    ];
}