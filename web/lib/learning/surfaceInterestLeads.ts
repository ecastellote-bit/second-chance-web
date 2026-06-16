import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { readBlobRecordsParallel } from "@/lib/storage/blobParallelRead";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import { SURFACE_INTEREST_TEXT_MAX } from "@/lib/community/surfaceInterestLimits";
import {
  normalizeUserInboxAdminStatus,
  type UserInboxAdminStatus,
} from "@/lib/admin/userInboxTypes";

export type { UserInboxAdminStatus as SurfaceInterestLeadStatus };

export type SurfaceIntentType =
  | "formacion"
  | "proyectos"
  | "circulos"
  | "eventos"
  | "conexiones"
  | "oportunidades";

export type SurfaceInterestLead = {
  recordType: "surface_interest_lead";
  leadId: string;
  surfaceType: SurfaceIntentType;
  text: string;
  textLength: number;
  email: string;
  sessionId?: string | null;
  path?: string | null;
  actionMode?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  status: UserInboxAdminStatus;
};

export type SurfaceInterestLeadStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export class SurfaceInterestLeadStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: SurfaceInterestLeadStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "SurfaceInterestLeadStoreError";
    this.code = code;
  }
}

const BLOB_PREFIX = "surface-interest-leads";

function localLeadsPath(): string {
  return path.join(process.cwd(), "data", "surface-interest-leads.jsonl");
}

function leadBlobPath(leadId: string): string {
  return `${BLOB_PREFIX}/${leadId}.json`;
}

function assertSurfaceInterestLeadDurableStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`surface_interest_leads:${operation}`);
  } catch {
    throw new SurfaceInterestLeadStoreError(
      "blob_not_configured",
      `blob_not_configured:surface_interest_leads:${operation}`,
    );
  }
}

export function getSurfaceInterestLeadStoreMeta(): SurfaceInterestLeadStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function normalizeLead(raw: SurfaceInterestLead): SurfaceInterestLead {
  return {
    ...raw,
    recordType: "surface_interest_lead",
    status: normalizeUserInboxAdminStatus(raw.status),
  };
}

function parseLead(raw: string): SurfaceInterestLead | null {
  try {
    const parsed = JSON.parse(raw) as SurfaceInterestLead;
    if (!parsed?.leadId || !parsed?.surfaceType || !parsed?.email) return null;
    if (parsed.recordType && parsed.recordType !== "surface_interest_lead") return null;
    return normalizeLead(parsed);
  } catch {
    return null;
  }
}

async function writeLeadToBlob(record: SurfaceInterestLead): Promise<void> {
  await put(leadBlobPath(record.leadId), JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function readLeadFromBlobPath(pathname: string): Promise<SurfaceInterestLead | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return parseLead(raw);
  } catch {
    return null;
  }
}

async function readAllLeadsFromLocal(): Promise<SurfaceInterestLead[]> {
  const filePath = localLeadsPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, SurfaceInterestLead>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parseLead(line);
      if (parsed) byId.set(parsed.leadId, parsed);
    }
    return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

async function writeLeadToLocal(record: SurfaceInterestLead): Promise<void> {
  const filePath = localLeadsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readAllLeadsFromLocal();
  const next = existing.filter((item) => item.leadId !== record.leadId);
  next.push(record);
  next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const body = next.map((item) => JSON.stringify(item)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

export async function createSurfaceInterestLead(input: {
  surfaceType: SurfaceIntentType;
  text: string;
  email: string;
  sessionId?: string | null;
  path?: string | null;
  actionMode?: string | null;
}): Promise<SurfaceInterestLead> {
  assertSurfaceInterestLeadDurableStore("create");

  const text = input.text.trim().slice(0, SURFACE_INTEREST_TEXT_MAX);
  const record: SurfaceInterestLead = {
    recordType: "surface_interest_lead",
    leadId: `sil_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    surfaceType: input.surfaceType,
    text,
    textLength: text.length,
    email: input.email,
    sessionId: input.sessionId ?? null,
    path: input.path ?? null,
    actionMode: input.actionMode ?? null,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  const meta = getSurfaceInterestLeadStoreMeta();
  if (meta.backend === "blob") {
    await writeLeadToBlob(record);
  } else {
    await writeLeadToLocal(record);
  }

  return record;
}

export async function listSurfaceInterestLeads(): Promise<SurfaceInterestLead[]> {
  const meta = getSurfaceInterestLeadStoreMeta();
  if (meta.backend === "blob") {
    const pathnames: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
      for (const blob of page.blobs) {
        if (/surface-interest-leads\/(.+)\.json$/.test(blob.pathname)) {
          pathnames.push(blob.pathname);
        }
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    const leads = await readBlobRecordsParallel(pathnames, readLeadFromBlobPath);
    return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return readAllLeadsFromLocal();
}

export async function updateSurfaceInterestLeadStatus(
  leadId: string,
  status: UserInboxAdminStatus,
): Promise<SurfaceInterestLead | null> {
  assertSurfaceInterestLeadDurableStore("update_status");
  const all = await listSurfaceInterestLeads();
  const existing = all.find((item) => item.leadId === leadId);
  if (!existing) return null;

  const updated: SurfaceInterestLead = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };

  const meta = getSurfaceInterestLeadStoreMeta();
  if (meta.backend === "blob") {
    await writeLeadToBlob(updated);
  } else {
    await writeLeadToLocal(updated);
  }
  return updated;
}
