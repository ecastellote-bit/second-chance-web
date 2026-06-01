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
