import type { Metadata } from "next";
import Base64EncoderTool from "./Base64EncoderTool";

export const metadata: Metadata = {
    title: "Base64 Encoder & Decoder Online | Fast & Private | ProTools Hub",
    description: "Encode text to Base64 format or decode Base64 strings instantly in your browser. 100% private developer utility with zero server uploads.",
    keywords: ["base64 encoder", "base64 decoder online", "convert text to base64", "base64 converter"],
};

export default function Base64Page() {
    return <Base64EncoderTool />;
}