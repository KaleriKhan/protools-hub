"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Code2,
    Copy,
    Check,
    Trash2,
    FileJson,
    ShieldCheck,
    HelpCircle,
    Zap,
    CheckCircle2,
    AlertCircle,
    Download,
    Plus,
    X,
    Layers,
    Lightbulb,
    ExternalLink,
} from "lucide-react";

type SchemaType =
    | "Article"
    | "BlogPosting"
    | "Organization"
    | "WebSite"
    | "SoftwareApplication"
    | "FAQPage"
    | "BreadcrumbList"
    | "LocalBusiness"
    | "Product";

type FieldKind = "text" | "textarea" | "url" | "date" | "number" | "select";

type FieldDef = {
    key: string;
    label: string;
    placeholder?: string;
    kind?: FieldKind;
    required?: boolean;
    options?: string[];
    help?: string;
};

type FaqItem = { q: string; a: string };
type CrumbItem = { name: string; url: string };

const TYPE_OPTIONS: { value: SchemaType; label: string }[] = [
    { value: "Article", label: "Article" },
    { value: "BlogPosting", label: "Blog Posting" },
    { value: "Organization", label: "Organization" },
    { value: "WebSite", label: "WebSite" },
    { value: "SoftwareApplication", label: "Software Application" },
    { value: "FAQPage", label: "FAQ Page" },
    { value: "BreadcrumbList", label: "Breadcrumb List" },
    { value: "LocalBusiness", label: "Local Business" },
    { value: "Product", label: "Product" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "INR", "AED", "CAD", "AUD"];

const ARTICLE_FIELDS: FieldDef[] = [
    { key: "headline", label: "Headline", placeholder: "How to Resize Images Without Losing Quality", required: true },
    { key: "description", label: "Description", kind: "textarea", placeholder: "A short summary of the article." },
    { key: "url", label: "Page URL", kind: "url", placeholder: "https://myprotoolshub.com/blog/your-post", required: true },
    { key: "image", label: "Image URL", kind: "url", placeholder: "https://myprotoolshub.com/images/cover.jpg", help: "Google recommends at least one large image." },
    { key: "authorName", label: "Author name", placeholder: "Jane Doe", required: true },
    { key: "authorUrl", label: "Author page URL", kind: "url", placeholder: "https://myprotoolshub.com/about" },
    { key: "publisherName", label: "Publisher name", placeholder: "ProTools Hub" },
    { key: "publisherLogo", label: "Publisher logo URL", kind: "url", placeholder: "https://myprotoolshub.com/logo.png" },
    { key: "datePublished", label: "Date published", kind: "date", required: true },
    { key: "dateModified", label: "Date modified", kind: "date" },
];

const FIELDS: Record<SchemaType, FieldDef[]> = {
    Article: ARTICLE_FIELDS,
    BlogPosting: ARTICLE_FIELDS,
    Organization: [
        { key: "name", label: "Organization name", placeholder: "ProTools Hub", required: true },
        { key: "url", label: "Website URL", kind: "url", placeholder: "https://myprotoolshub.com", required: true },
        { key: "logo", label: "Logo URL", kind: "url", placeholder: "https://myprotoolshub.com/logo.png" },
        { key: "description", label: "Description", kind: "textarea", placeholder: "What your organization does." },
        { key: "email", label: "Contact email", placeholder: "support@myprotoolshub.com" },
        { key: "phone", label: "Phone", placeholder: "+1-555-000-0000" },
        { key: "sameAs", label: "Social profile URLs", kind: "textarea", placeholder: "One URL per line (or separate with commas)", help: "Links to your official profiles, such as GitHub or LinkedIn." },
    ],
    WebSite: [
        { key: "name", label: "Site name", placeholder: "ProTools Hub", required: true },
        { key: "url", label: "Site URL", kind: "url", placeholder: "https://myprotoolshub.com", required: true },
        { key: "description", label: "Description", kind: "textarea", placeholder: "Free online tools that run in your browser." },
        { key: "inLanguage", label: "Language code", placeholder: "en" },
    ],
    SoftwareApplication: [
        { key: "name", label: "Application name", placeholder: "JSON Formatter", required: true },
        { key: "url", label: "Page URL", kind: "url", placeholder: "https://myprotoolshub.com/tools/json-formatter" },
        { key: "description", label: "Description", kind: "textarea", placeholder: "What the application does." },
        {
            key: "applicationCategory",
            label: "Category",
            kind: "select",
            options: [
                "DeveloperApplication",
                "UtilitiesApplication",
                "BusinessApplication",
                "DesignApplication",
                "EducationalApplication",
                "MultimediaApplication",
                "SecurityApplication",
                "BrowserApplication",
            ],
            required: true,
        },
        { key: "operatingSystem", label: "Operating system", placeholder: "Any (web browser)" },
        { key: "price", label: "Price", kind: "number", placeholder: "0", help: "Use 0 for free tools." },
        { key: "priceCurrency", label: "Currency", kind: "select", options: CURRENCIES },
        { key: "ratingValue", label: "Average rating", kind: "number", placeholder: "4.6", help: "Only add ratings that come from real user reviews." },
        { key: "ratingCount", label: "Number of ratings", kind: "number", placeholder: "120" },
    ],
    FAQPage: [],
    BreadcrumbList: [],
    LocalBusiness: [
        { key: "name", label: "Business name", placeholder: "Example Coffee Shop", required: true },
        { key: "url", label: "Website URL", kind: "url", placeholder: "https://example.com" },
        { key: "description", label: "Description", kind: "textarea", placeholder: "What the business offers." },
        { key: "image", label: "Image URL", kind: "url", placeholder: "https://example.com/photo.jpg" },
        { key: "phone", label: "Telephone", placeholder: "+92-300-0000000" },
        { key: "priceRange", label: "Price range", placeholder: "$$" },
        { key: "street", label: "Street address", placeholder: "12 Main Road" },
        { key: "city", label: "City", placeholder: "Quetta" },
        { key: "region", label: "State / region", placeholder: "Balochistan" },
        { key: "postalCode", label: "Postal code", placeholder: "87300" },
        { key: "country", label: "Country code", placeholder: "PK" },
    ],
    Product: [
        { key: "name", label: "Product name", placeholder: "Wireless Mouse", required: true },
        { key: "description", label: "Description", kind: "textarea", placeholder: "Product description." },
        { key: "url", label: "Product page URL", kind: "url", placeholder: "https://example.com/products/mouse" },
        { key: "image", label: "Image URL", kind: "url", placeholder: "https://example.com/mouse.jpg" },
        { key: "brand", label: "Brand", placeholder: "Acme" },
        { key: "sku", label: "SKU", placeholder: "MOUSE-001" },
        { key: "price", label: "Price", kind: "number", placeholder: "19.99", required: true },
        { key: "priceCurrency", label: "Currency", kind: "select", options: CURRENCIES, required: true },
        { key: "availability", label: "Availability", kind: "select", options: ["InStock", "OutOfStock", "PreOrder"] },
    ],
};

const SCHEMA_GUIDE = [
    {
        type: "Article / BlogPosting",
        use: "News, blog posts and guides",
        note: "Helps search engines understand the headline, author and dates.",
    },
    {
        type: "Organization",
        use: "Home or About page",
        note: "Describes your brand, logo and official profiles.",
    },
    {
        type: "WebSite",
        use: "Home page",
        note: "Names your site. Google has retired the sitelinks search box, so don't expect that feature.",
    },
    {
        type: "SoftwareApplication",
        use: "App or tool pages",
        note: "Rich results usually need a price plus a genuine rating or review.",
    },
    {
        type: "FAQPage",
        use: "Pages with real, visible Q&A",
        note: "Google now shows FAQ rich results mostly for well-known government and health sites, but the markup is still valid.",
    },
    {
        type: "BreadcrumbList",
        use: "Pages with a breadcrumb trail",
        note: "Can show your page path in search results instead of a raw URL.",
    },
    {
        type: "LocalBusiness",
        use: "Businesses with a physical location",
        note: "Provides address, phone number and price range.",
    },
    {
        type: "Product",
        use: "Product pages",
        note: "Rich results need offers or reviews that match what is shown on the page.",
    },
];

const COMMON_MISTAKES = [
    {
        title: "Marking up content that isn't on the page",
        fix: "Structured data must describe what visitors can actually see. Hidden or invented content can lead to a manual action.",
    },
    {
        title: "Fake ratings and reviews",
        fix: "Only include ratings that come from real users. Made-up ratings violate Google's guidelines.",
    },
    {
        title: "Relative or broken URLs",
        fix: "Use full URLs that start with https:// for pages, images and logos.",
    },
    {
        title: "Missing required properties",
        fix: "Each type has required and recommended fields. This tool lists what is missing before you copy the code.",
    },
    {
        title: "Wrong date format",
        fix: "Use ISO 8601 dates such as 2026-11-01. The date picker in this tool does this automatically.",
    },
    {
        title: "Never testing the result",
        fix: "Always check your final page in Google's Rich Results Test and the Schema Markup Validator.",
    },
];

const NEXT_SNIPPET = `export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "My article title",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* your page content */}
    </>
  );
}`;

const FAQS = [
    {
        q: "What is JSON-LD?",
        a: "JSON-LD (JavaScript Object Notation for Linked Data) is a way to describe the content of a web page in a format that search engines can read easily. You place it in a script tag, and it uses the shared vocabulary from schema.org to say things like 'this page is an article, written by this person, published on this date'.",
    },
    {
        q: "Does structured data improve my Google ranking?",
        a: "Google states that structured data is not a direct ranking factor. What it does is help Google understand your page and makes it eligible for certain enhanced search results, which can improve how your listing looks and how often people click it.",
    },
    {
        q: "Why don't I see rich results after adding the markup?",
        a: "Valid markup does not guarantee rich results. Google decides whether to show them based on page quality, eligibility rules and the type of site, and it can take days or weeks after a page is crawled. Some types, like FAQ, are now limited to certain kinds of sites.",
    },
    {
        q: "Where do I put the generated code?",
        a: "Paste the script tag into the head or body of the page it describes. In a Next.js app, you can render it inside the page component with dangerouslySetInnerHTML, as shown in the example on this page. Each page should have markup that describes that page only.",
    },
    {
        q: "Can I use more than one schema type on a page?",
        a: "Yes. A blog post page might include an Article, a BreadcrumbList and an Organization. Generate each one separately and add them as separate script tags, or combine them in one array.",
    },
    {
        q: "How do I test my structured data?",
        a: "Use Google's Rich Results Test to check eligibility for Google features and the Schema Markup Validator at validator.schema.org to check general schema.org correctness. Test the live page URL or paste the code directly.",
    },
    {
        q: "Is JSON-LD better than Microdata or RDFa?",
        a: "Google recommends JSON-LD because it keeps the data separate from your HTML, which makes it easier to write and maintain. Microdata and RDFa still work, but they mix the markup into your page content.",
    },
    {
        q: "Is the information I type uploaded anywhere?",
        a: "No. The code is generated in your browser as you type and is not sent to our servers by this tool. Please note the website itself uses analytics and advertising scripts, as explained in our privacy policy.",
    },
];

const clean = (obj: Record<string, unknown>) =>
    Object.fromEntries(
        Object.entries(obj).filter(
            ([, value]) => value !== undefined && value !== ""
        )
    );

const splitList = (text: string) =>
    text
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);

