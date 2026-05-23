"use client";

const MAX_SIDE_PX = 1024;
const JPEG_QUALITY = 0.78;

function scaleDimensions(width: number, height: number): { width: number; height: number } {
  if (width <= MAX_SIDE_PX && height <= MAX_SIDE_PX) {
    return { width, height };
  }
  if (width >= height) {
    return {
      width: MAX_SIDE_PX,
      height: Math.round((height * MAX_SIDE_PX) / width),
    };
  }
  return {
    width: Math.round((width * MAX_SIDE_PX) / height),
    height: MAX_SIDE_PX,
  };
}

async function canvasToJpegFile(
  source: CanvasImageSource,
  width: number,
  height: number,
  name: string,
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("image_load_failed");

  ctx.drawImage(source, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
  if (!blob || blob.size === 0) throw new Error("image_load_failed");

  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

async function compressWithBitmap(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = scaleDimensions(bitmap.width, bitmap.height);
    const base = file.name.replace(/\.[^.]+$/i, "") || "foto";
    return await canvasToJpegFile(bitmap, width, height, base);
  } finally {
    bitmap.close();
  }
}

async function compressWithHtmlImage(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("image_load_failed"));
      el.src = url;
    });
    const { width, height } = scaleDimensions(img.naturalWidth, img.naturalHeight);
    const base = file.name.replace(/\.[^.]+$/i, "") || "foto";
    return await canvasToJpegFile(img, width, height, base);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Galería del celu → JPEG liviano (~100–400 KB). */
export async function compressProfileImage(file: File): Promise<File> {
  if (!file.size) throw new Error("image_empty");

  if (typeof createImageBitmap === "function") {
    try {
      return await compressWithBitmap(file);
    } catch {
      // Fallback para galerías Android/iOS.
    }
  }

  return compressWithHtmlImage(file);
}

/** FileReader evita btoa() que congela muchos celulares. */
export async function profileImageToBase64(file: File): Promise<string> {
  const jpeg = await compressProfileImage(file);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string" || !reader.result) {
        reject(new Error("image_read_failed"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("image_read_failed"));
    reader.readAsDataURL(jpeg);
  });

  const comma = dataUrl.indexOf(",");
  if (comma < 0) throw new Error("image_read_failed");
  return dataUrl.slice(comma + 1);
}
