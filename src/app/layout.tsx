import type { Metadata } from "next";
import "./globals.css";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "BrineTube",
  description: "Stream & Download Media Directly",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  try {
    settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  } catch (error) {
    console.error("Failed to load settings in layout", error);
  }

  const primaryColor = settings?.primaryColor || "#3b82f6";
  const bgColor = settings?.backgroundColor || "#0f172a";
  const fontFamily = settings?.fontFamily || "Inter";
  const borderRadius = settings?.borderRadius || "0.5rem";

  return (
    <html lang="en">
      <body
        style={
          {
            "--primary-color": primaryColor,
            "--bg-color": bgColor,
            "--font-family": fontFamily,
            "--border-radius": borderRadius,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
