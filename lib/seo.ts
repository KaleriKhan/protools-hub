import type { Metadata } from "next";

export const SITE_URL = "https://myprotoolshub.com";
export const SITE_NAME = "ProTools Hub";

export type ToolLike = { slug: string; name: string; description: string; category: string };


const SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
    "pdf-to-word": {
        title: "PDF to Word Converter, Free Online with OCR",
        description: "Convert PDF files to editable Word documents free in your browser. Handles scanned PDFs with English and Urdu OCR. No sign-up, no upload to our servers.",
        keywords: ["pdf to word", "convert pdf to docx", "pdf to word ocr", "scanned pdf to word"],
    },
    "pdf-compressor": {
        title: "PDF Compressor, Reduce PDF Size Online Free",
        description: "Reduce PDF file size free in your browser. Compress large or scanned PDFs for email and uploads, then check the result before you share it.",
        keywords: ["compress pdf", "reduce pdf size", "pdf compressor online"],
    },
    "image-compressor": {
        title: "Image Compressor, Compress JPG, PNG & WebP Free",
        description: "Compress JPEG, PNG and WebP images free in your browser. Choose the quality, compare before and after, and download the result. No upload needed.",
        keywords: ["image compressor", "compress jpg", "compress png", "reduce image size"],
    },
    "image-resizer": {
        title: "Image Resizer, Resize Photos Online Free",
        description: "Resize images by pixels or percent with a locked aspect ratio. Export JPEG, PNG or WebP in your browser. Free, no sign-up, nothing uploaded.",
        keywords: ["image resizer", "resize image online", "change image dimensions"],
    },
    "image-upscaler": {
        title: "Image Upscaler, Enlarge Images Online Free",
        description: "Enlarge images in your browser with high-quality resampling and optional sharpening. Free to use, no sign-up. Results depend on the original image.",
        keywords: ["image upscaler", "enlarge image", "increase image size"],
    },
    "qr-code-generator": {
        title: "QR Code Generator, Create QR Codes Free",
        description: "Create QR codes for links, Wi-Fi, text and email and download them as PNG. Free, no sign-up, generated in your browser.",
        keywords: ["qr code generator", "free qr code", "wifi qr code"],
    },
    "password-generator": {
        title: "Strong Password Generator, Free & Secure",
        description: "Generate strong random passwords with your browser's secure random generator. Choose length and character types. Nothing is stored or sent.",
        keywords: ["password generator", "strong password", "random password generator"],
    },
    "json-formatter": {
        title: "JSON Formatter & Validator, Beautify JSON Online",
        description: "Format, validate and minify JSON with clear error messages showing where the syntax breaks. Free developer tool that runs in your browser.",
        keywords: ["json formatter", "json validator", "beautify json", "json minify"],
    },
    "json-schema-generator": {
        title: "JSON Schema Generator from Sample JSON",
        description: "Generate a JSON Schema from a sample JSON document in your browser. Free developer tool with copy-ready output.",
        keywords: ["json schema generator", "generate json schema", "json to schema"],
    },
    "text-case-converter": {
        title: "Text Case Converter, Upper, Lower, Title & More",
        description: "Convert text to uppercase, lowercase, title case, sentence case, camelCase, snake_case and kebab-case instantly. Free and private.",
        keywords: ["text case converter", "uppercase to lowercase", "title case converter"],
    },
    "word-counter": {
        title: "Word Counter, Count Words & Characters Online",
        description: "Count words, characters, sentences, paragraphs and reading time as you type. Works with English, Arabic and Urdu text. Free and private.",
        keywords: ["word counter", "character counter", "reading time calculator"],
    },
    "text-summarizer": {
        title: "Text Summarizer, Summarize Long Text Free",
        description: "Pick the key sentences from long text with extractive summarizing. Choose the summary length and see key terms. Runs in your browser, free.",
        keywords: ["text summarizer", "summarize text online", "article summarizer"],
    },
    "markdown-to-html": {
        title: "Markdown to HTML Converter with Live Preview",
        description: "Convert Markdown to clean HTML with a live preview and copy the result. Free online converter that runs in your browser.",
        keywords: ["markdown to html", "markdown converter", "md to html"],
    },
    "base64-encoder": {
        title: "Base64 Encoder & Decoder, Online and Free",
        description: "Encode and decode Base64 text, including Unicode and URL-safe Base64. Free developer tool that runs in your browser.",
        keywords: ["base64 encode", "base64 decode", "base64 converter"],
    },
    "lorem-ipsum-generator": {
        title: "Lorem Ipsum Generator, Placeholder Text Free",
        description: "Generate lorem ipsum paragraphs, sentences or words for designs and layouts. Free, instant and copy-ready.",
        keywords: ["lorem ipsum generator", "placeholder text", "dummy text generator"],
    },
    "css-generators": {
        title: "CSS Glassmorphism Generator and 18 More CSS Tools",
        description: "Build frosted-glass CSS with live preview, plus box-shadow, gradient, flexbox and more generators. Copy CSS or Tailwind. Free in your browser.",
        keywords: ["glassmorphism generator", "css generator", "css box shadow generator"],
    },
};

// The CSS tool may be served at either slug; both get the same text.
SEO["glassmorphism-generator"] = SEO["css-generators"];

const clip = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");

export function toolSeo(tool: ToolLike) {
    const o = SEO[tool.slug];
    if (o) return o;
    return {
        title: `${tool.name}, Free Online ${tool.category} Tool`,
        description: clip(`${tool.description} Free to use in your browser, no sign-up required.`, 155),
        keywords: [tool.name.toLowerCase(), `free ${tool.name.toLowerCase()}`, `online ${tool.category.toLowerCase()} tool`],
    };
}

export function toolMetadata(tool: ToolLike): Metadata {
    const { title, description, keywords } = toolSeo(tool);
    const url = `${SITE_URL}/tools/${tool.slug}`;
    return {
        title,
        description,
        keywords,
        alternates: { canonical: `/tools/${tool.slug}` },
        openGraph: { title: `${title} | ${SITE_NAME}`, description, url, siteName: SITE_NAME, type: "website" },
        twitter: { card: "summary", title, description },
        robots: { index: true, follow: true },
    };
}

export function toolJsonLd(tool: ToolLike) {
    const { description } = toolSeo(tool);
    const url = `${SITE_URL}/tools/${tool.slug}`;
    return [
        {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: tool.name,
            url,
            description,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any (runs in a web browser)",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/categories` },
                { "@type": "ListItem", position: 3, name: tool.name, item: url },
            ],
        },
    ];
}