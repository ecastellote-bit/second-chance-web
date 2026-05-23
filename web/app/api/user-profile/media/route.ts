import { readFile } from "node:fs/promises";
import path from "node:path";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  getPublicProfileMediaBlobToken,
  isPublicProfileMediaBlobConfigured,
} from "@/lib/storage/profileMediaBlob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import { isSafeProfileMediaPathname } from "@/lib/users/profileMediaDelivery";

export const runtime = "nodejs";

function contentTypeFromPathname(pathname: string): string {
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function readLocalUpload(pathname: string): Promise<Response | null> {
  const match = pathname.match(/^profile-media\/(avatars|covers)\/(.+)$/i);
  if (!match) return null;

  const filePath = path.join(process.cwd(), "public", "uploads", match[1]!, match[2]!);

  try {
    const bytes = await readFile(filePath);
    return new Response(bytes, {
      headers: {
        "Content-Type": contentTypeFromPathname(pathname),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return null;
  }
}

async function readFromBlob(pathname: string) {
  let result = await get(pathname, { access: "private" });
  if (
    (!result || result.statusCode !== 200) &&
    isPublicProfileMediaBlobConfigured()
  ) {
    result = await get(pathname, {
      access: "public",
      token: getPublicProfileMediaBlobToken(),
    });
  }
  return result;
}

/** Respaldo: sirve fotos del store privado (legacy) o local en dev. */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get("pathname")?.trim() ?? "";

  if (!isSafeProfileMediaPathname(pathname)) {
    return NextResponse.json({ error: "invalid_path" }, { status: 400 });
  }

  if (!isVercelBlobConfigured()) {
    const local = await readLocalUpload(pathname);
    if (local) return local;
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const result = await readFromBlob(pathname);

  if (!result || result.statusCode !== 200 || !result.stream) {
    const local = await readLocalUpload(pathname);
    if (local) return local;
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? contentTypeFromPathname(pathname),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
