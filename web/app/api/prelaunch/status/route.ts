import { NextResponse } from "next/server";
import { getDurableStoreStatus } from "@/lib/learning/humanCaseDurableStore";
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";

export async function GET() {
  const durable = getDurableStoreStatus();
  const cohortBatch = getFoundationalCohortBatch();

  const checks = [
    {
      id: "openai",
      label: "OPENAI_API_KEY",
      ok: Boolean(process.env.OPENAI_API_KEY?.trim()),
      hint: "Requerido para diagnóstico en producción",
    },
    {
      id: "blob",
      label: "BLOB_READ_WRITE_TOKEN",
      ok: durable.configured,
      hint: durable.configured
        ? "Almacén durable activo"
        : "Crítico en Vercel antes de pioneros",
    },
    {
      id: "cohort",
      label: "Cohort batch",
      ok: Boolean(cohortBatch),
      value: cohortBatch,
      hint: "Etiqueta en casos fundacionales (clientMeta)",
    },
    {
      id: "preview_key",
      label: "NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY",
      ok: Boolean(process.env.NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY?.trim()),
      hint: "Solo local: modo exploración barrio para fundador",
    },
  ];

  const readyForPioneers = checks.find((c) => c.id === "blob")?.ok === true;

  return NextResponse.json({
    ok: true,
    readyForPioneers,
    durable,
    checks,
    vercel: process.env.VERCEL === "1",
  });
}
