const MAX_PAYLOAD_KEYS = 12;
const MAX_STRING_LEN = 200;
const MAX_SESSION_ID_LEN = 64;

const BLOCKED_KEY = /email|userid|user_id|name|narrative|password|archiveid|archive_id|ip/i;

export function sanitizeObservatorySessionId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, MAX_SESSION_ID_LEN);
  return trimmed || undefined;
}

export function sanitizeObservatoryPayload(
  payload: unknown,
): Record<string, string | number | boolean | null> | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }

  const out: Record<string, string | number | boolean | null> = {};
  let count = 0;

  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (count >= MAX_PAYLOAD_KEYS) break;
    if (typeof key !== "string" || key.length === 0 || key.length > 40) continue;
    if (BLOCKED_KEY.test(key)) continue;

    if (value === null) {
      out[key] = null;
      count += 1;
      continue;
    }
    if (typeof value === "boolean") {
      out[key] = value;
      count += 1;
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
      count += 1;
      continue;
    }
    if (typeof value === "string") {
      out[key] = value.trim().slice(0, MAX_STRING_LEN);
      count += 1;
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}
