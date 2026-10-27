import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
        }

        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            console.error("HUGGINGFACE_API_KEY is missing in .env.local");
            return NextResponse.json({ success: false, error: 'API key is missing' }, { status: 500 });
        }

        let response = null;
        let attempts = 0;
        const maxAttempts = 3;

        // Retry loop to handle model loading / cold start delays
        while (attempts < maxAttempts) {
            try {
                attempts++;
                response = await fetch(
                    'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/octet-stream',
                        },
                        body: buffer,
                    }
                );

                if (response.ok) break;

                // If model is loading (503), wait a couple seconds and retry
                if (response.status === 503 && attempts < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                    continue;
                }

                break;
            } catch (netError) {
                if (attempts >= maxAttempts) throw netError;
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        if (!response || !response.ok) {
            const errorText = response ? await response.text() : 'Network fetch failed';
            console.error("Hugging Face API Error:", errorText);
            return NextResponse.json({ success: false, error: errorText }, { status: response?.status || 500 });
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');

        return NextResponse.json({
            success: true,
            image: `data:image/png;base64,${base64Image}`
        });
    } catch (error: any) {
        console.error("Server API Catch Error:", error.message || error);
        return NextResponse.json({
            success: false,
            error: 'Connection failed. Please check your internet or VPN.'
        }, { status: 500 });
    }
}