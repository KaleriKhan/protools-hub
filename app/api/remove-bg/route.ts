import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const imageFile = data.get("image");

        if (!imageFile) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const apiKey = process.env.REMOVE_BG_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing in environment variables" }, { status: 500 });
        }

        const formData = new FormData();
        formData.append("image_file", imageFile);
        formData.append("size", "auto");

        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: {
                "X-Api-Key": apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            return NextResponse.json({ error: err.errors?.[0]?.title || "Failed to remove background" }, { status: response.status });
        }

        const blob = await response.blob();
        return new NextResponse(blob, {
            headers: { "Content-Type": "image/png" },
        });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}