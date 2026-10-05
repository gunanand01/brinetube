import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json({ error: "No video URL provided" }, { status: 400 });
  }

  const directUrl = videoUrl.includes("?")
    ? `${videoUrl}&download=1`
    : `${videoUrl}?download=1`;

  return NextResponse.redirect(directUrl);
}