const buildSchema = (
    type: SchemaType,
    v: Record<string, string>,
    faqs: FaqItem[],
    crumbs: CrumbItem[]
) => {
    const g = (key: string) => (v[key] ?? "").trim();
    const obj: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": type,
    };

    const set = (key: string, value: unknown) => {
        if (value === undefined || value === "") return;
        if (Array.isArray(value) && value.length === 0) return;
        obj[key] = value;
    };

    switch (type) {
        case "Article":
        case "BlogPosting":
            set("headline", g("headline"));
            set("description", g("description"));
            set("url", g("url"));
            set("image", g("image"));
            if (g("authorName")) {
                set(
                    "author",
                    clean({
                        "@type": "Person",
                        name: g("authorName"),
                        url: g("authorUrl"),
                    })
                );
            }
            if (g("publisherName")) {
                set(
                    "publisher",
                    clean({
                        "@type": "Organization",
                        name: g("publisherName"),
                        logo: g("publisherLogo")
                            ? { "@type": "ImageObject", url: g("publisherLogo") }
                            : undefined,
                    })
                );
            }
            set("datePublished", g("datePublished"));
            set("dateModified", g("dateModified"));
            break;

        case "Organization":
            set("name", g("name"));
            set("url", g("url"));
            set("logo", g("logo"));
            set("description", g("description"));
            set("email", g("email"));
            set("telephone", g("phone"));
            set("sameAs", splitList(g("sameAs")));
            break;

        case "WebSite":
            set("name", g("name"));
            set("url", g("url"));
            set("description", g("description"));
            set("inLanguage", g("inLanguage"));
            break;

        case "SoftwareApplication":
            set("name", g("name"));
            set("url", g("url"));
            set("description", g("description"));
            set("applicationCategory", g("applicationCategory"));
            set("operatingSystem", g("operatingSystem"));
            if (g("price") !== "") {
                set(
                    "offers",
                    clean({
                        "@type": "Offer",
                        price: g("price"),
                        priceCurrency: g("priceCurrency"),
                    })
                );
            }
            if (g("ratingValue") && g("ratingCount")) {
                set("aggregateRating", {
                    "@type": "AggregateRating",
                    ratingValue: g("ratingValue"),
                    ratingCount: g("ratingCount"),
                });
            }
            break;

        case "FAQPage":
            set(
                "mainEntity",
                faqs
                    .filter((item) => item.q.trim() && item.a.trim())
                    .map((item) => ({
                        "@type": "Question",
                        name: item.q.trim(),
                        acceptedAnswer: {
                            "@type": "Answer",
                            text: item.a.trim(),
                        },
                    }))
            );
            break;

        case "BreadcrumbList":
            set(
                "itemListElement",
                crumbs
                    .filter((item) => item.name.trim())
                    .map((item, index) =>
                        clean({
                            "@type": "ListItem",
                            position: index + 1,
                            name: item.name.trim(),
                            item: item.url.trim(),
                        })
                    )
            );
            break;

        case "LocalBusiness": {
            set("name", g("name"));
            set("url", g("url"));
            set("description", g("description"));
            set("image", g("image"));
            set("telephone", g("phone"));
            set("priceRange", g("priceRange"));
            const address = clean({
                "@type": "PostalAddress",
                streetAddress: g("street"),
                addressLocality: g("city"),
                addressRegion: g("region"),
                postalCode: g("postalCode"),
                addressCountry: g("country"),
            });
            if (Object.keys(address).length > 1) set("address", address);
            break;
        }

        case "Product":
            set("name", g("name"));
            set("description", g("description"));
            set("url", g("url"));
            set("image", g("image"));
            set("sku", g("sku"));
            if (g("brand")) {
                set("brand", { "@type": "Brand", name: g("brand") });
            }
            if (g("price") !== "") {
                set(
                    "offers",
                    clean({
                        "@type": "Offer",
                        price: g("price"),
                        priceCurrency: g("priceCurrency"),
                        availability: g("availability")
                            ? `https://schema.org/${g("availability")}`
                            : undefined,
                    })
                );
            }
            break;
    }

    return obj;
};

