import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import { sanitizeCommunityPlainText } from "@/lib/community/sanitizeCommunityText";

export type FounderProjectGuidedContributionKind =
  | "valuable_part"
  | "first_step"
  | "risk"
  | "possible_contribution"
  | "similar_reference";

export type FounderProjectGuidedContributionStatus =
  | "pending_review"
  | "visible"
  | "hidden"
  | "flagged"
  | "archived";

export type FounderProjectGuidedContribution = {
  recordType: "founder_project_guided_contribution";
  contributionId: string;
  projectId: string;
  projectTitle: string;
  actorUserId: string;
  kind: FounderProjectGuidedContributionKind;
  text: string;
  status: FounderProjectGuidedContributionStatus;
  createdAt: string;
  updatedAt?: string;
};

export type GuidedContributionStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export class GuidedContributionStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: GuidedContributionStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "GuidedContributionStoreError";
    this.code = code;
  }
}

const BLOB_PREFIX = "founder-project-guided-contributions";
const VALID_KINDS = new Set<FounderProjectGuidedContributionKind>([
  "valuable_part",
  "first_step",
  "risk",
  "possible_contribution",
  "similar_reference",
]);

function localPath(): string {
  return path.join(process.cwd(), "data", "founder-project-guided-contributions.jsonl");
}

function blobPath(contributionId: string): string {
  return `${BLOB_PREFIX}/${contributionId}.json`;
}

function assertDurableStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`founder_project_guided_contributions:${operation}`);
  } catch {
    throw new GuidedContributionStoreError(
      "blob_not_configured",
      `blob_not_configured:founder_project_guided_contributions:${operation}`,
    );
  }
}

export function getGuidedContributionStoreMeta(): GuidedContributionStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function normalize(
  raw: FounderProjectGuidedContribution,
): FounderProjectGuidedContribution {
  const status =
    raw.status === "visible" ||
    raw.status === "hidden" ||
    raw.status === "flagged" ||
    raw.status === "archived"
      ? raw.status
      : "pending_review";
  const kind = VALID_KINDS.has(raw.kind) ? raw.kind : "valuable_part";
  return {
    ...raw,
    recordType: "founder_project_guided_contribution",
    kind,
    status,
    text: sanitizeCommunityPlainText(raw.text ?? ""),
  };
}

function parse(raw: string): FounderProjectGuidedContribution | null {
  try {
    const parsed = JSON.parse(raw) as FounderProjectGuidedContribution;
    if (!parsed?.contributionId || !parsed?.projectId || !parsed?.actorUserId) return null;
    if (
      parsed.recordType &&
      parsed.recordType !== "founder_project_guided_contribution"
    ) {
      return null;
    }
    return normalize(parsed);
  } catch {
    return null;
  }
}

async function readFromBlob(pathname: string): Promise<FounderProjectGuidedContribution | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return parse(text);
  } catch {
    return null;
  }
}

async function writeToBlob(record: FounderProjectGuidedContribution): Promise<void> {
  await put(blobPath(record.contributionId), JSON.stringify(normalize(record)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function listFromBlob(): Promise<FounderProjectGuidedContribution[]> {
  const items: FounderProjectGuidedContribution[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const match = blob.pathname.match(/founder-project-guided-contributions\/(.+)\.json$/);
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

async function readAllLocal(): Promise<FounderProjectGuidedContribution[]> {
  const filePath = localPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, FounderProjectGuidedContribution>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parse(line);
      if (parsed) byId.set(parsed.contributionId, parsed);
    }
    return [...byId.values()].sort((a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
    );
  } catch {
    return [];
  }
}

async function writeToLocal(record: FounderProjectGuidedContribution): Promise<void> {
  const filePath = localPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readAllLocal();
  const next = existing.filter((item) => item.contributionId !== record.contributionId);
  next.push(normalize(record));
  const body = next.map((item) => JSON.stringify(item)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

export async function listFounderProjectGuidedContributions(options?: {
  projectId?: string;
  actorUserId?: string;
  kind?: FounderProjectGuidedContributionKind;
  status?: FounderProjectGuidedContributionStatus | FounderProjectGuidedContributionStatus[];
  limit?: number;
}): Promise<FounderProjectGuidedContribution[]> {
  assertDurableStore("list");
  const all = isVercelBlobConfigured() ? await listFromBlob() : await readAllLocal();
  const limit = Math.min(options?.limit ?? 300, 2000);
  const statuses = options?.status
    ? Array.isArray(options.status)
      ? options.status
      : [options.status]
    : null;

  return all
    .filter((item) => (options?.projectId ? item.projectId === options.projectId : true))
    .filter((item) => (options?.actorUserId ? item.actorUserId === options.actorUserId : true))
    .filter((item) => (options?.kind ? item.kind === options.kind : true))
    .filter((item) => (statuses ? statuses.includes(item.status) : true))
    .slice(0, limit);
}

export async function createFounderProjectGuidedContribution(input: {
  projectId: string;
  projectTitle: string;
  actorUserId: string;
  kind: FounderProjectGuidedContributionKind;
  text: string;
}): Promise<FounderProjectGuidedContribution> {
  assertDurableStore("create");
  if (!VALID_KINDS.has(input.kind)) {
    throw new Error("invalid_contribution_kind");
  }

  const text = sanitizeCommunityPlainText(input.text);
  if (text.length < 20) {
    throw new Error("contribution_text_too_short");
  }

  const now = new Date().toISOString();
  const record: FounderProjectGuidedContribution = {
    recordType: "founder_project_guided_contribution",
    contributionId: `gcontrib_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    projectId: input.projectId.trim(),
    projectTitle: input.projectTitle.trim(),
    actorUserId: input.actorUserId.trim(),
    kind: input.kind,
    text,
    status: "pending_review",
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

export async function updateFounderProjectGuidedContributionStatus(
  contributionId: string,
  status: FounderProjectGuidedContributionStatus,
): Promise<FounderProjectGuidedContribution | null> {
  assertDurableStore("update_status");
  const all = await listFounderProjectGuidedContributions({ limit: 5000 });
  const existing = all.find((item) => item.contributionId === contributionId);
  if (!existing) return null;

  const updated: FounderProjectGuidedContribution = {
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
