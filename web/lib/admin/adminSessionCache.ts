import type {
  ModerationInboxItem,
  UnifiedModerationDashboard,
} from "@/lib/admin/unifiedModeration/types";

const MAX_AGE_MS = 30 * 60 * 1000;

/** Evita persistir feedback libre o PII en sessionStorage del tablero admin. */
export function sanitizeDashboardForSessionCache(
  dashboard: UnifiedModerationDashboard,
): UnifiedModerationDashboard {
  const items = dashboard.items.map((item): ModerationInboxItem => {
    if (item.kind === "exit_feedback") {
      return {
        ...item,
        excerpt: "Feedback de salida — ver detalle en inbox.",
        meta: item.meta?.exitTrigger
          ? { exitTrigger: item.meta.exitTrigger }
          : undefined,
      };
    }
    if (item.kind === "human_review") {
      return item;
    }
    if (item.kind === "surface_interest") {
      const masked = item.excerpt.replace(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
        (email) => maskAdminEmail(email),
      );
      return { ...item, excerpt: masked, meta: item.meta?.surfaceType ? { surfaceType: item.meta.surfaceType } : undefined };
    }
    return item;
  });
  return { ...dashboard, items };
}

export function readAdminSessionCache<T>(key: string): { data: T; savedAt: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; savedAt: string };
    if (!parsed?.savedAt || parsed.data === undefined) return null;
    const age = Date.now() - new Date(parsed.savedAt).getTime();
    if (Number.isNaN(age) || age > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAdminSessionCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({ data, savedAt: new Date().toISOString() }),
    );
  } catch {
    // quota / private mode
  }
}

export function maskAdminEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "contacto registrado";
  const user = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const maskedUser =
    user.length <= 2 ? `${user[0] ?? "*"}*` : `${user[0]}***${user.slice(-1)}`;
  return `${maskedUser}@${domain}`;
}
