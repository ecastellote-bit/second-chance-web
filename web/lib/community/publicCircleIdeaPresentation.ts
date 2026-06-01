/**
 * Convierte textos crudos de señales de círculo en resúmenes aptos para vista pública.
 * Nunca expone solicitudes administrativas literales ni PII.
 */

const EMAIL_LIKE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_LIKE = /(\+?\d[\d\s().-]{7,}\d|whatsapp|telegram)/i;

const JOIN_REQUEST =
  /\b(agregar|agregame|agreguen|sumarme|unirme|incorporar|me pueden|pueden agregar|entrar al grupo)\b/i;
const ADMIN_CONTACT = /\b(admin|administrador|moderador)\b/i;
const MEETUP_PROPOSAL =
  /\b(presencial|primer encuentro|d[ií]a y hora|reuni[oó]n|quedada|villa crespo|caba)\b/i;
const LABOR_PROPOSAL =
  /\b(posiciones laborales|oportunidades laborales|empleo|trabajo|mayores de \d+)\b/i;

export const CURATED_CIRCLE_IDEA_LABEL =
  "Resúmenes curados del equipo — no son chats en vivo ni mensajes directos.";

function containsPiiRisk(text: string): boolean {
  return EMAIL_LIKE.test(text) || PHONE_LIKE.test(text);
}

function curatedSummaryFor(raw: string): string {
  const t = raw.trim();
  if (JOIN_REQUEST.test(t)) {
    return "Alguien dejó una señal para sumarse cuando el espacio avance.";
  }
  if (ADMIN_CONTACT.test(t)) {
    return "Una persona pidió acercarse a este círculo para coordinar el primer encuentro.";
  }
  if (MEETUP_PROPOSAL.test(t)) {
    return "Un integrante propuso organizar un primer encuentro presencial en el barrio.";
  }
  if (LABOR_PROPOSAL.test(t)) {
    return "Una persona sugirió sumar oportunidades laborales o de formación al círculo.";
  }
  if (t.length < 80) {
    return "Una idea nueva quedó registrada para revisión del equipo.";
  }
  return t;
}

function shouldCurateInsteadOfVerbatim(text: string): boolean {
  const t = text.trim();
  if (t.length < 80) return true;
  if (JOIN_REQUEST.test(t) || ADMIN_CONTACT.test(t)) return true;
  if (/^(hola|buenas|buen d[ií]a)[!.?\s]/i.test(t) && t.length < 160) return true;
  return false;
}

/**
 * Devuelve texto público o null si la señal no debe mostrarse.
 */
export function presentCircleIdeaForPublic(raw: string): string | null {
  const text = raw.trim();
  if (text.length < 12) return null;
  if (containsPiiRisk(text)) return null;

  if (shouldCurateInsteadOfVerbatim(text)) {
    return curatedSummaryFor(text);
  }

  return text;
}
