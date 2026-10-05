import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      return NextResponse.json({
        siteName: "BrineTube",
        tagline: "Stream & Download Media Directly",
        primaryColor: "#3b82f6",
        backgroundColor: "#0f172a",
        logoUrl: "",
        fontFamily: "Inter",
        borderRadius: "0.5rem",
        maintenanceMode: false,
        downloadEnabled: true,
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = await db.siteSettings.upsert({
      where: { id: 1 },
      update: { ...body },
      create: { id: 1, ...body },
    });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating site settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
