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
  } catch (error: any) {
    // Yeh line add ki hai taaki Vercel logs me asli bimari dikhe
    console.error("[EXTRACTION ERROR DETAILS]:", error);
    
    // Asli error message frontend pe bhi bhej rahe hain thodi der ke liye
    return NextResponse.json({ 
      error: "Failed to process video link", 
      details: error.message 
    }, { status: 500 });
  }
}

