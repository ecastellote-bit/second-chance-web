import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import { sanitizeCommunityPlainText } from "@/lib/community/sanitizeCommunityText";

export type CommunityReportTargetType =
  | "founder_project"
  | "project_guided_contribution"
  | "circle"
  | "formation_opportunity";

export type CommunityReportReason =
  | "spam"
  | "abuse"
  | "misleading"
  | "privacy"
  | "other";

export type CommunityReportStatus = "new" | "reviewed" | "dismissed" | "action_taken";

export type CommunityReport = {
  recordType: "community_report";
  reportId: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  reporterUserId: string;
  reason: CommunityReportReason;
  details?: string;
  status: CommunityReportStatus;
  createdAt: string;
  updatedAt?: string;
};

export type CommunityReportStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export class CommunityReportStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: CommunityReportStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "CommunityReportStoreError";
    this.code = code;
  }
}

const BLOB_PREFIX = "community-reports";

const VALID_TARGETS = new Set<CommunityReportTargetType>([
  "founder_project",
  "project_guided_contribution",
  "circle",
  "formation_opportunity",
]);

const VALID_REASONS = new Set<CommunityReportReason>([
  "spam",
  "abuse",
  "misleading",
  "privacy",
  "other",
]);

function localPath(): string {
  return path.join(process.cwd(), "data", "community-reports.jsonl");
}

function blobPath(reportId: string): string {
  return `${BLOB_PREFIX}/${reportId}.json`;
}

function assertDurableStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`community_reports:${operation}`);
  } catch {
    throw new CommunityReportStoreError(
      "blob_not_configured",
      `blob_not_configured:community_reports:${operation}`,
    );
  }
}

export function getCommunityReportStoreMeta(): CommunityReportStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function normalize(raw: CommunityReport): CommunityReport {
  const status =
    raw.status === "reviewed" ||
    raw.status === "dismissed" ||
    raw.status === "action_taken"
      ? raw.status
      : "new";
  const targetType = VALID_TARGETS.has(raw.targetType) ? raw.targetType : "founder_project";
  const reason = VALID_REASONS.has(raw.reason) ? raw.reason : "other";
  const details =
    typeof raw.details === "string" && raw.details.trim()
      ? sanitizeCommunityPlainText(raw.details, 400)
      : undefined;
  return {
    ...raw,
    recordType: "community_report",
    targetType,
    reason,
    status,
    details,
  };
}

function parse(raw: string): CommunityReport | null {
  try {
    const parsed = JSON.parse(raw) as CommunityReport;
    if (!parsed?.reportId || !parsed?.targetId || !parsed?.reporterUserId) return null;
    if (parsed.recordType && parsed.recordType !== "community_report") return null;
    return normalize(parsed);
  } catch {
    return null;
  }
}

async function readFromBlob(pathname: string): Promise<CommunityReport | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return parse(await new Response(result.stream).text());
  } catch {
    return null;
  }
}

async function writeToBlob(record: CommunityReport): Promise<void> {
  await put(blobPath(record.reportId), JSON.stringify(normalize(record)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function listFromBlob(): Promise<CommunityReport[]> {
  const items: CommunityReport[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const match = blob.pathname.match(/community-reports\/(.+)\.json$/);
      if (!match?.[1]) continue;
      const item = await readFromBlob(blob.pathname);
      if (item) items.push(item);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return items.sort((a, b) =>
    (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
  );
}

async function readAllLocal(): Promise<CommunityReport[]> {
  const filePath = localPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, CommunityReport>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parse(line);
      if (parsed) byId.set(parsed.reportId, parsed);
    }
    return [...byId.values()].sort((a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
    );
  } catch {
    return [];
  }
}

async function writeToLocal(record: CommunityReport): Promise<void> {
  const filePath = localPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readAllLocal();
  const next = existing.filter((item) => item.reportId !== record.reportId);
  next.push(normalize(record));
  const body = next.map((item) => JSON.stringify(item)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

export async function listCommunityReports(options?: {
  targetType?: CommunityReportTargetType;
  targetId?: string;
  status?: CommunityReportStatus;
  limit?: number;
}): Promise<CommunityReport[]> {
  assertDurableStore("list");
  const all = isVercelBlobConfigured() ? await listFromBlob() : await readAllLocal();
  const limit = Math.min(options?.limit ?? 300, 2000);
  return all
    .filter((item) => (options?.targetType ? item.targetType === options.targetType : true))
    .filter((item) => (options?.targetId ? item.targetId === options.targetId : true))
    .filter((item) => (options?.status ? item.status === options.status : true))
    .slice(0, limit);
}

export async function createCommunityReport(input: {
  targetType: CommunityReportTargetType;
  targetId: string;
  reporterUserId: string;
  reason: CommunityReportReason;
  details?: string;
}): Promise<CommunityReport> {
  assertDurableStore("create");
  if (!VALID_TARGETS.has(input.targetType) || !VALID_REASONS.has(input.reason)) {
    throw new Error("invalid_report_payload");
  }

  const now = new Date().toISOString();
  const record: CommunityReport = {
    recordType: "community_report",
    reportId: `creport_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    targetType: input.targetType,
    targetId: input.targetId.trim(),
    reporterUserId: input.reporterUserId.trim(),
    reason: input.reason,
    details:
      input.details?.trim()
        ? sanitizeCommunityPlainText(input.details, 400)
        : undefined,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  if (isVercelBlobConfigured()) {
    await writeToBlob(record);
  } else {
    await writeToLocal(record);
  }
  return record;
}

export async function updateCommunityReportStatus(
  reportId: string,
  status: CommunityReportStatus,
): Promise<CommunityReport | null> {
  assertDurableStore("update_status");
  const all = await listCommunityReports({ limit: 5000 });
  const existing = all.find((item) => item.reportId === reportId);
  if (!existing) return null;

  const updated: CommunityReport = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };

  if (isVercelBlobConfigured()) {
    await writeToBlob(updated);
  } else {
    await writeToLocal(updated);
  }
  return updated;
}
