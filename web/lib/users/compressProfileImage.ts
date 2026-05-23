"use client";

import { resolveProfileFileMime } from "@/lib/users/profileMediaValidation";

const MAX_SIDE_PX = 1600;
const JPEG_QUALITY = 0.85;

/**
 * Reduce peso y tamaño antes de enviar al servidor (crítico en celular + Vercel).
 */
export async function compressProfileImage(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") {
    if (!resolveProfileFileMime(file)) throw new Error("image_invalid_type");
    return file;
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > MAX_SIDE_PX || height > MAX_SIDE_PX) {
      if (width >= height) {
        height = Math.round((height * MAX_SIDE_PX) / width);
        width = MAX_SIDE_PX;
      } else {
        width = Math.round((width * MAX_SIDE_PX) / height);
        height = MAX_SIDE_PX;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/i, "") || "foto";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    if (!resolveProfileFileMime(file)) throw new Error("image_invalid_type");
    return file;
  } finally {
    bitmap?.close();
  }
}
