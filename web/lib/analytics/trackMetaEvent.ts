/**
 * Dispara un evento estándar de Meta Pixel (fbq track).
 * Seguro en SSR: no-op si no hay window o el pixel aún no cargó.
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  const fbq = (
    window as Window & {
      fbq?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
    }
  ).fbq;

  if (typeof fbq !== "function") return;

  if (params) {
    fbq("track", eventName, params);
  } else {
    fbq("track", eventName);
  }
}

/** Evita duplicar un evento en la misma sesión del navegador. */
export function trackMetaEventOnce(
  storageKey: string,
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  try {
    if (sessionStorage.getItem(storageKey) === "1") return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // sessionStorage puede fallar en modo privado; igual intentamos trackear.
  }

  trackMetaEvent(eventName, params);
}
