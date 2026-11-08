// app/tools/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Free Online Tools for PDF, Images, Text & Code",
    description:
        "Browse free online tools to compress images and PDFs, convert PDF to Word, format JSON, generate passwords and QR codes, and more. No sign-up, runs in your browser.",
    alternates: { canonical: "/tools" },
};

export default function ToolsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}