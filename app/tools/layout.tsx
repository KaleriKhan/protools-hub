import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Free Online Tools",
    description:
        "Explore free online tools for PDF, images, text, developers, AI, calculators and more.",
};

export default function ToolsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
};