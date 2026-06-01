export type PublicAuthorIdentity = {
  publicName: string;
  initials: string;
};

function normalizeSpaces(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

function safeUpperChar(input: string): string {
  return (input.trim()[0] ?? "").toLocaleUpperCase();
}

function isEmailLike(input: string): boolean {
  const s = input.trim();
  return Boolean(s && s.includes("@") && s.includes("."));
}

function buildFromParts(parts: string[]): PublicAuthorIdentity {
  const cleaned = parts.map(normalizeSpaces).filter(Boolean);
  if (cleaned.length === 0) {
    return { publicName: "Integrante fundador", initials: "IF" };
  }

  if (cleaned.length === 1) {
    const first = cleaned[0];
    const initial = safeUpperChar(first);
    return {
      publicName: first,
      initials: initial || "IF",
    };
  }

  const first = cleaned[0];
  const last = cleaned[cleaned.length - 1];
  const lastInitial = safeUpperChar(last);
  const initials = `${safeUpperChar(first)}${lastInitial}`.trim() || "IF";
  return {
    publicName: `${first} ${lastInitial}.`,
    initials,
  };
}

export function toPublicAuthorIdentity(input?: {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  nickname?: string | null;
  displayName?: string | null;
  email?: string | null;
}): PublicAuthorIdentity {
  const nickname = normalizeSpaces(String(input?.nickname ?? ""));
  const displayName = normalizeSpaces(String(input?.displayName ?? ""));
  const fullName = normalizeSpaces(String(input?.fullName ?? ""));
  const firstName = normalizeSpaces(String(input?.firstName ?? ""));
  const lastName = normalizeSpaces(String(input?.lastName ?? ""));

  const prefer =
    (nickname && !isEmailLike(nickname) ? nickname : "") ||
    (displayName && !isEmailLike(displayName) ? displayName : "") ||
    (fullName && !isEmailLike(fullName) ? fullName : "");

  if (prefer) {
    const parts = prefer.split(/\s+/).filter(Boolean);
    return buildFromParts(parts);
  }

  if (firstName && !isEmailLike(firstName)) {
    if (lastName && !isEmailLike(lastName)) return buildFromParts([firstName, lastName]);
    return buildFromParts([firstName]);
  }

  return { publicName: "Integrante fundador", initials: "IF" };
}

