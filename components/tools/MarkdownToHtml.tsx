"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    Code2,
    Copy,
    Check,
    Trash2,
    Download,
    Upload,
    FileText,
    Eye,
    HelpCircle,
    Zap,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Layers,
    Lightbulb,
    Users,
} from "lucide-react";

/* ====================================================================== */
/* MARKDOWN PARSER (no dependencies)                                      */
/* ====================================================================== */
// PARSER START

type Ctx = { newTab: boolean; ids: boolean; slugs: Map<string, number> };

const escapeHtml = (s: string) =>
    s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const isSafeUrl = (url: string) =>
    /^(https?:\/\/|mailto:|#|\/|\.{1,2}\/)/i.test(url) ||
    /^[^:\/?#]*([\/?#]|$)/.test(url);

const emphasis = (s: string) =>
    s
        .replace(/\*\*\*(\S(?:[\s\S]*?\S)??)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(\S(?:[\s\S]*?\S)??)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(\S(?:[\s\S]*?\S)??)\*/g, "<em>$1</em>")
        .replace(/(^|\W)___(\S(?:[\s\S]*?\S)??)___(?!\w)/g, "$1<strong><em>$2</em></strong>")
        .replace(/(^|\W)__(\S(?:[\s\S]*?\S)??)__(?!\w)/g, "$1<strong>$2</strong>")
        .replace(/(^|\W)_(\S(?:[\s\S]*?\S)??)_(?!\w)/g, "$1<em>$2</em>")
        .replace(/~~(\S(?:[\s\S]*?\S)??)~~/g, "<del>$1</del>");

const inline = (text: string, ctx: Ctx): string => {
    const codes: string[] = [];
    const escapes: string[] = [];
    const tokens: string[] = [];

    const keep = (html: string) => {
        tokens.push(html);
        return `\u0002${tokens.length - 1}\u0002`;
    };

    const unesc = (x: string) =>
        x.replace(/\u0001(\d+)\u0001/g, (_m, n: string) => escapes[Number(n)]);

    const attr = (x: string) => unesc(x).replace(/\u0000\d+\u0000/g, "");

    const linkExtra = ctx.newTab ? ' target="_blank" rel="noopener noreferrer"' : "";

    // 1. inline code
    let s = text.replace(/`([^`]+)`/g, (_m, c: string) => {
        codes.push(`<code>${escapeHtml(c.trim())}</code>`);
        return `\u0000${codes.length - 1}\u0000`;
    });

    // 2. backslash escapes
    s = s.replace(/\\([\\`*_{}\[\]()#+\-.!|~<>&"'])/g, (_m, ch: string) => {
        escapes.push(escapeHtml(ch));
        return `\u0001${escapes.length - 1}\u0001`;
    });

    // 3. escape raw HTML
    s = escapeHtml(s);

    // 4. hard line breaks (two trailing spaces)
    s = s.replace(/ {2,}\n/g, () => keep("<br />") + "\n");

    // 5. images
    s = s.replace(
        /!\[([^\]]*)\]\(\s*((?:[^()\s]|\([^()\s]*\))+)(?:\s+&quot;(.*?)&quot;)?\s*\)/g,
        (_m, alt: string, url: string, title?: string) => {
            const u = attr(url);
            if (!isSafeUrl(u)) return attr(alt);
            return keep(
                `<img src="${u}" alt="${attr(alt)}"${title ? ` title="${attr(title)}"` : ""} />`
            );
        }
    );

    // 6. links
    s = s.replace(
        /\[([^\]]+)\]\(\s*((?:[^()\s]|\([^()\s]*\))+)(?:\s+&quot;(.*?)&quot;)?\s*\)/g,
        (_m, label: string, url: string, title?: string) => {
            const u = attr(url);
            if (!isSafeUrl(u)) return label;
            return keep(
                `<a href="${u}"${title ? ` title="${attr(title)}"` : ""}${linkExtra}>${emphasis(label)}</a>`
            );
        }
    );

    // 7. autolinks <https://...> and <mail@x.com>
    s = s.replace(/&lt;(https?:\/\/[^\s]+?)&gt;/g, (_m, url: string) =>
        keep(`<a href="${url}"${linkExtra}>${url}</a>`)
    );
    s = s.replace(
        /&lt;([^\s@&]+@[^\s@&]+\.[^\s@&]+)&gt;/g,
        (_m, mail: string) => keep(`<a href="mailto:${mail}">${mail}</a>`)
    );

    // 8. bare URLs
    s = s.replace(
        /(^|[\s(])(https?:\/\/[^\s<]+?)(?=[.,;:!?)]*(?:\s|$))/g,
        (_m, pre: string, url: string) =>
            `${pre}${keep(`<a href="${url}"${linkExtra}>${url}</a>`)}`
    );

    // 9. emphasis
    s = emphasis(s);

    // 10. restore placeholders
    for (let pass = 0; pass < 5 && /\u0002\d+\u0002/.test(s); pass++) {
        s = s.replace(/\u0002(\d+)\u0002/g, (_m, n: string) => tokens[Number(n)]);
    }
    s = s.replace(/\u0001(\d+)\u0001/g, (_m, n: string) => escapes[Number(n)]);
    s = s.replace(/\u0000(\d+)\u0000/g, (_m, n: string) => codes[Number(n)]);

    return s;
};

