import type { TelemetryPropertyValue } from "./types";

export const TELEMETRY_MAX_BODY_BYTES = 4096;
export const TELEMETRY_MAX_PROPERTIES_KEYS = 16;
export const TELEMETRY_MAX_STRING_LEN = 120;
export const TELEMETRY_MAX_PATH_LEN = 160;
export const TELEMETRY_MAX_ID_LEN = 64;

const REDACTED = "[redacted]";

const BLOCKED_KEYS = new Set([
  "email",
  "name",
  "fullname",
  "full_name",
  "phone",
  "message",
  "text",
  "freetext",
  "free_text",
  "narrative",
  "userinput",
  "user_input",
  "diagnosis",
  "result",
  "summary",
  "payload",
  "password",
  "archiveid",
  "archive_id",
  "userid",
  "user_id",
  "ip",
  "address",
  "body",
  "content",
  "description",
  "note",
  "notes",
  "comment",
  "comments",
]);

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/-/g, "_");
}

function scrubString(value: string, maxLen = TELEMETRY_MAX_STRING_LEN): string {
  const trimmed = value.trim().slice(0, maxLen);
  if (!trimmed) return "";
  if (EMAIL_RE.test(trimmed)) {
    EMAIL_RE.lastIndex = 0;
    return REDACTED;
  }
  EMAIL_RE.lastIndex = 0;
  return trimmed;
}

export function sanitizeTelemetryId(value: unknown, maxLen = TELEMETRY_MAX_ID_LEN): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

export function sanitizeTelemetryPath(value: unknown): string {
  if (typeof value !== "string") return "/";
  const trimmed = value.trim().slice(0, TELEMETRY_MAX_PATH_LEN);
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function sanitizeTelemetryProperties(
  properties: unknown,
): Record<string, TelemetryPropertyValue> {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    return {};
  }

  const out: Record<string, TelemetryPropertyValue> = {};
  let count = 0;

  for (const [rawKey, value] of Object.entries(properties as Record<string, unknown>)) {
    if (count >= TELEMETRY_MAX_PROPERTIES_KEYS) break;
    if (typeof rawKey !== "string" || rawKey.length === 0 || rawKey.length > 40) continue;

    const key = normalizeKey(rawKey);
    if (BLOCKED_KEYS.has(key)) {
      out[rawKey.slice(0, 40)] = REDACTED;
      count += 1;
      continue;
    }

    if (value === null) {
      out[rawKey.slice(0, 40)] = null;
      count += 1;
      continue;
    }
    if (typeof value === "boolean") {
      out[rawKey.slice(0, 40)] = value;
      count += 1;
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      out[rawKey.slice(0, 40)] = value;
      count += 1;
      continue;
    }
    if (typeof value === "string") {
      const safe = scrubString(value);
      if (safe) {
        out[rawKey.slice(0, 40)] = safe;
        count += 1;
      }
    }
  }

  return out;
}

export function sanitizeTelemetryReferrer(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 200);
  if (!trimmed) return null;
  if (EMAIL_RE.test(trimmed)) return null;
  EMAIL_RE.lastIndex = 0;
  return trimmed;
}

export function sanitizeTelemetryUtm(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 80);
  return trimmed || null;
}
