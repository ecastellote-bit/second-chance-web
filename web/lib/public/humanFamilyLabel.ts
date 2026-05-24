import type { ProfileFamilyId } from "@/lib/types/profileFamilies";
import { PROFILE_FAMILIES } from "@/lib/registries/profileFamilies";

const SPANISH_BY_ID = new Map<ProfileFamilyId, string>(
  PROFILE_FAMILIES.map((family) => [
    family.id,
    spanishLabelForRegistry(family.id, family.label),
  ]),
);

const TECHNICAL_ID = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/;

function spanishLabelForRegistry(id: ProfileFamilyId, englishLabel: string): string {
  const curated: Partial<Record<ProfileFamilyId, string>> = {
    empathic_guide: "Guía empático",
    public_communicator: "Comunicador público",
    civic_advocate: "Defensor cívico",
    creative_storyteller: "Narrador creativo",
    system_designer: "Diseñador de sistemas",
    technical_builder: "Constructor técnico",
    community_builder: "Tejedor comunitario",
    analytical_strategist: "Estratega analítico",
    diplomatic_social_connector: "Conector social",
    educator_interpreter: "Educador intérprete",
    institutional_operator: "Operador institucional",
    venture_builder: "Emprendedor constructor",
    operational_organizer: "Organizador operativo",
    cultural_explorer: "Explorador cultural",
    commercial_connector: "Conector comercial",
    resource_steward: "Administrador de recursos",
    experience_host: "Anfitrión de experiencias",
    artistic_creator: "Creador artístico",
    scientific_investigator: "Investigador científico",
    body_care_healer: "Cuidador del cuerpo",
    ecological_steward: "Guardián ecológico",
    athletic_performer: "Intérprete corporal",
  };

  return curated[id] ?? englishLabel;
}

/** Etiqueta humana para UI pública; null si sólo hay id técnico sin traducción. */
export function toPublicFamilyLabel(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();

  if (SPANISH_BY_ID.has(value as ProfileFamilyId)) {
    return SPANISH_BY_ID.get(value as ProfileFamilyId)!;
  }

  if (TECHNICAL_ID.test(value)) return null;

  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