const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*([^\s`]*)/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.+?))?(?:[ \t]+#+)?[ \t]*$/;
const HR = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const BQ = /^ {0,3}>/;
const LISTITEM = /^( *)([-*+]|\d{1,9}[.)])[ \t]+(.*)$/;
const DELIM = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;

const isBlank = (l: string) => /^\s*$/.test(l);
const isBlockStart = (l: string) =>
    FENCE.test(l) || HEADING.test(l) || HR.test(l) || BQ.test(l);

const splitCells = (row: string) => {
    let r = row.trim();
    if (r.startsWith("|")) r = r.slice(1);
    if (r.endsWith("|") && !r.endsWith("\\|")) r = r.slice(0, -1);
    const cells: string[] = [];
    let cur = "";
    for (let k = 0; k < r.length; k++) {
        const ch = r[k];
        if (ch === "\\" && r[k + 1] === "|") {
            cur += "|";
            k++;
        } else if (ch === "|") {
            cells.push(cur.trim());
            cur = "";
        } else {
            cur += ch;
        }
    }
    cells.push(cur.trim());
    return cells;
};

const makeHeading = (level: number, text: string, ctx: Ctx) => {
    const inner = inline(text, ctx);
    let idAttr = "";
    if (ctx.ids) {
        let slug =
            text
                .replace(/[`*_~\[\]()!]/g, "")
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-") || "section";
        const seen = ctx.slugs.get(slug) ?? 0;
        ctx.slugs.set(slug, seen + 1);
        if (seen > 0) slug = `${slug}-${seen}`;
        idAttr = ` id="${slug}"`;
    }
    return `<h${level}${idAttr}>${inner}</h${level}>`;
};

const renderList = (block: string[], ctx: Ctx): string => {
    const first = block[0].match(LISTITEM)!;
    const base = first[1].length;
    const ordered = /\d/.test(first[2]);
    const start = ordered ? parseInt(first[2], 10) : 1;
    const strip = base + first[2].length + 1;

    let loose = false;
    const items: string[][] = [];
    let cur: string[] | null = null;

    for (let k = 0; k < block.length; k++) {
        const l = block[k];
        const im = l.match(LISTITEM);
        if (im && im[1].length < base + 2) {
            if (cur) items.push(cur);
            cur = [im[3]];
            if (k > 0 && isBlank(block[k - 1])) loose = true;
        } else if (cur) {
            cur.push(l.replace(new RegExp(`^ {0,${strip}}`), ""));
        }
    }
    if (cur) items.push(cur);

    // internal blank lines between content make the list loose
    items.forEach((lines) => {
        while (lines.length && isBlank(lines[lines.length - 1])) lines.pop();
        for (let k = 1; k < lines.length - 1; k++) {
            if (isBlank(lines[k]) && !isBlank(lines[k + 1])) {
                if (!LISTITEM.test(lines[k + 1])) loose = true;
            }
        }
    });

    const html = items.map((lines) => {
        let prefix = "";
        const task = lines[0].match(/^\[([ xX])\][ \t]+(.*)$/);
        if (task) {
            prefix = `<input type="checkbox" disabled${task[1] !== " " ? " checked" : ""} /> `;
            lines = [task[2], ...lines.slice(1)];
        }
        const blocks = parseBlocks(lines, ctx, !loose);
        return loose
            ? `<li>\n${prefix}${blocks.join("\n")}\n</li>`
            : `<li>${prefix}${blocks.join("\n")}</li>`;
    });

    const tag = ordered ? "ol" : "ul";
    const startAttr = ordered && start !== 1 ? ` start="${start}"` : "";
    return `<${tag}${startAttr}>\n${html.join("\n")}\n</${tag}>`;
};

const parseBlocks = (lines: string[], ctx: Ctx, tight = false): string[] => {
    const out: string[] = [];
    const n = lines.length;
    let i = 0;

    while (i < n) {
        const line = lines[i];

        if (isBlank(line)) {
            i++;
            continue;
        }

        // fenced code block
        let m = line.match(FENCE);
        if (m) {
            const fence = m[1];
            const lang = m[2].replace(/[^\w+#.-]/g, "");
            const closer = new RegExp(`^ {0,3}${fence[0]}{${fence.length},}[ \\t]*$`);
            const body: string[] = [];
            i++;
            while (i < n && !closer.test(lines[i])) {
                body.push(lines[i]);
                i++;
            }
            i++;
            out.push(
                `<pre><code${lang ? ` class="language-${lang}"` : ""}>${escapeHtml(body.join("\n"))}</code></pre>`
            );
            continue;
        }

        // ATX heading
        m = line.match(HEADING);
        if (m) {
            out.push(makeHeading(m[1].length, (m[2] ?? "").trim(), ctx));
            i++;
            continue;
        }

        // horizontal rule
        if (HR.test(line)) {
            out.push("<hr />");
            i++;
            continue;
        }

        // blockquote
        if (BQ.test(line)) {
            const inner: string[] = [];
            while (i < n && BQ.test(lines[i])) {
                inner.push(lines[i].replace(/^ {0,3}> ?/, ""));
                i++;
            }
            out.push(`<blockquote>\n${parseBlocks(inner, ctx).join("\n")}\n</blockquote>`);
            continue;
        }

        // table
        if (
            line.includes("|") &&
            i + 1 < n &&
            lines[i + 1].includes("|") &&
            DELIM.test(lines[i + 1])
        ) {
            const header = splitCells(line);
            const delim = splitCells(lines[i + 1]);
            if (header.length === delim.length) {
                const aligns = delim.map((d) =>
                    /^:-+:$/.test(d) ? "center" : /^:-+$/.test(d) ? "left" : /^-+:$/.test(d) ? "right" : ""
                );
                const styleFor = (idx: number) =>
                    aligns[idx] ? ` style="text-align:${aligns[idx]}"` : "";
                i += 2;
                const rows: string[][] = [];
                while (i < n && !isBlank(lines[i]) && lines[i].includes("|")) {
                    const cells = splitCells(lines[i]);
                    while (cells.length < header.length) cells.push("");
                    rows.push(cells.slice(0, header.length));
                    i++;
                }
                const head = header
                    .map((c, idx) => `<th${styleFor(idx)}>${inline(c, ctx)}</th>`)
                    .join("\n");
                const body = rows
                    .map(
                        (r) =>
                            `<tr>\n${r
                                .map((c, idx) => `<td${styleFor(idx)}>${inline(c, ctx)}</td>`)
                                .join("\n")}\n</tr>`
                    )
                    .join("\n");
                out.push(
                    `<table>\n<thead>\n<tr>\n${head}\n</tr>\n</thead>${rows.length ? `\n<tbody>\n${body}\n</tbody>` : ""
                    }\n</table>`
                );
                continue;
            }
        }

        // list
        if (LISTITEM.test(line)) {
            const block: string[] = [line];
            const kindOf = (l: string) => {
                const lm = l.match(LISTITEM);
                return lm && lm[1].length < 2 ? (/\d/.test(lm[2]) ? "o" : "u") : null;
            };
            const firstKind = kindOf(line);
            const switches = (l: string) => {
                const k = kindOf(l);
                return !!(firstKind && k && k !== firstKind);
            };
            i++;
            while (i < n) {
                const l = lines[i];
                if (switches(l)) break;
                if (isBlank(l)) {
                    let j = i;
                    while (j < n && isBlank(lines[j])) j++;
                    if (j < n && !switches(lines[j]) && (LISTITEM.test(lines[j]) || /^( {2,}|\t)/.test(lines[j]))) {
                        block.push(...lines.slice(i, j));
                        i = j;
                        continue;
                    }
                    break;
                }
                if (LISTITEM.test(l) || /^( {2,}|\t)/.test(l)) {
                    block.push(l);
                    i++;
                    continue;
                }
                if (!isBlockStart(l)) {
                    block.push(l);
                    i++;
                    continue;
                }
                break;
            }
            out.push(renderList(block, ctx));
            continue;
        }

        // paragraph (or setext heading)
        const para: string[] = [line];
        let setext = 0;
        i++;
        while (i < n && !isBlank(lines[i])) {
            const l = lines[i];
            if (/^ {0,3}=+[ \t]*$/.test(l)) {
                setext = 1;
                i++;
                break;
            }
            if (/^ {0,3}-+[ \t]*$/.test(l)) {
                setext = 2;
                i++;
                break;
            }
            if (isBlockStart(l) || /^ {0,3}([-*+]|1[.)])[ \t]+\S/.test(l)) break;
            para.push(l);
            i++;
        }

        if (setext) {
            out.push(makeHeading(setext, para.map((p) => p.trim()).join(" "), ctx));
        } else {
            const text = para
                .map((p, idx) =>
                    idx === para.length - 1 ? p.trim() : p.replace(/^\s+/, "")
                )
                .join("\n");
            out.push(tight ? inline(text, ctx) : `<p>${inline(text, ctx)}</p>`);
        }
    }

    return out;
};

const markdownToHtml = (
    md: string,
    options: { newTab: boolean; ids: boolean }
): string => {
    const lines = md
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((l) => l.replace(/^\t+/, (t) => "    ".repeat(t.length)));
    const ctx: Ctx = { ...options, slugs: new Map() };
    return parseBlocks(lines, ctx).join("\n");
};

// PARSER END

/* ====================================================================== */
/* COMPONENT                                                              */
/* ====================================================================== */

const MAX_CHARS = 1_000_000;

const SAMPLE_MD = [
    "# Welcome to ProTools Hub",
    "",
    "Convert **Markdown** to clean, *semantic* HTML instantly. Everything runs in your browser.",
    "",
    "## Features",
    "",
    "- Headings, **bold**, *italic* and ~~strikethrough~~",
    "- [Links](https://myprotoolshub.com) and `inline code`",
    "  - Nested lists work too",
    "- [x] Task lists",
    "- [ ] Tables and code blocks",
    "",
    "1. Write your Markdown",
    "2. Check the preview",
    "3. Copy the HTML",
    "",
    "> Markdown is a plain-text format for writing structured documents.",
    "",
    "### Code example",
    "",
    "```js",
    "const greet = (name) => `Hello, ${name}!`;",
    "console.log(greet(\"world\"));",
    "```",
    "",
    "### Table",
    "",
    "| Tool | Category | Free |",
    "| :--- | :---: | ---: |",
    "| Markdown to HTML | Developer | Yes |",
    "| JSON Formatter | Developer | Yes |",
    "",
    "---",
    "",
    "Made with <3 by ProTools Hub.",
].join("\n");

const SYNTAX_ROWS = [
    { name: "Heading", md: "## Title", html: "<h2>Title</h2>" },
    { name: "Bold", md: "**bold**", html: "<strong>bold</strong>" },
    { name: "Italic", md: "*italic*", html: "<em>italic</em>" },
    { name: "Strikethrough", md: "~~text~~", html: "<del>text</del>" },
    { name: "Link", md: "[Home](https://example.com)", html: '<a href="https://example.com">Home</a>' },
    { name: "Image", md: "![Logo](logo.png)", html: '<img src="logo.png" alt="Logo" />' },
    { name: "Inline code", md: "`npm install`", html: "<code>npm install</code>" },
    { name: "Code block", md: "```js\\nlet a = 1;\\n```", html: '<pre><code class="language-js">…</code></pre>' },
    { name: "Blockquote", md: "> quote", html: "<blockquote>…</blockquote>" },
    { name: "Bullet list", md: "- item", html: "<ul><li>item</li></ul>" },
    { name: "Numbered list", md: "1. item", html: "<ol><li>item</li></ol>" },
    { name: "Task list", md: "- [x] done", html: '<li><input type="checkbox" disabled checked /> done</li>' },
    { name: "Table", md: "| A | B |\\n| --- | --- |", html: "<table>…</table>" },
    { name: "Horizontal rule", md: "---", html: "<hr />" },
];

const FAQS = [
    {
        q: "What is Markdown?",
        a: "Markdown is a lightweight way to write formatted text using plain characters. For example, putting two asterisks around a word makes it bold, and a line starting with a hash symbol becomes a heading. It was created by John Gruber, with help from Aaron Swartz, in 2004 and is now used in documentation, README files, forums, blogs and note-taking apps.",
    },
    {
        q: "Which Markdown features does this converter support?",
        a: "It supports headings (including underline style), paragraphs, bold, italic, strikethrough, inline code, fenced code blocks, blockquotes, nested bullet and numbered lists, task lists, tables with column alignment, links, images, automatic links, horizontal rules and line breaks. It follows the common CommonMark and GitHub Flavored Markdown rules for these.",
    },
    {
        q: "What is not supported?",
        a: "Extensions that go beyond basic and GitHub-style Markdown are not supported, such as footnotes, math formulas, definition lists, indented code blocks and embedded raw HTML. Raw HTML is escaped on purpose so it shows as text instead of running. Very unusual edge cases may also render slightly differently from other converters.",
    },
    {
        q: "Is the generated HTML safe?",
        a: "The converter escapes any raw HTML you type and only allows safe link and image addresses (http, https, mailto, relative paths and anchors), so script injection through Markdown is blocked. The preview also runs in a sandboxed frame. If you publish converted content, it is still good practice to keep your own site's security headers and sanitization in place.",
    },
    {
        q: "What do the options do?",
        a: "'Open links in new tab' adds target and rel attributes to every link. 'Add heading IDs' gives each heading a URL-friendly id so you can link to sections. 'Full HTML document' wraps the output in a complete page with doctype, head and body, ready to save as an .html file.",
    },
    {
        q: "How do I make a line break inside a paragraph?",
        a: "End the line with two spaces before pressing Enter, and the converter inserts a br tag. A blank line starts a new paragraph instead.",
    },
    {
        q: "Can I convert a Markdown file?",
        a: "Yes. Click Upload .md to load a Markdown file of up to 1 MB, check the preview, then copy or download the HTML.",
    },
    {
        q: "Is my text uploaded to a server?",
        a: "No. Conversion runs in your browser with JavaScript, and the text you type is not sent to our servers. Please note that the website itself uses analytics and advertising scripts, as explained in our privacy policy.",
    },
];

const PREVIEW_CSS = `
body{margin:0;padding:20px;font:15px/1.7 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#cbd5e1;background:#020617;word-wrap:break-word}
h1,h2,h3,h4,h5,h6{color:#fff;line-height:1.3;margin:1.4em 0 .5em}
h1{font-size:2em;border-bottom:1px solid #1e293b;padding-bottom:.3em}
h2{font-size:1.5em;border-bottom:1px solid #1e293b;padding-bottom:.25em}
h1:first-child,h2:first-child,h3:first-child{margin-top:0}
a{color:#60a5fa}
code{background:#1e293b;color:#e2e8f0;padding:2px 6px;border-radius:6px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.9em}
pre{background:#0b1220;border:1px solid #1e293b;border-radius:10px;padding:14px;overflow:auto}
pre code{background:none;padding:0}
blockquote{margin:1em 0;padding:2px 16px;border-left:4px solid #3b82f6;color:#94a3b8}
table{border-collapse:collapse;width:100%;margin:1em 0}
th,td{border:1px solid #334155;padding:8px 12px}
th{background:#0f172a;color:#fff}
img{max-width:100%}
hr{border:0;border-top:1px solid #334155;margin:1.6em 0}
ul,ol{padding-left:26px}
li{margin:.25em 0}
del{opacity:.7}
`;

export default function MarkdownToHtml() {
    const [markdown, setMarkdown] = useState(SAMPLE_MD);
    const [view, setView] = useState<"preview" | "html">("preview");
    const [newTab, setNewTab] = useState(true);
    const [headingIds, setHeadingIds] = useState(false);
    const [fullDoc, setFullDoc] = useState(false);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const tooLong = markdown.length > MAX_CHARS;

    const bodyHtml = useMemo(
        () =>
            tooLong
                ? ""
                : markdownToHtml(markdown, { newTab, ids: headingIds }),
        [markdown, newTab, headingIds, tooLong]
    );

    const htmlOutput = useMemo(() => {
        if (!fullDoc || !bodyHtml) return bodyHtml;
        const titleMatch = bodyHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        const title = titleMatch
            ? titleMatch[1].replace(/<[^>]+>/g, "").trim() || "Document"
            : "Document";
        const indented = bodyHtml
            .split("\n")
            .map((l) => `    ${l}`)
            .join("\n");
        return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${title}</title>\n</head>\n<body>\n${indented}\n</body>\n</html>`;
    }, [bodyHtml, fullDoc]);

    const previewDoc = useMemo(
        () =>
            `<!DOCTYPE html><html><head><meta charset="UTF-8" /><base target="_blank" /><style>${PREVIEW_CSS}</style></head><body>${bodyHtml}</body></html>`,
        [bodyHtml]
    );

    const stats = useMemo(() => {
        const text = markdown.trim();
        return {
            words: text ? text.split(/\s+/).length : 0,
            chars: markdown.length,
            headings: (bodyHtml.match(/<h[1-6][ >]/g) || []).length,
            links: (bodyHtml.match(/<a /g) || []).length,
            images: (bodyHtml.match(/<img /g) || []).length,
            codeBlocks: (bodyHtml.match(/<pre>/g) || []).length,
            tables: (bodyHtml.match(/<table>/g) || []).length,
        };
    }, [markdown, bodyHtml]);

    const handleCopy = async () => {
        if (!htmlOutput) return;
        try {
            await navigator.clipboard.writeText(htmlOutput);
            setCopied(true);
            setMessage("");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setMessage("Copy failed. Switch to the HTML tab, select the code and copy it manually (Ctrl + C).");
        }
    };

    const handleDownload = () => {
        if (!htmlOutput) return;
        const blob = new Blob([htmlOutput], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "converted.html";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (file.size > MAX_CHARS) {
            setMessage("File is larger than 1 MB. Please choose a smaller file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setMarkdown(reader.result);
                setMessage("");
            }
        };
        reader.onerror = () => setMessage("Unable to read this file.");
        reader.readAsText(file);
    };

    const toggleClass = (active: boolean) =>
        `rounded-lg px-3 py-1.5 text-sm font-semibold transition cursor-pointer ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
        }`;

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 p-4 md:p-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* ================= TOOL CARD ================= */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Code2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                Markdown to HTML Converter
                            </h1>
                            <p className="text-sm text-slate-400">
                                Write Markdown, see a live preview, and copy clean HTML.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Runs in your browser</span>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="space-y-4 mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setMarkdown(SAMPLE_MD);
                                setMessage("");
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                        >
                            <FileText className="h-4 w-4" />
                            Load Sample
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                        >
                            <Upload className="h-4 w-4" />
                            Upload .md
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".md,.markdown,.txt,text/markdown,text/plain"
                            onChange={handleUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setMarkdown("");
                                setMessage("");
                            }}
                            aria-label="Clear Markdown input"
                            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300">
                            <input
                                type="checkbox"
                                checked={newTab}
                                onChange={(e) => setNewTab(e.target.checked)}
                                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                            />
                            Open links in new tab
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300">
                            <input
                                type="checkbox"
                                checked={headingIds}
                                onChange={(e) => setHeadingIds(e.target.checked)}
                                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                            />
                            Add heading IDs
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300">
                            <input
                                type="checkbox"
                                checked={fullDoc}
                                onChange={(e) => setFullDoc(e.target.checked)}
                                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                            />
                            Full HTML document
                        </label>
                    </div>
                </div>

                <div aria-live="polite">
                    {(message || tooLong) && (
                        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-950/60 border border-rose-900/50 p-4 text-sm font-medium text-rose-300">
                            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                            <span>
                                {tooLong
                                    ? "Input is larger than 1 MB. Please shorten it."
                                    : message}
                            </span>
                        </div>
                    )}
                </div>

                {/* Editor + output */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="markdown-input"
                                className="block text-xs font-bold uppercase tracking-wider text-slate-400"
                            >
                                Markdown input
                            </label>
                            <span className="text-xs text-slate-500">
                                {stats.words.toLocaleString()} words •{" "}
                                {stats.chars.toLocaleString()} chars
                            </span>
                        </div>
                        <textarea
                            id="markdown-input"
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            spellCheck={false}
                            placeholder="Type or paste Markdown here..."
                            className="h-[480px] w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div
                                className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1"
                                role="tablist"
                                aria-label="Output view"
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={view === "preview"}
                                    onClick={() => setView("preview")}
                                    className={toggleClass(view === "preview")}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="h-3.5 w-3.5" />
                                        Preview
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={view === "html"}
                                    onClick={() => setView("html")}
                                    className={toggleClass(view === "html")}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Code2 className="h-3.5 w-3.5" />
                                        HTML code
                                    </span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={!htmlOutput}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    disabled={!htmlOutput}
                                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition disabled:opacity-40 cursor-pointer"
                                >
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                    {copied ? "Copied!" : "Copy HTML"}
                                </button>
                            </div>
                        </div>

                        {view === "preview" ? (
                            <iframe
                                title="Rendered Markdown preview"
                                sandbox="allow-popups allow-popups-to-escape-sandbox"
                                srcDoc={previewDoc}
                                className="h-[480px] w-full rounded-2xl border border-slate-800 bg-slate-950"
                            />
                        ) : (
                            <textarea
                                readOnly
                                value={htmlOutput}
                                spellCheck={false}
                                aria-label="Generated HTML code"
                                placeholder="HTML will appear here..."
                                className="h-[480px] w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-cyan-300 placeholder-slate-600 focus:outline-none transition resize-y"
                            />
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                        ["Headings", stats.headings],
                        ["Links", stats.links],
                        ["Images", stats.images],
                        ["Code blocks", stats.codeBlocks],
                        ["Tables", stats.tables],
                        ["HTML size", `${(new TextEncoder().encode(htmlOutput).length / 1024).toFixed(1)} KB`],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center"
                        >
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {label}
                            </span>
                            <p className="font-bold text-white text-sm mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= CONTENT SECTIONS ================= */}

            {/* About */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                        About the Markdown to HTML Converter
                    </h2>
                </div>
                <p className="text-slate-300 text-base leading-relaxed">
                    The ProTools Hub Markdown to HTML Converter turns Markdown text into clean,
                    ready-to-use HTML. Type or paste your Markdown on the left, watch a live
                    preview update on the right, then switch to the HTML tab to copy the code or
                    download it as a file. It works with README files, blog drafts, documentation
                    and notes.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    The converter is built on a real parser, not a handful of find-and-replace
                    rules. It understands paragraphs, nested lists, task lists, tables with
                    alignment, fenced code blocks with language classes, blockquotes and links, and
                    it handles several formatting marks on the same line correctly. You can also
                    add heading IDs for section links, make links open in a new tab, or wrap the
                    result in a complete HTML page.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    Everything runs in your browser. Raw HTML in your text is escaped and unsafe
                    link types are removed, and the preview is displayed in a sandboxed frame, so
                    pasting unfamiliar Markdown will not run scripts.
                </p>
            </section>

            {/* How to use + features */}
            <div className="grid gap-8 md:grid-cols-2">
                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-extrabold text-white">How to Use</h2>
                    </div>
                    <ol className="space-y-4">
                        {[
                            "Type or paste Markdown into the input box, upload a .md file, or click Load Sample.",
                            "Check the Preview tab to see how your content will look.",
                            "Choose options: open links in a new tab, add heading IDs, or output a full HTML document.",
                            "Switch to the HTML code tab to read the generated markup.",
                            "Click Copy HTML to use it right away, or Download to save a .html file.",
                        ].map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400 border border-blue-500/30">
                                    {idx + 1}
                                </span>
                                <span className="text-sm font-medium text-slate-300 mt-0.5">
                                    {step}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-extrabold text-white">Key Features</h2>
                    </div>
                    <ul className="space-y-3.5">
                        {[
                            "Live preview in a sandboxed frame",
                            "Nested lists, task lists, tables and code blocks",
                            "Safe output: raw HTML escaped, unsafe links removed",
                            "Heading IDs, new-tab links and full-document options",
                            "Upload .md files and download the result",
                            "Counts for headings, links, images, tables and code",
                            "Free, no sign-up, converted in your browser",
                        ].map((feat, idx) => (
                            <li
                                key={idx}
                                className="flex items-center gap-3 text-sm font-medium text-slate-300"
                            >
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* What is Markdown + reference table */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-5">
                <h2 className="text-xl font-extrabold text-white">
                    What Is Markdown, and Why Convert It to HTML?
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                    Markdown is a simple writing format created by John Gruber in 2004, with
                    help from Aaron Swartz. Instead of clicking toolbar buttons, you add small
                    symbols to plain text: a hash for a heading, asterisks for emphasis, a dash
                    for a bullet. The file stays readable as plain text, which is why it became
                    the standard for README files, developer documentation, static-site blogs and
                    many note-taking apps.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    Browsers cannot display Markdown directly, they display HTML. Converting
                    Markdown to HTML lets you write quickly in a simple format and still publish
                    to web pages, email templates, content management systems and apps that expect
                    HTML. The table below shows how the most common Markdown elements become
                    HTML.
                </p>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-300">
                            <tr>
                                <th className="px-4 py-3 font-bold">Element</th>
                                <th className="px-4 py-3 font-bold">Markdown</th>
                                <th className="px-4 py-3 font-bold">HTML</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-400">
                            {SYNTAX_ROWS.map((row) => (
                                <tr key={row.name}>
                                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                                        {row.name}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-cyan-300 whitespace-nowrap">
                                        {row.md}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-emerald-400 whitespace-nowrap">
                                        {row.html}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Use cases */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Users className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                        Who Uses a Markdown Converter?
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {[
                        {
                            t: "Bloggers and writers",
                            d: "Draft in Markdown for speed, then convert to HTML to paste into a CMS, newsletter or email template.",
                        },
                        {
                            t: "Developers",
                            d: "Turn README files and documentation into HTML pages, or generate HTML snippets for components and templates.",
                        },
                        {
                            t: "Technical writers",
                            d: "Produce clean, consistent documentation and export HTML for help centres and knowledge bases.",
                        },
                        {
                            t: "Students and teachers",
                            d: "Format notes, assignments and course material in Markdown and publish them as simple web pages.",
                        },
                        {
                            t: "Marketers",
                            d: "Prepare landing page copy and product descriptions in a simple format, then export HTML for the website.",
                        },
                        {
                            t: "Open-source maintainers",
                            d: "Preview how release notes and contribution guides will look before publishing them.",
                        },
                    ].map((item) => (
                        <div
                            key={item.t}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                        >
                            <h3 className="font-bold text-white text-base">{item.t}</h3>
                            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                                {item.d}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                        Tips for Writing Clean Markdown
                    </h2>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
                    <li>
                        <strong className="text-white">Leave a blank line between blocks.</strong>{" "}
                        Paragraphs, lists, headings and code blocks should be separated by an
                        empty line so they are parsed predictably.
                    </li>
                    <li>
                        <strong className="text-white">Use one H1 per page.</strong> Start with a
                        single level-one heading, then use H2 and H3 for sections. This helps both
                        readers and search engines.
                    </li>
                    <li>
                        <strong className="text-white">Name your code languages.</strong> Writing
                        the language after the opening fence adds a class such as language-js,
                        which syntax highlighters can use.
                    </li>
                    <li>
                        <strong className="text-white">Write meaningful alt text.</strong> Put a
                        short description inside the square brackets of an image so it is
                        accessible to screen reader users.
                    </li>
                    <li>
                        <strong className="text-white">Escape special characters.</strong> Put a
                        backslash before a symbol like an asterisk or underscore if you want it to
                        appear literally instead of being treated as formatting.
                    </li>
                    <li>
                        <strong className="text-white">Add your own styling.</strong> The output is
                        plain, semantic HTML with no CSS. Style it with your site&apos;s stylesheet
                        so it matches your design.
                    </li>
                </ul>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Related tools:{" "}
                    <Link
                        href="/tools/word-counter"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Word Counter
                    </Link>
                    ,{" "}
                    <Link
                        href="/tools/json-formatter"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        JSON Formatter
                    </Link>
                    ,{" "}
                    <Link
                        href="/tools/lorem-ipsum-generator"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Lorem Ipsum Generator
                    </Link>
                    .
                </p>
            </section>

            {/* FAQ */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 text-white font-extrabold text-xl">
                    <Layers className="h-6 w-6 text-indigo-400" />
                    <h2>Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                    {FAQS.map((item) => (
                        <div
                            key={item.q}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                        >
                            <h3 className="font-bold text-white text-base">{item.q}</h3>
                            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                                {item.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}