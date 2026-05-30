import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { CIRCULOS_CATALOG } from "@/lib/content/circulosCatalog";
import { sanitizeCommunityPlainText } from "@/lib/community/sanitizeCommunityText";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import { readFounderProjectSeed } from "./founderProjectSeeds";

export type CommunityAdminPostTargetType =
  | "founder_project"
  | "circle"
  | "general_barrio";

export type CommunityAdminPostKind =
  | "update"
  | "call_for_interest"
  | "question"
  | "next_step"
  | "need"
  | "announcement";

export type CommunityAdminPostStatus = "draft" | "published" | "hidden" | "archived";

export type CommunityAdminPost = {
  recordType: "community_admin_post";
  postId: string;
  targetType: CommunityAdminPostTargetType;
  targetId: string;
  targetTitle: string;
  kind: CommunityAdminPostKind;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaSignalType?: string;
  status: CommunityAdminPostStatus;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

export type CommunityAdminPostStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export class CommunityAdminPostStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: CommunityAdminPostStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "CommunityAdminPostStoreError";
    this.code = code;
  }
}

const BLOB_PREFIX = "community-admin-posts";
const VALID_TARGETS = new Set<CommunityAdminPostTargetType>([
  "founder_project",
  "circle",
  "general_barrio",
]);
const VALID_KINDS = new Set<CommunityAdminPostKind>([
  "update",
  "call_for_interest",
  "question",
  "next_step",
  "need",
  "announcement",
]);

function localPath(): string {
  return path.join(process.cwd(), "data", "community-admin-posts.jsonl");
}

function blobPath(postId: string): string {
  return `${BLOB_PREFIX}/${postId}.json`;
}

function assertStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`community_admin_posts:${operation}`);
  } catch {
    throw new CommunityAdminPostStoreError(
      "blob_not_configured",
      `blob_not_configured:community_admin_posts:${operation}`,
    );
  }
}

export function getCommunityAdminPostStoreMeta(): CommunityAdminPostStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function normalize(raw: CommunityAdminPost): CommunityAdminPost {
  const status =
    raw.status === "published" ||
    raw.status === "hidden" ||
    raw.status === "archived"
      ? raw.status
      : "draft";
  const targetType = VALID_TARGETS.has(raw.targetType) ? raw.targetType : "general_barrio";
  const kind = VALID_KINDS.has(raw.kind) ? raw.kind : "update";
  return {
    ...raw,
    recordType: "community_admin_post",
    targetType,
    kind,
    status,
    title: sanitizeCommunityPlainText(raw.title ?? "", 120),
    body: sanitizeCommunityPlainText(raw.body ?? "", 1200),
    ctaLabel: raw.ctaLabel?.trim() || undefined,
    ctaSignalType: raw.ctaSignalType?.trim() || undefined,
    publishedAt: raw.publishedAt ?? null,
  };
}

function parse(raw: string): CommunityAdminPost | null {
  try {
    const parsed = JSON.parse(raw) as CommunityAdminPost;
    if (!parsed?.postId || !parsed?.targetId) return null;
    if (parsed.recordType && parsed.recordType !== "community_admin_post") return null;
    return normalize(parsed);
  } catch {
    return null;
  }
}

async function readFromBlob(pathname: string): Promise<CommunityAdminPost | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return parse(await new Response(result.stream).text());
  } catch {
    return null;
  }
}

async function writeToBlob(record: CommunityAdminPost): Promise<void> {
  await put(blobPath(record.postId), JSON.stringify(normalize(record)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function listFromBlob(): Promise<CommunityAdminPost[]> {
  const items: CommunityAdminPost[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const match = blob.pathname.match(/community-admin-posts\/(.+)\.json$/);
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

async function readAllLocal(): Promise<CommunityAdminPost[]> {
  const filePath = localPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, CommunityAdminPost>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parse(line);
      if (parsed) byId.set(parsed.postId, parsed);
    }
    return [...byId.values()].sort((a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
    );
  } catch {
    return [];
  }
}

async function writeToLocal(record: CommunityAdminPost): Promise<void> {
  const filePath = localPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readAllLocal();
  const next = existing.filter((item) => item.postId !== record.postId);
  next.push(normalize(record));
  const body = next.map((item) => JSON.stringify(item)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

export async function assertAdminPostTargetExists(input: {
  targetType: CommunityAdminPostTargetType;
  targetId: string;
}): Promise<{ targetTitle: string } | null> {
  const targetId = input.targetId.trim();
  if (!targetId) return null;

  if (input.targetType === "general_barrio") {
    return { targetTitle: "Barrio VocationUp" };
  }

  if (input.targetType === "founder_project") {
    const seed = await readFounderProjectSeed(targetId);
    if (!seed || seed.status !== "published") return null;
    return { targetTitle: seed.title };
  }

  if (input.targetType === "circle") {
    const circle = CIRCULOS_CATALOG.find((c) => c.id === targetId);
    if (!circle) return null;
    return { targetTitle: circle.title };
  }

  return null;
}

export async function listCommunityAdminPosts(options?: {
  targetType?: CommunityAdminPostTargetType;
  targetId?: string;
  status?: CommunityAdminPostStatus | CommunityAdminPostStatus[];
  limit?: number;
}): Promise<CommunityAdminPost[]> {
  assertStore("list");
  const all = isVercelBlobConfigured() ? await listFromBlob() : await readAllLocal();
  const limit = Math.min(options?.limit ?? 200, 2000);
  const statuses = options?.status
    ? Array.isArray(options.status)
      ? options.status
      : [options.status]
    : null;

  return all
    .filter((item) => (options?.targetType ? item.targetType === options.targetType : true))
    .filter((item) => (options?.targetId ? item.targetId === options.targetId : true))
    .filter((item) => (statuses ? statuses.includes(item.status) : true))
    .slice(0, limit);
}

export async function createCommunityAdminPost(input: {
  targetType: CommunityAdminPostTargetType;
  targetId: string;
  kind: CommunityAdminPostKind;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaSignalType?: string;
  status?: CommunityAdminPostStatus;
}): Promise<CommunityAdminPost> {
  assertStore("create");

  const title = sanitizeCommunityPlainText(input.title, 120);
  const body = sanitizeCommunityPlainText(input.body, 1200);
  if (title.length < 5 || body.length < 20) {
    throw new Error("admin_post_validation_failed");
  }

  const target = await assertAdminPostTargetExists({
    targetType: input.targetType,
    targetId: input.targetId,
  });
  if (!target) throw new Error("admin_post_target_invalid");

  const status = input.status ?? "draft";
  if (status === "published" && input.targetType === "founder_project") {
    const seed = await readFounderProjectSeed(input.targetId);
    if (!seed || seed.status !== "published") throw new Error("admin_post_target_invalid");
  }

  const now = new Date().toISOString();
  const record: CommunityAdminPost = {
    recordType: "community_admin_post",
    postId: `apost_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    targetType: input.targetType,
    targetId: input.targetId.trim(),
    targetTitle: target.targetTitle,
    kind: input.kind,
    title,
    body,
    ctaLabel: input.ctaLabel?.trim() || undefined,
    ctaSignalType: input.ctaSignalType?.trim() || undefined,
    status,
    createdAt: now,
    updatedAt: now,
    publishedAt: status === "published" ? now : null,
  };

  if (isVercelBlobConfigured()) {
    await writeToBlob(record);
  } else {
    await writeToLocal(record);
  }
  return record;
}

export async function updateCommunityAdminPost(
  postId: string,
  patch: Partial<
    Pick<
      CommunityAdminPost,
      "title" | "body" | "kind" | "ctaLabel" | "ctaSignalType" | "status" | "targetTitle"
    >
  >,
): Promise<CommunityAdminPost | null> {
  assertStore("update");
  const all = await listCommunityAdminPosts({ limit: 5000 });
  const existing = all.find((item) => item.postId === postId);
  if (!existing) return null;

  let nextStatus = patch.status ?? existing.status;
  if (nextStatus === "published") {
    const target = await assertAdminPostTargetExists({
      targetType: existing.targetType,
      targetId: existing.targetId,
    });
    if (!target) throw new Error("admin_post_target_invalid");
  }

  const now = new Date().toISOString();
  const title =
    patch.title !== undefined
      ? sanitizeCommunityPlainText(patch.title, 120)
      : existing.title;
  const body =
    patch.body !== undefined ? sanitizeCommunityPlainText(patch.body, 1200) : existing.body;

  if (title.length < 5 || body.length < 20) {
    throw new Error("admin_post_validation_failed");
  }

  const updated: CommunityAdminPost = {
    ...existing,
    ...patch,
    title,
    body,
    status: nextStatus,
    updatedAt: now,
    publishedAt:
      nextStatus === "published"
        ? existing.publishedAt ?? now
        : nextStatus === "draft"
          ? null
          : existing.publishedAt,
  };

  if (isVercelBlobConfigured()) {
    await writeToBlob(updated);
  } else {
    await writeToLocal(updated);
  }
  return updated;
}
