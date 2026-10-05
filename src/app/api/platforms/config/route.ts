import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const configs = await db.platformConfig.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching platform configs:", error);
    return NextResponse.json({ error: "Failed to fetch configs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, isActive, proxyPool, cookies, rateLimit } = body;

    if (!platform) {
      return NextResponse.json({ error: "Platform name is required" }, { status: 400 });
    }

    const platformKey = platform.toLowerCase().trim();

    const config = await db.platformConfig.upsert({
      where: { platform: platformKey },
      update: {
        isActive,
        proxyPool: proxyPool || "[]",
        cookies: cookies || null,
        rateLimit: Number(rateLimit) || 100,
      },
      create: {
        platform: platformKey,
        isActive,
        proxyPool: proxyPool || "[]",
        cookies: cookies || null,
        rateLimit: Number(rateLimit) || 100,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Error saving platform config:", error);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
