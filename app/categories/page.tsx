// app/categories/page.tsx
import type { Metadata } from "next";
import CategoriesContent from "@/app/categories/CategoriesContent"; // keep the import path you already use

export const metadata: Metadata = {
  title: "Tool Categories: PDF, Image, Text, Developer & Security",
  description:
    "Browse ProTools Hub tools by category: PDF tools, image tools, text tools, developer tools and security tools. All free, with no sign-up.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return <CategoriesContent />;
}