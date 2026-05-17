/**
 * Importa un caso humano exportado al depósito dual (completo + extracto).
 * Uso: node scripts/import-human-case.mjs data/learning/imports/estefi-2026-05-17.json
 */
import { readFile, mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");

async function loadDepotModule() {
  // Ejecutar vía ts en dev; para script usamos append directo compatible con humanCaseDepot
  return {
    learningDir: path.join(webRoot, "data", "learning"),
  };
}

function buildHash(input) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 20);
}

async function appendIfNew(filePath, idField, idValue, record) {
  try {
    const existing = await readFile(filePath, "utf8");
    if (existing.includes(`"${idField}":"${idValue}"`)) {
      return { appended: false, reason: "duplicate" };
    }
  } catch {
    // missing
  }
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return { appended: true };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Uso: node scripts/import-human-case.mjs <ruta-al-json>");
    process.exit(1);
  }

  const absPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(webRoot, inputPath);

  const raw = JSON.parse(await readFile(absPath, "utf8"));
  const forceArchiveId =
    raw.forceArchiveId ?? raw.archiveId ?? `import_${buildHash(raw).slice(0, 12)}`;

  const payload = {
    archiveVersion: "human_case_depot_v1",
    createdAt: raw.exportedAt ?? raw.createdAt ?? new Date().toISOString(),
    source: raw.source ?? "manual_human_import_v1",
    sourceInput: raw.sourceInput ?? { fullAnswersContext: raw.fullAnswersContext },
    currentResult: raw.currentResult,
    humanReview: raw.humanReview ?? {
      verdict: "pending_human_review",
      expectedPrimaryFamily: "",
      acceptableFamilies: [],
      rivalFamilies: [],
      correctionNote: "",
      shouldBecomeLearnedCase: false,
    },
  };

  const res = await fetch("http://localhost:3000/api/human-cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, forceArchiveId }),
  }).catch(() => null);

  if (res?.ok) {
    const data = await res.json();
    console.log("Importado vía API local:", data);
    return;
  }

  console.log("API local no disponible; escribiendo JSONL directo…");
  const { learningDir } = await loadDepotModule();
  await mkdir(learningDir, { recursive: true });

  const completePath = path.join(learningDir, "human-cases-complete.jsonl");
  const extractPath = path.join(learningDir, "human-learning-extracts.jsonl");

  const completeRecord = {
    recordType: "human_complete_case",
    archiveId: forceArchiveId,
    archiveVersion: "human_case_depot_v1",
    createdAt: payload.createdAt,
    source: payload.source,
    storagePolicy: {
      depot: "human_cases_complete",
      shouldStoreComplete: true,
      shouldStoreLearningExtract: true,
      shouldInfluenceFutureDiagnosis: false,
      influenceWeight: 0,
      searchWeight: 0.7,
      reviewStatus: payload.humanReview?.verdict ?? "pending_human_review",
    },
    classification: {
      resultType: raw.currentResult?.resultType ?? null,
      primaryFamily: raw.currentResult?.corePattern ?? null,
      displayedMainDirection: raw.currentResult?.displayedMainDirection ?? null,
      frontierFamilies: [],
      conflictDetected: true,
      humanReviewSuggested: true,
      compressionSignalsDetected: true,
      learningTier: "pending_human_calibration",
    },
    payload,
  };

  const extractRecord = {
    recordType: "human_learning_extract",
    extractId: `${forceArchiveId}_extract`,
    archiveId: forceArchiveId,
    createdAt: payload.createdAt,
    source: payload.source,
    reviewStatus: payload.humanReview?.verdict ?? "pending_human_review",
    displayedMainDirection: raw.currentResult?.displayedMainDirection ?? null,
    resultType: raw.currentResult?.resultType ?? null,
    primaryFamily: raw.currentResult?.corePattern ?? null,
    frontierFamilies: [],
    humanVerdict: payload.humanReview,
    lessonDraft: payload.humanReview?.correctionNote ?? null,
    links: { completeCaseArchiveId: forceArchiveId },
    tags: ["manual_import", "misread_warning"],
  };

  const c = await appendIfNew(completePath, "archiveId", forceArchiveId, completeRecord);
  const e = await appendIfNew(extractPath, "extractId", extractRecord.extractId, extractRecord);

  console.log({ archiveId: forceArchiveId, complete: c, extract: e });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
