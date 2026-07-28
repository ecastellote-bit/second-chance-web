export function formatRelativeConversationDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDiff === 0) return "Hoy";
  if (dayDiff === 1) return "Ayer";
  if (dayDiff > 1 && dayDiff < 7) return `Hace ${dayDiff} días`;

  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export function formatMessageBubbleTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const time = date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const relative = formatRelativeConversationDate(iso);
  if (relative === "Hoy") return time;
  if (relative === "Ayer") return `${time} · Ayer`;
  if (relative.startsWith("Hace")) return `${time} · ${relative}`;

  return `${time} · ${relative}`;
}
