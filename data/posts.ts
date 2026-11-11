// data/posts.ts
export type Section = { id: string; heading: string; body: string[]; bullets?: string[] };
export type Post = {
    slug: string;
    title: string;
    excerpt: string;
    description: string; // meta description, ~150 chars
    category: "Optimization" | "Tutorials" | "Security" | "Tools";
    date: string; // ISO yyyy-mm-dd
    updated?: string;
    readTime: string;
    featured?: boolean;
    takeaways: string[];
    sections: Section[];
    faqs: { q: string; a: string }[];
    tool: { name: string; href: string; blurb: string };
    related: string[]; // slugs
};

export const AUTHOR = "ProTools Hub Team";
export const SITE = "https://myprotoolshub.com";

const RAW_POSTS: Post[] = [
    {
        slug: "how-to-resize-images-without-losing-quality",
        title: "How to Resize Images Without Losing Quality",
        excerpt: "Pick the right dimensions and format, avoid repeated re-compression, and resize images in your browser without uploading them anywhere.",
        description: "Learn how to resize images without visible quality loss: choose the right dimensions, pick JPEG, PNG or WebP, and avoid the mistakes that blur photos.",
        category: "Optimization",
        date: "2026-09-11",
        readTime: "7 min read",
        featured: true,
        takeaways: [
            "Making an image smaller keeps quality well; making it larger cannot add detail that is not there.",
            "Resize once from the original file, never from an already resized copy.",
            "Match the pixel size to how large the image is actually displayed, then export in the right format.",
            "JPEG suits photos, PNG suits graphics and transparency, WebP is usually smaller than both.",
        ],
        sections: [
            {
                id: "what-resizing-does",
                heading: "What resizing actually does to an image",
                body: [
                    "A digital image is a grid of pixels. When you resize it, the software has to decide what colour every pixel in the new grid should be. When you shrink an image, many original pixels are averaged into each new pixel. This is why a photo reduced from 4000 pixels wide to 1200 pixels wide still looks sharp: you are throwing away surplus detail, not inventing anything.",
                    "Enlarging works the other way around. The software must create pixels that never existed, so it guesses by blending neighbouring pixels. The result is a larger file that looks soft, because no new detail has been added. This is the single most important rule of resizing: scaling down is safe, scaling up is not.",
                ],
            },
            {
                id: "choose-dimensions",
                heading: "Choose dimensions based on where the image will be used",
                body: [
                    "The best size is the smallest one that still looks crisp where the image is shown. A blog image displayed 800 pixels wide on a laptop does not need to be 4000 pixels wide. Phones and many laptops have high-density screens, so a good rule is to export at up to twice the display width, and no more.",
                    "Some common targets are listed below. They are guidelines rather than strict rules, and platforms change their recommendations from time to time, so check the current requirements before publishing.",
                ],
                bullets: [
                    "Blog or article body image: 1200 to 1600 pixels wide.",
                    "Social sharing preview (Open Graph): 1200 x 630 pixels is the widely used size.",
                    "Profile picture or avatar: 400 x 400 pixels is usually plenty.",
                    "Email: 600 to 800 pixels wide keeps messages light.",
                    "Thumbnails: 300 to 400 pixels wide.",
                ],
            },
            {
                id: "keep-aspect-ratio",
                heading: "Keep the aspect ratio locked",
                body: [
                    "The aspect ratio is the proportion between width and height. If you change only one dimension, the picture stretches and people look wider or thinner. Locking the aspect ratio means that when you type a new width, the height is calculated for you. Unlock it only when you genuinely need a different shape, and in that case crop first instead of stretching.",
                ],
            },
            {
                id: "pick-format",
                heading: "Pick the right output format",
                body: [
                    "Format affects both quality and file size, so choose it deliberately rather than leaving the default.",
                ],
                bullets: [
                    "JPEG: best for photographs. It uses lossy compression, so each save discards a little data. It has no transparency.",
                    "PNG: lossless and supports transparency. Ideal for logos, screenshots and graphics with sharp edges, but photos can become very large.",
                    "WebP: supported by all current major browsers. It usually produces smaller files than JPEG or PNG at similar visual quality, and supports transparency.",
                ],
            },
            {
                id: "avoid-recompression",
                heading: "Never resize a copy of a copy",
                body: [
                    "Every time a JPEG is saved, the encoder throws away a little more information. Open, resize, save, then open that result and resize it again, and small flaws start to stack up into blocky edges and muddy colours. Always keep your original file and make each resize from it. If you need several sizes, create each one from the original rather than chaining them.",
                    "A related tip is to choose a quality setting around 80 to 90 percent for photos. Going from 100 to 85 percent usually cuts file size substantially with little difference you can see, while going below 60 percent tends to produce visible artefacts.",
                ],
            },
            {
                id: "common-mistakes",
                heading: "Common resizing mistakes",
                body: ["These problems cause most of the complaints about blurry or heavy images."],
                bullets: [
                    "Enlarging a small image and expecting it to look sharp.",
                    "Uploading a huge photo and letting the page shrink it with CSS, which wastes bandwidth.",
                    "Saving a photograph as PNG, which creates a very large file for no visual gain.",
                    "Stretching an image to fit a space instead of cropping it.",
                    "Forgetting that phone photos can carry an orientation flag, so a picture may appear rotated after processing.",
                ],
            },
            {
                id: "privacy",
                heading: "Resizing privately in your browser",
                body: [
                    "Many online resizers upload your pictures to a remote server. That is unnecessary: modern browsers can resize images on your own device using the Canvas API. With a browser-based tool, the file is read and processed locally, so personal photos and client artwork do not need to leave your computer or phone.",
                ],
            },
        ],
        faqs: [
            { q: "Does resizing reduce image quality?", a: "Shrinking an image keeps it sharp when done from the original file. Quality drops mainly when you enlarge an image or repeatedly re-save a JPEG." },
            { q: "What is the best format for a resized photo?", a: "JPEG is the safest all-round choice for photos. WebP is often smaller at similar quality and is supported by current major browsers." },
            { q: "Can I make a small image bigger without it looking blurry?", a: "Not reliably. Enlarging cannot add real detail, so the result looks softer. Start from the largest original you have." },
        ],
        tool: { name: "Image Resizer", href: "/tools/image-resizer", blurb: "Resize by pixels or percent, lock the aspect ratio and export PNG, JPEG or WebP, all in your browser." },
        related: ["how-local-image-compression-speeds-up-seo", "why-in-browser-file-processing-means-100-percent-privacy"],
    },
    {
        slug: "how-extractive-text-summarization-works",
        title: "How Extractive Text Summarization Works (and Where It Falls Short)",
        excerpt: "Learn how sentence scoring picks the key lines from long text, and when you should read the full source instead.",
        description: "A plain explanation of extractive text summarization: how sentences are scored and selected, what it does well, its limits, and tips for better summaries.",
        category: "Tools",
        date: "2026-09-11",
        readTime: "7 min read",
        takeaways: [
            "An extractive summarizer selects the most important existing sentences; it does not rewrite them.",
            "Sentences are scored by how many significant words they contain, where they appear and how unique they are.",
            "It works best on well-structured prose such as articles and reports, and worst on tables, lists and dialogue.",
            "Always check numbers, names and conclusions against the original before relying on a summary.",
        ],
        sections: [
            {
                id: "two-kinds",
                heading: "Extractive and abstractive summaries",
                body: [
                    "There are two broad approaches to summarizing text. An abstractive summarizer writes new sentences that express the meaning of the original, the way a person would. An extractive summarizer works differently: it reads the text, ranks the sentences by importance, and returns the top ones exactly as they were written.",
                    "Extractive methods are simpler, predictable and easy to verify, because every sentence in the summary can be found word for word in the source. That also means they cannot paraphrase or combine ideas, which is their main limitation.",
                ],
            },
            {
                id: "how-it-works",
                heading: "How sentence scoring works",
                body: [
                    "A typical extractive summarizer follows a short pipeline. First, the text is split into sentences, which is harder than it sounds because full stops also appear in abbreviations such as Dr. or e.g. and in decimal numbers. Next, common filler words like the, and and of are ignored, since they say little about the topic.",
                    "The remaining words are weighted. A word that appears often in the document is probably central to its topic, but a word that appears in nearly every sentence is less useful for telling sentences apart. Balancing these two ideas is the logic behind the well-known term frequency and inverse frequency family of weights. Each sentence receives a score from the weights of the words it contains.",
                    "Finally, the summarizer picks sentences with the highest scores. Good implementations also apply a penalty for sentences that repeat what has already been chosen, so the summary does not say the same thing three times.",
                ],
            },
            {
                id: "position",
                heading: "Why position matters",
                body: [
                    "In news articles, reports and essays, the first sentences usually frame the topic and the opening sentence of a paragraph often states its main point. Many summarizers therefore give a small boost to sentences near the start of the text or of a paragraph. Very short fragments and extremely long sentences are often scored down, because they rarely make good summary lines.",
                ],
            },
            {
                id: "strengths",
                heading: "What it does well",
                body: ["Extractive summarization is a good fit when you need a quick overview of long, well-written material."],
                bullets: [
                    "Skimming long articles, reports and research write-ups before deciding what to read in full.",
                    "Pulling candidate quotes and key sentences for notes.",
                    "Getting a first pass over meeting notes or transcripts that are written in full sentences.",
                    "Working privately, since the processing can run entirely in the browser.",
                ],
            },
            {
                id: "limits",
                heading: "Where it falls short",
                body: [
                    "Because sentences are copied unchanged, a selected sentence may depend on context that was left out. A line beginning with \"This approach\" or \"However\" can lose its meaning once its neighbours are gone. Extractive summaries can also read as slightly choppy, since the sentences were never written to follow one another.",
                    "It also does not understand the text. It cannot tell that a minor detail contradicts the main claim, and it handles tables, bullet lists, code and dialogue poorly. Very short inputs give little to rank, so the best result may simply be the original text.",
                ],
            },
            {
                id: "tips",
                heading: "Tips for better summaries",
                body: ["A few habits make the output noticeably more useful."],
                bullets: [
                    "Paste clean prose and remove menus, captions and repeated headers first.",
                    "Start with a summary length of roughly 15 to 25 percent of the original, then adjust.",
                    "Keep sentences in their original order so the summary follows the flow of the source.",
                    "Treat the key terms list as a quick check that the summary matches the topic you expected.",
                    "Verify all figures, dates and names against the source before you quote them.",
                ],
            },
        ],
        faqs: [
            { q: "Is extractive summarization the same as AI summarization?", a: "No. It uses statistical sentence scoring, not a language model. It selects existing sentences and does not generate new wording." },
            { q: "Why are some summary sentences out of context?", a: "Sentences are copied unchanged, so references like \"this\" or \"however\" can lose their meaning when neighbouring sentences are left out." },
            { q: "Is my text sent to a server?", a: "A browser-based summarizer can process text on your device. Check the tool's privacy notes to confirm how a specific tool handles your text." },
        ],
        tool: { name: "Text Summarizer", href: "/tools/text-summarizer", blurb: "Choose a summary length, keep the original order and see the key terms found in your text." },
        related: ["why-in-browser-file-processing-means-100-percent-privacy", "how-to-resize-images-without-losing-quality"],
    },
    {
        slug: "how-local-image-compression-speeds-up-seo",
        title: "How Image Compression Improves Page Speed and Core Web Vitals",
        excerpt: "Smaller images load faster and help Largest Contentful Paint. See what to compress, which format to use and how far to go.",
        description: "How image compression improves page speed and Core Web Vitals, which formats to use, how to size and lazy-load images, and the mistakes to avoid.",
        category: "Optimization",
        date: "2026-09-04",
        readTime: "8 min read",
        takeaways: [
            "Images are often the largest element on a page, so they strongly influence Largest Contentful Paint.",
            "Compress, resize to the displayed size and use a modern format such as WebP.",
            "Set width and height on images to prevent layout shift, and lazy-load only images below the fold.",
            "Page speed is one of many ranking factors; relevant, helpful content still matters most.",
        ],
        sections: [
            {
                id: "why-it-matters",
                heading: "Why images matter for speed",
                body: [
                    "On many pages, images account for most of the bytes a browser has to download. The bigger the files, the longer visitors wait, especially on mobile connections. Slow pages frustrate people, and Google has said that page experience signals, including Core Web Vitals, are used by its ranking systems. They are one factor among many, and great content on a slightly slower page can still rank well, but there is no reason to leave easy wins on the table.",
                ],
            },
            {
                id: "core-web-vitals",
                heading: "The Core Web Vitals images touch",
                body: [
                    "Core Web Vitals are three measurements of real-world user experience. Images influence two of them directly.",
                ],
                bullets: [
                    "Largest Contentful Paint (LCP) measures how long the main content takes to appear. A good score is 2.5 seconds or less. On many pages the largest element is a hero image, so its file size and loading priority matter a great deal.",
                    "Cumulative Layout Shift (CLS) measures unexpected movement of content. A good score is 0.1 or less. Images without declared dimensions push text down when they load.",
                    "Interaction to Next Paint (INP) measures responsiveness. A good score is 200 milliseconds or less. Images affect it less, but very heavy pages can slow the browser overall.",
                ],
            },
            {
                id: "compress-resize-format",
                heading: "The three steps: resize, compress, choose a format",
                body: [
                    "Start by resizing. An image displayed 800 pixels wide should not be a 4000 pixel original. This alone often removes most of the file weight. Then compress: for photographs, a JPEG or WebP quality of about 75 to 85 percent usually looks nearly identical to the original at a fraction of the size.",
                    "Finally, choose the right format. WebP is supported by all current major browsers and typically creates smaller files than JPEG or PNG. AVIF can be smaller still but is slower to encode and may need a fallback in some workflows. Keep PNG for graphics that need lossless quality or transparency, and consider SVG for simple logos and icons.",
                ],
            },
            {
                id: "layout-and-loading",
                heading: "Loading images the right way",
                body: ["Compression is only half the story. How images are placed on the page also affects the scores."],
                bullets: [
                    "Always set width and height attributes (or an aspect ratio in CSS) so the browser reserves space and avoids layout shift.",
                    "Use loading=\"lazy\" for images below the fold, but do not lazy-load the main hero image, because that delays LCP.",
                    "Offer several sizes with srcset and sizes so phones download smaller files than desktops.",
                    "In Next.js, the built-in Image component handles resizing, modern formats and lazy loading for you.",
                    "Write descriptive alt text. It helps accessibility and gives search engines context.",
                ],
            },
            {
                id: "how-far",
                heading: "How far should you compress?",
                body: [
                    "There is no single perfect number. A reasonable approach is to compress until you can just begin to see a difference when comparing at full size, then step back slightly. Photos tolerate more compression than screenshots with text, where artefacts around letters show quickly. Always compare the before and after view and keep the original file in case you need to export again.",
                ],
            },
            {
                id: "mistakes",
                heading: "Mistakes to avoid",
                body: ["These are the issues we see most often on slow pages."],
                bullets: [
                    "Uploading camera originals straight to the site.",
                    "Using PNG for photographs.",
                    "Compressing an already compressed JPEG again and again.",
                    "Lazy-loading the hero image.",
                    "Leaving out image dimensions, which causes layout shift.",
                ],
            },
            {
                id: "measure",
                heading: "Measure the result",
                body: [
                    "After optimizing, test with PageSpeed Insights or Lighthouse, and check the Core Web Vitals report in Google Search Console, which uses real visitor data. Make one change at a time so you know what helped.",
                ],
            },
        ],
        faqs: [
            { q: "Does image compression help SEO?", a: "Indirectly. Faster pages improve user experience and Core Web Vitals, which are used by Google's ranking systems, though content relevance remains the most important factor." },
            { q: "What quality setting should I use for JPEG or WebP?", a: "For photographs, roughly 75 to 85 percent is a good starting point. Compare the result at full size before settling." },
            { q: "Should I lazy-load every image?", a: "No. Lazy-load images below the fold, but load the main above-the-fold image normally so it does not slow Largest Contentful Paint." },
        ],
        tool: { name: "Image Compressor", href: "/tools/image-compressor", blurb: "Compress several images at once, compare before and after, and download them as a ZIP." },
        related: ["how-to-resize-images-without-losing-quality", "understanding-pdf-compression"],
    },
    {
        slug: "understanding-pdf-compression",
        title: "Understanding PDF Compression: Lossless vs Lossy Settings",
        excerpt: "What actually makes a PDF large, which settings shrink it, and what you give up at each level.",
        description: "What makes PDF files large, the difference between lossless and lossy compression, recommended image resolutions, and how to shrink a PDF safely.",
        category: "Tutorials",
        date: "2026-08-28",
        readTime: "7 min read",
        takeaways: [
            "Most large PDFs are large because of images, especially scans and photos, not because of text.",
            "Lossless methods shrink a file without changing how it looks; lossy methods trade some image quality for a much smaller size.",
            "For on-screen reading, around 150 dpi images are usually enough; use about 300 dpi for printing.",
            "Keep your original, compress a copy, and check the result before sending it.",
        ],
        sections: [
            {
                id: "why-large",
                heading: "Why PDF files get large",
                body: [
                    "Text and vector graphics take very little space in a PDF. What makes files heavy is almost always raster images: photographs, screenshots and especially scanned pages, where every page is stored as a picture. A 50-page scan at high resolution can easily reach tens of megabytes. Embedded fonts, unused objects left behind by editing and uncompressed data streams add smaller amounts.",
                ],
            },
            {
                id: "lossless",
                heading: "Lossless compression",
                body: [
                    "Lossless techniques make the file smaller without altering what you see. They compress the internal data streams, remove duplicate or unused objects, and can pack many small objects together more efficiently. The saving is modest on a document that is mostly images, but the result is identical to the original on screen and in print, so it is the safe first step.",
                ],
            },
            {
                id: "lossy",
                heading: "Lossy compression",
                body: [
                    "Lossy compression reduces image data permanently. It usually works in two ways: downsampling, which lowers the resolution of images, and recompression, which re-encodes them as JPEG at a lower quality. This is where large reductions come from, often by far the biggest. The cost is that fine detail is lost, and once a file has been compressed this way the detail cannot be restored.",
                    "That is why you should always keep the original and compress a copy. If the result looks too rough, you can try again from the original at a gentler setting.",
                ],
            },
            {
                id: "resolution",
                heading: "Choosing a resolution",
                body: ["Resolution is measured in dots per inch (dpi). The right level depends on how the document will be used."],
                bullets: [
                    "About 72 to 100 dpi: very small files for quick on-screen viewing. Text in scanned pages may look soft.",
                    "About 150 dpi: a good balance for reading on screens and sharing by email.",
                    "About 300 dpi: standard for printing documents and photographs.",
                ],
            },
            {
                id: "scanned",
                heading: "Scanned documents are a special case",
                body: [
                    "A scanned PDF has no real text, only a picture of each page. Shrinking it means reducing those pictures, so quality and size are directly linked. Black-and-white or greyscale scans compress much better than colour ones, so if colour is not needed, converting before scanning can save a lot of space. If you need to search or copy text from a scan, you will need OCR, which is a separate process from compression.",
                ],
            },
            {
                id: "workflow",
                heading: "A safe compression workflow",
                body: ["Following the same steps each time avoids unpleasant surprises."],
                bullets: [
                    "Keep the original file untouched.",
                    "Compress a copy, starting with a medium setting.",
                    "Open the result and check small text, signatures and images.",
                    "If quality is poor, go back to the original and use a gentler level.",
                    "Check any upload limit you are aiming for, such as an email or form size cap.",
                ],
            },
            {
                id: "privacy",
                heading: "A note on sensitive documents",
                body: [
                    "PDFs often contain contracts, IDs and financial records. Prefer tools that process files in your browser, so the document is not uploaded to someone else's server. Whichever tool you use, read its privacy notes and avoid sharing sensitive files through services you do not trust.",
                ],
            },
        ],
        faqs: [
            { q: "Will compressing a PDF reduce quality?", a: "Lossless compression does not change quality. Lossy compression lowers image quality to save space; the text and vector parts stay sharp unless the page is a scanned image." },
            { q: "Why is my scanned PDF so big?", a: "Each page is stored as a full image. Lower scan resolution, greyscale or black-and-white scanning and image compression reduce the size." },
            { q: "What size should a PDF be for email?", a: "Many email services limit attachments to roughly 20 to 25 MB, but smaller is better. Check the limit of your provider or form." },
        ],
        tool: { name: "PDF Compressor", href: "/tools/pdf-compressor", blurb: "Reduce PDF file size in your browser, then check the result before you share it." },
        related: ["why-in-browser-file-processing-means-100-percent-privacy", "how-local-image-compression-speeds-up-seo"],
    },
    {
        slug: "why-in-browser-file-processing-means-100-percent-privacy",
        title: "In-Browser File Processing: What It Means for Your Privacy",
        excerpt: "Why tools that run in your browser keep files off remote servers, and what that does and does not protect.",
        description: "How in-browser file processing works, what it protects, what it does not, and how to check for yourself that a tool is not uploading your files.",
        category: "Security",
        date: "2026-08-15",
        readTime: "6 min read",
        takeaways: [
            "In-browser tools process your file on your own device, so the file contents do not need to be sent to a server.",
            "It reduces risk, but it is not a guarantee: pages can still load analytics, ads and cookies.",
            "You can verify a tool's behaviour with your browser's Network tab or by going offline after the page loads.",
            "For highly sensitive files, still use a trusted device and a current browser.",
        ],
        sections: [
            {
                id: "traditional-model",
                heading: "The traditional upload model",
                body: [
                    "Most online converters work like this: you upload your file, a server processes it, and you download the result. That means a copy of your document or photo, at least for a short time, sits on a computer you do not control. Even well-run services must store, secure and delete that data correctly, and you have to trust that they do.",
                ],
            },
            {
                id: "browser-model",
                heading: "How in-browser processing works",
                body: [
                    "Modern browsers are powerful enough to do the work themselves. When you choose a file, the page reads it using the File API. The code then processes it locally: the Canvas API can resize and re-encode images, JavaScript libraries can rearrange PDF pages, and WebAssembly lets heavy tasks run at near-native speed. The result is created in memory and handed back to you as a download. At no point does the file contents have to leave your device.",
                ],
            },
            {
                id: "what-protects",
                heading: "What this protects against",
                body: ["Local processing removes several risks that come with uploading."],
                bullets: [
                    "A service storing a copy of your file longer than promised.",
                    "A data breach at a company that held your uploads.",
                    "Files being intercepted while travelling to a server.",
                    "Slow uploads of large files on weak connections.",
                ],
            },
            {
                id: "what-not",
                heading: "What it does not protect against",
                body: [
                    "It is worth being precise, because \"private\" is easy to overstate. Loading a web page still contacts a server, and sites often use analytics or advertising that set cookies or collect information such as your browser type and pages visited. That is separate from your file contents, but it is part of your overall privacy. In-browser processing also cannot protect you from malware on your device, a malicious browser extension or someone else using your computer.",
                ],
            },
            {
                id: "verify",
                heading: "How to check for yourself",
                body: ["You do not have to take any tool's word for it. Two simple checks are available in any browser."],
                bullets: [
                    "Open developer tools, switch to the Network tab, then process a file. If the tool is genuinely local, you will not see a request carrying your file data.",
                    "Load the tool, turn off your internet connection, then use it. A fully local tool keeps working offline.",
                    "Read the site's privacy policy to see how ads, cookies and analytics are handled.",
                ],
            },
            {
                id: "best-practice",
                heading: "Good habits for sensitive files",
                body: [
                    "Keep your browser up to date, remove extensions you do not trust, and avoid working on confidential files on shared or public computers. Delete downloaded results when you no longer need them. For regulated data such as medical or legal records, follow your organisation's rules even when a tool runs locally.",
                ],
            },
        ],
        faqs: [
            { q: "Is in-browser processing completely private?", a: "It keeps file contents on your device, which greatly reduces risk. It does not stop normal web tracking such as cookies from analytics or ads, so read the site's privacy policy." },
            { q: "Can I use these tools offline?", a: "Once a page has loaded, tools that run fully in the browser often keep working without a connection. Tools that fetch extra resources, such as OCR language data, may need to be online the first time." },
            { q: "How do I know a tool is not uploading my file?", a: "Watch the Network tab in your browser's developer tools while processing a file, or try the tool offline after loading the page." },
        ],
        tool: { name: "All Tools", href: "/categories", blurb: "Browse free tools for images, PDFs, text and developers that process your files in the browser." },
        related: ["understanding-pdf-compression", "how-extractive-text-summarization-works"],
    },
];

// Read time is computed from the real article text (about 220 words per minute),
// so it can never disagree with the length of the article.
const wordsOf = (p: Post) =>
    [p.excerpt, ...p.takeaways, ...p.sections.flatMap((s) => [s.heading, ...s.body, ...(s.bullets ?? [])]), ...p.faqs.flatMap((f) => [f.q, f.a])]
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;

export const POSTS: Post[] = RAW_POSTS.map((p) => ({
    ...p,
    readTime: `${Math.max(1, Math.round(wordsOf(p) / 220))} min read`,
}));

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });