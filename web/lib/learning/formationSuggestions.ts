import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";

export type FormationSuggestionStatus = "new" | "reviewed" | "archived";
export type FormationSuggestionSource = "formation_page" | "activation_path";

export type FormationSuggestion = {
  recordType: "formation_suggestion";
  suggestionId: string;
  userId: string;
  archiveId?: string | null;
  source: FormationSuggestionSource;
  text: string;
  createdAt: string;
  status: FormationSuggestionStatus;
  selectedThemeId?: string | null;
  activationPath?: string | null;
  userProfileId?: string | null;
  diagnosticArchiveId?: string | null;
};

export type FormationSuggestionStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export class FormationSuggestionStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: FormationSuggestionStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "FormationSuggestionStoreError";
    this.code = code;
  }
}

const BLOB_PREFIX = "formation-suggestions";

function localSuggestionsPath(): string {
  return path.join(process.cwd(), "data", "formation-suggestions.jsonl");
}

function suggestionBlobPath(suggestionId: string): string {
  return `${BLOB_PREFIX}/${suggestionId}.json`;
}

function assertFormationSuggestionDurableStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`formation_suggestions:${operation}`);
  } catch {
    throw new FormationSuggestionStoreError(
      "blob_not_configured",
      `blob_not_configured:formation_suggestions:${operation}`,
    );
  }
}

export function getFormationSuggestionStoreMeta(): FormationSuggestionStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function normalizeSuggestion(raw: FormationSuggestion): FormationSuggestion {
  return {
    ...raw,
    recordType: "formation_suggestion",
    status:
      raw.status === "reviewed" || raw.status === "archived" ? raw.status : "new",
  };
}

function parseSuggestion(raw: string): FormationSuggestion | null {
  try {
    const parsed = JSON.parse(raw) as FormationSuggestion;
    if (!parsed?.suggestionId || !parsed?.userId || !parsed?.text) return null;
    if (
      parsed.recordType &&
      parsed.recordType !== "formation_suggestion"
    ) {
      return null;
    }
    return normalizeSuggestion(parsed);
  } catch {
    return null;
  }
}

async function writeSuggestionToBlob(record: FormationSuggestion): Promise<void> {
  await put(suggestionBlobPath(record.suggestionId), JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function readSuggestionFromBlobPath(pathname: string): Promise<FormationSuggestion | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return parseSuggestion(raw);
  } catch {
    return null;
  }
}

async function listSuggestionsFromBlob(): Promise<FormationSuggestion[]> {
  const suggestions: FormationSuggestion[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const match = blob.pathname.match(/formation-suggestions\/(.+)\.json$/);
      if (!match?.[1]) continue;
      const suggestion = await readSuggestionFromBlobPath(blob.pathname);
      if (suggestion) suggestions.push(suggestion);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return suggestions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function readAllSuggestionsFromLocal(): Promise<FormationSuggestion[]> {
  const filePath = localSuggestionsPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, FormationSuggestion>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parseSuggestion(line);
      if (parsed) byId.set(parsed.suggestionId, parsed);
    }
    return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

async function writeSuggestionToLocal(record: FormationSuggestion): Promise<void> {
  const filePath = localSuggestionsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readAllSuggestionsFromLocal();
  const next = existing.filter((item) => item.suggestionId !== record.suggestionId);
  next.push(record);
  next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const body = next.map((item) => JSON.stringify(item)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

export async function createFormationSuggestion(input: {
  userId: string;
  archiveId?: string | null;
  source: FormationSuggestionSource;
  text: string;
  selectedThemeId?: string | null;
  activationPath?: string | null;
  userProfileId?: string | null;
  diagnosticArchiveId?: string | null;
}): Promise<FormationSuggestion> {
  assertFormationSuggestionDurableStore("create");

  const record: FormationSuggestion = {
    recordType: "formation_suggestion",
    suggestionId: `fs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId.trim(),
    archiveId: input.archiveId ?? null,
    source: input.source,
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
    status: "new",
    selectedThemeId: input.selectedThemeId ?? null,
    activationPath: input.activationPath ?? null,
    userProfileId: input.userProfileId ?? null,
    diagnosticArchiveId: input.diagnosticArchiveId ?? null,
  };

  if (isVercelBlobConfigured()) {
    await writeSuggestionToBlob(record);
    return record;
  }

  await writeSuggestionToLocal(record);
  return record;
}

export async function listFormationSuggestions(options?: {
  status?: FormationSuggestionStatus;
  userId?: string;
  limit?: number;
}): Promise<FormationSuggestion[]> {
  assertFormationSuggestionDurableStore("list");
  const all = isVercelBlobConfigured()
    ? await listSuggestionsFromBlob()
    : await readAllSuggestionsFromLocal();
  const limit = Math.min(options?.limit ?? 200, 2000);
  return all
    .filter((item) => (options?.status ? item.status === options.status : true))
    .filter((item) => (options?.userId ? item.userId === options.userId : true))
    .slice(0, limit);
}

export async function updateFormationSuggestionStatus(
  suggestionId: string,
  status: FormationSuggestionStatus,
): Promise<FormationSuggestion | null> {
  assertFormationSuggestionDurableStore("update_status");
  const all = await listFormationSuggestions({ limit: 4000 });
  const existing = all.find((item) => item.suggestionId === suggestionId);
  if (!existing) return null;
  const updated: FormationSuggestion = { ...existing, status };

  if (isVercelBlobConfigured()) {
    await writeSuggestionToBlob(updated);
  } else {
    await writeSuggestionToLocal(updated);
  }
  return updated;
}
