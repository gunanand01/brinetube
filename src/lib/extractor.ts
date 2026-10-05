import { db } from "./db";

const EXTRACTOR_URL =
  process.env.EXTRACTOR_URL ||
  "https://brinetube-extracter.onrender.com/extract";

export async function getOrFetchExtraction(url: string, platform: string) {
  try {
    // 1. Check Turso SQLite Cache
    const cached = await db.extractionCache.findUnique({
      where: { originalUrl: url },
    });

    if (cached && new Date() < cached.expiresAt) {
      return {
        title: cached.title,
        thumbnails: JSON.parse(cached.thumbnails),
        formats: JSON.parse(cached.formats),
        source: "cache",
      };
    }

    // 2. Fetch from External Extractor
    const res = await fetch(EXTRACTOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) throw new Error("Extraction failed from server");

    const data = await res.json();

    // 3. Save to Turso Cache (2 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    await db.extractionCache.upsert({
      where: { originalUrl: url },
      update: {
        title: data.title || "Video",
        thumbnails: JSON.stringify(data.thumbnails || []),
        formats: JSON.stringify(data.formats || []),
        expiresAt,
      },
      create: {
        originalUrl: url,
        platform: platform,
        title: data.title || "Video",
        thumbnails: JSON.stringify(data.thumbnails || []),
        formats: JSON.stringify(data.formats || []),
        expiresAt,
      },
    });

    return { ...data, source: "live" };
  } catch (error) {
    console.error("Extractor Helper Error:", error);
    throw error;
  }
}
