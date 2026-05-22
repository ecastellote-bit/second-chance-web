/**
 * Reglas universales — Juez Contextual de Situación.
 * Anti-cebado: señales arquetípicas compartidas; sin vocabulario de un solo golden.
 */
import type { UserIntake } from "../types/intake";
import { buildUniversalArchetypeSignals } from "./discardRivalRules";

export function normalizeContextualText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildContextualIntakeText(intake: UserIntake): string {
  const safe = intake as unknown as Record<string, unknown>;
  const parts: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === "string" && v.trim()) parts.push(v.trim());
    else if (Array.isArray(v)) v.forEach(push);
    else if (v && typeof v === "object") Object.values(v).forEach(push);
  };
  push(safe.profile);
  push(safe.currentContext);
  push(safe.narrative);
  return normalizeContextualText(parts.join("\n"));
}

function includesPositivePhrase(text: string, phrase: string): boolean {
  if (!text.includes(phrase)) return false;
  const negationPrefixes = ["sin ", "no ", "nunca ", "jamas ", "jamás "];
  const idx = text.indexOf(phrase);
  const window = text.slice(Math.max(0, idx - 6), idx);
  return !negationPrefixes.some((neg) => window.endsWith(neg));
}

export function hasExplicitCollectiveLanguage(text: string): boolean {
  if (text.includes("sin comunidad") || text.includes("sin grupo")) return false;

  return [
    "comunidad",
    "colectivo",
    "red de",
    "grupo grande",
    "armar grupos",
    "convocar",
  ].some((m) => includesPositivePhrase(text, m));
}

export function hasExplicitAudienceLanguage(text: string): boolean {
  if (
    text.includes("sin audiencia") ||
    text.includes("sin publico") ||
    text.includes("sin público")
  ) {
    return false;
  }

  return [
    "audiencia",
    "en publico",
    "en público",
    "voz publica",
    "voz pública",
    "frente a otros",
    "hablar en publico",
    "llegar a mucha gente",
    "medios",
    "radio",
    "television",
  ].some((m) => includesPositivePhrase(text, m));
}

export function shouldSuppressTechnicalContextualForce(text: string): boolean {
  const signals = buildUniversalArchetypeSignals(text);
  const hasSosten = signals.sostenEconomico.length >= 2;
  const hasCraft = signals.craftFormaAdulta.length >= 1;
  const hasChildhoodTech =
    signals.infanciaFascinacion.length >= 1 && !hasCraft;

  return hasSosten && !hasCraft && !hasChildhoodTech;
}

export function shouldSuppressPublicVoiceWithoutAudience(text: string): boolean {
  return !hasExplicitAudienceLanguage(text);
}

export const FAMILY_ID_TO_LABEL: Record<string, string> = {
  analytical_strategist: "Analytical Strategist",
  technical_builder: "Technical Builder",
  system_designer: "System Designer",
  creative_storyteller: "Creative Storyteller",
  public_communicator: "Public Communicator",
  artistic_creator: "Artistic Creator",
  empathic_guide: "Empathic Guide",
  community_builder: "Community Builder",
  educator_interpreter: "Educator Interpreter",
  civic_advocate: "Civic Advocate",
  diplomatic_social_connector: "Diplomatic Social Connector",
  institutional_operator: "Institutional Operator",
  operational_organizer: "Operational Organizer",
  scientific_investigator: "Scientific Investigator",
  cultural_explorer: "Cultural Explorer",
  resource_steward: "Resource Steward",
  commercial_connector: "Commercial Connector",
  experience_host: "Experience Host",
};

export function familyIdToDisplayLabel(familyId: string): string {
  const key = normalizeContextualText(familyId).replace(/\s+/g, "_");
  return FAMILY_ID_TO_LABEL[key] ?? familyId;
}
