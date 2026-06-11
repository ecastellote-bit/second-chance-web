/** Fetch con cookie de admin (tras autenticación en /admin o ?vu_admin_key=). */
export function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}

/** Admin fetch con timeout — evita spinners eternos en paneles operativos. */
export async function adminFetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const { timeoutMs = 8000, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await adminFetch(input, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
