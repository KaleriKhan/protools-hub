import type { Metadata } from "next";
import ImageResizerTool from "./ImageResizerTool";

export const metadata: Metadata = {
    title: "Free Image Resizer Online | Fast & High Quality | ProTools Hub",
    description: "Resize images to custom dimensions in pixels or percentage instantly. 100% client-side privacy with no server uploads.",
    keywords: ["image resizer online", "resize image free", "photo resizer", "crop image online"],
};

export default function ImageResizerPage() {
    return <ImageResizerTool />;
}