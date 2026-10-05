import { NextResponse } from "next/server";
import { getOrFetchExtraction } from "@/lib/extractor";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    let platform = "other";
    if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "youtube";
    else if (url.includes("instagram.com")) platform = "instagram";
    else if (url.includes("terabox")) platform = "terabox";

    const data = await getOrFetchExtraction(url, platform);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process video link" }, { status: 500 });
  }
}
