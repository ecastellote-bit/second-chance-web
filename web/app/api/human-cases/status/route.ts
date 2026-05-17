import { NextResponse } from "next/server";
import { getDurableStoreStatus } from "@/lib/learning/humanCaseDurableStore";
import { listHumanCaseBundles } from "@/lib/learning/humanCaseDurableStore";

export async function GET() {
  const status = getDurableStoreStatus();

  let caseCount = 0;
  if (status.configured) {
    try {
      const items = await listHumanCaseBundles(5);
      caseCount = items.length;
    } catch {
      caseCount = -1;
    }
  }

  return NextResponse.json({
    ok: true,
    durable: status,
    readyForPioneers: status.configured && status.required ? caseCount >= 0 : status.configured,
    sampleCaseCount: caseCount,
    message: status.configured
      ? "Almacén Vercel Blob activo. Los casos humanos se guardan con verificación."
      : status.required
        ? "CRÍTICO: configurar BLOB_READ_WRITE_TOKEN en Vercel antes de pioneros."
        : "Desarrollo local: casos en JSONL (configurar Blob para producción).",
  });
}
