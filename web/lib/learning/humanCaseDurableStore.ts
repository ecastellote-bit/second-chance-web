import { list, put, get } from "@vercel/blob";
import type {
  HumanCompleteCaseRecord,
  HumanLearningExtractRecord,
} from "./humanCaseDepot";

export const HUMAN_CASE_BLOB_VERSION = 1;
const BLOB_PREFIX = "human-cases";

const VERIFY_DELAYS_MS = [0, 300, 1000, 2500];

export type HumanCaseBlobBundle = {
  version: typeof HUMAN_CASE_BLOB_VERSION;
  archiveId: string;
  storedAt: string;
  complete: HumanCompleteCaseRecord;
  extract: HumanLearningExtractRecord;
};

export type DurableStoreStatus = {
  configured: boolean;
  required: boolean;
  storage: "vercel_blob" | "unavailable";
};

export type VerificationStatus = "verified" | "pending";

export type PutHumanCaseBundleResult = {
  archiveId: string;
  pathname: string;
  url: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
};

export function getDurableStoreStatus(): DurableStoreStatus {
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  const required =
    process.env.VERCEL === "1" ||
    process.env.VOCATIONUP_REQUIRE_DURABLE_CASES === "1";
  return {
    configured,
    required,
    storage: configured ? "vercel_blob" : "unavailable",
  };
}

function blobPath(archiveId: string): string {
  return `${BLOB_PREFIX}/${archiveId}.json`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyBlobReadable(pathname: string): Promise<boolean> {
  for (const delayMs of VERIFY_DELAYS_MS) {
    if (delayMs > 0) await sleep(delayMs);
    try {
      const result = await get(pathname, { access: "private" });
      if (result && result.statusCode === 200 && result.blob.size > 0) {
        return true;
      }
    } catch {
      // retry
    }
  }
  return false;
}

export class HumanCaseDurableStoreError extends Error {
  code: "not_configured" | "write_failed" | "read_failed";

  constructor(
    code: HumanCaseDurableStoreError["code"],
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = "HumanCaseDurableStoreError";
  }
}

/** Escritura durable obligatoria en Vercel cuando hay token. */
export async function putHumanCaseBundle(params: {
  complete: HumanCompleteCaseRecord;
  extract: HumanLearningExtractRecord;
}): Promise<PutHumanCaseBundleResult> {
  const status = getDurableStoreStatus();

  if (!status.configured) {
    if (status.required) {
      throw new HumanCaseDurableStoreError(
        "not_configured",
        "BLOB_READ_WRITE_TOKEN no está configurado. Los casos humanos no pueden guardarse en producción.",
      );
    }
    throw new HumanCaseDurableStoreError(
      "not_configured",
      "Almacén durable no configurado (solo desarrollo local con JSONL).",
    );
  }

  const archiveId = params.complete.archiveId;
  const bundle: HumanCaseBlobBundle = {
    version: HUMAN_CASE_BLOB_VERSION,
    archiveId,
    storedAt: new Date().toISOString(),
    complete: params.complete,
    extract: params.extract,
  };

  const pathname = blobPath(archiveId);

  let written;
  try {
    written = await put(pathname, JSON.stringify(bundle), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (error) {
    throw new HumanCaseDurableStoreError(
      "write_failed",
      error instanceof Error ? error.message : "Error al escribir en Vercel Blob",
    );
  }

  const verified = await verifyBlobReadable(pathname);

  return {
    archiveId,
    pathname,
    url: written.url,
    verified,
    verificationStatus: verified ? "verified" : "pending",
  };
}

export async function getHumanCaseBundle(
  archiveId: string,
): Promise<HumanCaseBlobBundle | null> {
  const status = getDurableStoreStatus();
  if (!status.configured) return null;

  const pathname = blobPath(archiveId);

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as HumanCaseBlobBundle;
  } catch {
    return null;
  }
}

export type HumanCaseListItem = {
  archiveId: string;
  storedAt: string;
  reviewStatus: string;
  displayedMainDirection: string | null;
  source: string;
  pathname: string;
};

export async function listHumanCaseBundles(limit = 100): Promise<HumanCaseListItem[]> {
  const status = getDurableStoreStatus();
  if (!status.configured) return [];

  const { blobs } = await list({
    prefix: `${BLOB_PREFIX}/`,
    limit: Math.min(limit, 1000),
  });

  const items: HumanCaseListItem[] = [];

  for (const blob of blobs) {
    const match = blob.pathname.match(/human-cases\/(.+)\.json$/);
    if (!match) continue;

    try {
      const result = await get(blob.pathname, { access: "private" });
      if (!result || result.statusCode !== 200 || !result.stream) continue;
      const raw = await new Response(result.stream).text();
      const bundle = JSON.parse(raw) as HumanCaseBlobBundle;
      items.push({
        archiveId: bundle.archiveId,
        storedAt: bundle.storedAt,
        reviewStatus: bundle.complete.storagePolicy.reviewStatus,
        displayedMainDirection:
          bundle.complete.classification.displayedMainDirection,
        source: bundle.complete.source,
        pathname: blob.pathname,
      });
    } catch {
      items.push({
        archiveId: match[1],
        storedAt: blob.uploadedAt.toISOString(),
        reviewStatus: "unknown",
        displayedMainDirection: null,
        source: "unknown",
        pathname: blob.pathname,
      });
    }
  }

  return items.sort(
    (a, b) => new Date(b.storedAt).getTime() - new Date(a.storedAt).getTime(),
  );
}

/** Marca en Blob que el usuario pidió revisión humana explícita. */
export async function markHumanCaseReviewRequested(
  archiveId: string,
  note?: string,
): Promise<boolean> {
  const bundle = await getHumanCaseBundle(archiveId);
  if (!bundle) return false;

  const prior = bundle.complete.payload.humanReview as
    | Record<string, unknown>
    | undefined;

  bundle.complete.storagePolicy.reviewStatus = "pending_human_review";
  bundle.complete.payload.humanReview = {
    expectedPrimaryFamily: String(prior?.expectedPrimaryFamily ?? ""),
    acceptableFamilies: Array.isArray(prior?.acceptableFamilies)
      ? (prior?.acceptableFamilies as string[])
      : [],
    rivalFamilies: Array.isArray(prior?.rivalFamilies)
      ? (prior?.rivalFamilies as string[])
      : [],
    verdict: "pending_human_review",
    correctionNote:
      note?.trim() ||
      String(prior?.correctionNote ?? "") ||
      "Usuario solicitó revisión humana al finalizar el diagnóstico.",
    shouldBecomeLearnedCase: prior?.shouldBecomeLearnedCase === true,
    userRequestedAt: new Date().toISOString(),
  };

  await putHumanCaseBundle({
    complete: bundle.complete,
    extract: bundle.extract,
  });

  return true;
}
