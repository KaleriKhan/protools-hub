import type { Metadata } from "next";
import TextSummarizerTool from "./TextSummarizerTool";

export const metadata: Metadata = {
    title: "Free Text Summarizer Online | Instant AI Summary | ProTools Hub",
    description: "Summarize articles, essays, and long documents into key bullet points instantly. Secure in-browser text summarizer.",
    keywords: ["text summarizer", "article summarizer online", "summarize text free", "ai text summary"],
};

export default function TextSummarizerPage() {
    return <TextSummarizerTool />;
}