export default function JsonSchemaGeneratorClient() {
    const [schemaType, setSchemaType] = useState<SchemaType>("Article");
    const [values, setValues] = useState<Record<string, string>>({
        applicationCategory: "DeveloperApplication",
        priceCurrency: "USD",
        availability: "InStock",
    });
    const [faqs, setFaqs] = useState<FaqItem[]>([{ q: "", a: "" }]);
    const [crumbs, setCrumbs] = useState<CrumbItem[]>([
        { name: "", url: "" },
        { name: "", url: "" },
    ]);
    const [wrapScript, setWrapScript] = useState(true);
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");

    const fields = FIELDS[schemaType];

    const setValue = (key: string, value: string) =>
        setValues((prev) => ({ ...prev, [key]: value }));

    const schemaObject = buildSchema(schemaType, values, faqs, crumbs);
    const json = JSON.stringify(schemaObject, null, 2);
    const hasContent = Object.keys(schemaObject).length > 2;

    const output = wrapScript
        ? `<script type="application/ld+json">\n${json.replace(/</g, "\\u003c")}\n</script>`
        : json;

    // ---------- Validation hints ----------
    const missing: string[] = [];
    const warnings: string[] = [];
    const val = (key: string) => (values[key] ?? "").trim();

    fields.forEach((field) => {
        if (field.required && !val(field.key)) missing.push(field.label);
        if (
            field.kind === "url" &&
            val(field.key) &&
            !/^https?:\/\/\S+$/i.test(val(field.key))
        ) {
            warnings.push(`${field.label} should be a full URL starting with https://`);
        }
    });

    if (schemaType === "FAQPage") {
        const complete = faqs.filter((f) => f.q.trim() && f.a.trim()).length;
        const incomplete = faqs.filter(
            (f) => (f.q.trim() && !f.a.trim()) || (!f.q.trim() && f.a.trim())
        ).length;
        if (complete === 0) missing.push("At least one question with an answer");
        if (incomplete > 0) {
            warnings.push("Some questions are missing a question or an answer and were skipped.");
        }
    }

    if (schemaType === "BreadcrumbList") {
        const filled = crumbs.filter((c) => c.name.trim());
        if (filled.length === 0) missing.push("At least one breadcrumb item");
        filled.forEach((c, index) => {
            if (!c.url.trim() && index < filled.length - 1) {
                warnings.push(`Breadcrumb "${c.name}" needs a URL (only the last item may omit it).`);
            }
            if (c.url.trim() && !/^https?:\/\/\S+$/i.test(c.url.trim())) {
                warnings.push(`Breadcrumb "${c.name}" URL should start with https://`);
            }
        });
    }

    if (schemaType === "SoftwareApplication") {
        if (val("price") !== "" && !val("priceCurrency")) {
            warnings.push("Choose a currency for the price.");
        }
        if (!val("ratingValue") || !val("ratingCount")) {
            warnings.push(
                "Google's software rich results need a price plus a genuine rating or review. Without them the markup is still valid but may not earn a rich result."
            );
        }
        if (Boolean(val("ratingValue")) !== Boolean(val("ratingCount"))) {
            warnings.push("Add both the average rating and the number of ratings, or neither.");
        }
    }

    if (schemaType === "Product" && val("price") !== "" && !val("priceCurrency")) {
        warnings.push("Choose a currency for the price.");
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setCopyError("");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopyError("Copy failed. Select the code and copy it manually (Ctrl + C).");
        }
    };

    const handleDownload = () => {
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${schemaType.toLowerCase()}-schema.${wrapScript ? "html" : "json"}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        setValues({
            applicationCategory: "DeveloperApplication",
            priceCurrency: "USD",
            availability: "InStock",
        });
        setFaqs([{ q: "", a: "" }]);
        setCrumbs([
            { name: "", url: "" },
            { name: "", url: "" },
        ]);
        setCopyError("");
    };

    const inputClass =
        "w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";

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
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <FileJson className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                JSON-LD Schema Generator
                            </h1>
                            <p className="text-sm text-slate-400">
                                Create schema.org structured data markup for your pages, ready
                                to paste.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear data
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Runs in your browser</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* ---------- Form ---------- */}
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="schema-type"
                                className="text-xs font-bold uppercase tracking-wider text-slate-400"
                            >
                                Schema type
                            </label>
                            <select
                                id="schema-type"
                                value={schemaType}
                                onChange={(e) => setSchemaType(e.target.value as SchemaType)}
                                className={inputClass}
                            >
                                {TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {fields.map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <label
                                    htmlFor={`f-${field.key}`}
                                    className="text-xs font-bold uppercase tracking-wider text-slate-400"
                                >
                                    {field.label}
                                    {field.required && (
                                        <span className="ml-1 text-rose-400">*</span>
                                    )}
                                </label>

                                {field.kind === "textarea" ? (
                                    <textarea
                                        id={`f-${field.key}`}
                                        rows={3}
                                        value={values[field.key] ?? ""}
                                        placeholder={field.placeholder}
                                        onChange={(e) => setValue(field.key, e.target.value)}
                                        className={`${inputClass} resize-y`}
                                    />
                                ) : field.kind === "select" ? (
                                    <select
                                        id={`f-${field.key}`}
                                        value={values[field.key] ?? ""}
                                        onChange={(e) => setValue(field.key, e.target.value)}
                                        className={inputClass}
                                    >
                                        {field.options?.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        id={`f-${field.key}`}
                                        type={
                                            field.kind === "date"
                                                ? "date"
                                                : field.kind === "number"
                                                    ? "number"
                                                    : "text"
                                        }
                                        step={field.kind === "number" ? "any" : undefined}
                                        min={field.kind === "number" ? "0" : undefined}
                                        value={values[field.key] ?? ""}
                                        placeholder={field.placeholder}
                                        onChange={(e) => setValue(field.key, e.target.value)}
                                        className={inputClass}
                                    />
                                )}

                                {field.help && (
                                    <p className="text-xs text-slate-500">{field.help}</p>
                                )}
                            </div>
                        ))}

                        {/* FAQ builder */}
                        {schemaType === "FAQPage" && (
                            <div className="space-y-4">
                                {faqs.map((item, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Question {index + 1}
                                            </span>
                                            {faqs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFaqs((prev) => prev.filter((_, i) => i !== index))
                                                    }
                                                    aria-label={`Remove question ${index + 1}`}
                                                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={item.q}
                                            placeholder="What is your question?"
                                            aria-label={`Question ${index + 1}`}
                                            onChange={(e) =>
                                                setFaqs((prev) =>
                                                    prev.map((f, i) =>
                                                        i === index ? { ...f, q: e.target.value } : f
                                                    )
                                                )
                                            }
                                            className={inputClass}
                                        />
                                        <textarea
                                            rows={3}
                                            value={item.a}
                                            placeholder="Write the full answer..."
                                            aria-label={`Answer ${index + 1}`}
                                            onChange={(e) =>
                                                setFaqs((prev) =>
                                                    prev.map((f, i) =>
                                                        i === index ? { ...f, a: e.target.value } : f
                                                    )
                                                )
                                            }
                                            className={`${inputClass} resize-y`}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFaqs((prev) => [...prev, { q: "", a: "" }])}
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add question
                                </button>
                            </div>
                        )}

                        {/* Breadcrumb builder */}
                        {schemaType === "BreadcrumbList" && (
                            <div className="space-y-4">
                                {crumbs.map((item, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Level {index + 1}
                                            </span>
                                            {crumbs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCrumbs((prev) => prev.filter((_, i) => i !== index))
                                                    }
                                                    aria-label={`Remove level ${index + 1}`}
                                                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={item.name}
                                            placeholder={index === 0 ? "Home" : "Page name"}
                                            aria-label={`Level ${index + 1} name`}
                                            onChange={(e) =>
                                                setCrumbs((prev) =>
                                                    prev.map((c, i) =>
                                                        i === index ? { ...c, name: e.target.value } : c
                                                    )
                                                )
                                            }
                                            className={inputClass}
                                        />
                                        <input
                                            type="text"
                                            value={item.url}
                                            placeholder="https://myprotoolshub.com/tools"
                                            aria-label={`Level ${index + 1} URL`}
                                            onChange={(e) =>
                                                setCrumbs((prev) =>
                                                    prev.map((c, i) =>
                                                        i === index ? { ...c, url: e.target.value } : c
                                                    )
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setCrumbs((prev) => [...prev, { name: "", url: "" }])}
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add level
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ---------- Output ---------- */}
                    <div className="space-y-4 lg:sticky lg:top-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <Code2 className="h-4 w-4 text-blue-400" />
                                Generated JSON-LD
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={!hasContent}
                                    aria-label="Download generated markup"
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    disabled={!hasContent}
                                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                    {copied ? "Copied!" : "Copy code"}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300">
                            <input
                                type="checkbox"
                                checked={wrapScript}
                                onChange={(e) => setWrapScript(e.target.checked)}
                                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                            />
                            Wrap in &lt;script type=&quot;application/ld+json&quot;&gt; tag
                        </label>

                        <pre className="h-[420px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-400">
                            {output}
                        </pre>

                        <div aria-live="polite" className="space-y-3">
                            {copyError && (
                                <p className="text-xs font-medium text-rose-400">{copyError}</p>
                            )}

                            {missing.length > 0 && (
                                <div className="rounded-2xl border border-rose-900/50 bg-rose-950/40 p-4 text-sm text-rose-300">
                                    <div className="flex items-center gap-2 font-bold mb-1.5">
                                        <AlertCircle className="h-4 w-4" />
                                        Required fields missing
                                    </div>
                                    <ul className="list-disc pl-5 space-y-0.5 text-xs">
                                        {missing.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {warnings.length > 0 && (
                                <div className="rounded-2xl border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
                                    <div className="flex items-center gap-2 font-bold mb-1.5">
                                        <AlertCircle className="h-4 w-4" />
                                        Things to check
                                    </div>
                                    <ul className="list-disc pl-5 space-y-0.5 text-xs">
                                        {warnings.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {hasContent && missing.length === 0 && warnings.length === 0 && (
                                <div className="flex items-center gap-2 rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-3.5 text-sm text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    All required fields are filled in.
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 leading-relaxed space-y-2">
                            <p>
                                Always test your final page. Valid markup does not guarantee
                                that Google will show a rich result.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="https://search.google.com/test/rich-results"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
                                >
                                    Rich Results Test
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                                <a
                                    href="https://validator.schema.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
                                >
                                    Schema Markup Validator
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>
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
                        About the JSON-LD Schema Generator
                    </h2>
                </div>
                <p className="text-slate-300 text-base leading-relaxed">
                    The ProTools Hub JSON-LD Schema Generator builds structured data markup
                    for your web pages without writing code by hand. Choose a schema type,
                    fill in the details, and the tool produces valid JSON-LD that follows the
                    schema.org vocabulary. It supports Article, BlogPosting, Organization,
                    WebSite, SoftwareApplication, FAQ, Breadcrumb, LocalBusiness and Product
                    markup.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    Unlike generators that fill empty fields with fake sample text, this tool
                    only outputs the information you actually enter. It also tells you which
                    required fields are missing and flags common problems, such as URLs
                    without https:// or ratings without a rating count, before you copy the
                    code.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    Everything is generated in your browser as you type. You can copy the
                    markup, download it as a file, and choose whether it should be wrapped in
                    the script tag that search engines expect.
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
                            "Pick the schema type that matches the page you are marking up.",
                            "Fill in the fields. Items marked with a red star are required.",
                            "Review the warnings panel and fix anything it flags.",
                            "Copy the code, or download it, and paste it into the page it describes.",
                            "Test the live page with Google's Rich Results Test and the Schema Markup Validator.",
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
                            "9 schema types, including FAQ and Breadcrumb builders",
                            "Only outputs the data you enter, with no fake placeholders",
                            "Required-field and URL checks before you copy",
                            "Optional script tag wrapper, with safe escaping",
                            "Copy to clipboard or download as a file",
                            "Links to Google's testing tools",
                            "Free, no sign-up, generated in your browser",
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

            {/* What is structured data */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-4">
                <h2 className="text-xl font-extrabold text-white">
                    What Is Structured Data and JSON-LD?
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                    Search engines read the text on your page, but they have to guess what it
                    means. Structured data removes the guesswork. It is a standard way of
                    labelling your content, for example &quot;this is an article&quot;,
                    &quot;this is the author&quot;, or &quot;this is a product with this
                    price&quot;. The shared vocabulary for these labels is called schema.org,
                    and it is supported by Google, Bing and other search engines.
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    JSON-LD is the format Google recommends for writing structured data. It
                    sits inside a script tag, separate from the visible HTML, so you can add
                    or change it without touching your page layout. If you want to inspect or
                    tidy the code you generate, you can paste it into our{" "}
                    <Link
                        href="/tools/json-formatter"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        JSON Formatter & Validator
                    </Link>
                    .
                </p>
                <p className="text-slate-300 text-base leading-relaxed">
                    Google has said that structured data is not a direct ranking factor. Its
                    value is that it helps search engines understand your content and makes
                    your pages eligible for enhanced results, such as breadcrumbs in the
                    listing or rich product information. Eligibility is not a promise, and
                    Google changes which features it supports over time, so check its current
                    documentation for each type.
                </p>
            </section>

            {/* Which type */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-5">
                <h2 className="text-xl font-extrabold text-white">
                    Which Schema Type Should You Use?
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-300">
                            <tr>
                                <th className="px-4 py-3 font-bold">Type</th>
                                <th className="px-4 py-3 font-bold">Best for</th>
                                <th className="px-4 py-3 font-bold">What to know</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-400">
                            {SCHEMA_GUIDE.map((row) => (
                                <tr key={row.type}>
                                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                                        {row.type}
                                    </td>
                                    <td className="px-4 py-3">{row.use}</td>
                                    <td className="px-4 py-3">{row.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Where to put it */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-4">
                <h2 className="text-xl font-extrabold text-white">
                    How to Add JSON-LD to Your Website
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                    In a plain HTML site, paste the script tag into the head or body of the
                    page. Each page should carry markup that describes that page only. In a
                    Next.js or React project, you can render the tag from your page component
                    like this:
                </p>
                <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-400">
                    <code>{NEXT_SNIPPET}</code>
                </pre>
                <p className="text-slate-400 text-sm leading-relaxed">
                    In WordPress, many SEO plugins add basic schema automatically. You can
                    paste custom markup with a header-and-footer plugin or your theme&apos;s
                    custom code option.
                </p>
            </section>

            {/* Mistakes */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl space-y-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                        Common Structured Data Mistakes
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {COMMON_MISTAKES.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                        >
                            <h3 className="font-bold text-white text-base">{item.title}</h3>
                            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                                {item.fix}
                            </p>
                        </div>
                    ))}
                </div>
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
                <p className="text-sm text-slate-500">
                    Related tools:{" "}
                    <Link
                        href="/tools/json-formatter"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        JSON Formatter
                    </Link>
                    ,{" "}
                    <Link
                        href="/tools/markdown-to-html"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Markdown to HTML
                    </Link>
                    ,{" "}
                    <Link
                        href="/tools/base64-encoder"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        Base64 Encoder
                    </Link>
                    .
                </p>
            </section>
        </div>
    );
}