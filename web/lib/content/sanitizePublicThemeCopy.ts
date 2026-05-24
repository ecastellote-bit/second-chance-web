/** Etiquetas humanas para ids técnicos que no deben verse en UI pública. */
const TECHNICAL_ID_LABELS: Record<string, string> = {
  empathic_guide: "acompañamiento íntimo",
  educator_interpreter: "clarificar y enseñar",
  community_builder: "sostener grupos o redes",
  diplomatic_social_connector: "puente entre personas",
  institutional_operator: "navegación institucional",
  public_communicator: "mensaje público",
  civic_advocate: "advocacía o causa",
  creative_storyteller: "relato y expresión",
  venture_builder: "emprender una idea",
  system_designer: "diseño de sistemas",
  technical_builder: "hacer concreto",
  analytical_strategist: "lectura estratégica",
  meaning_synthesizer: "síntesis de sentido",
  operational_organizer: "organización operativa",
  resource_steward: "cuidado de recursos",
  cultural_explorer: "exploración cultural",
  scientific_investigator: "investigación",
  artistic_creator: "creación artística",
  aesthetic_designer_curator: "cuidado estético",
  experience_host: "experiencias vividas",
  body_care_healer: "cuidado corporal",
  athletic_performer: "rendimiento físico",
  ecological_steward: "cuidado ecológico",
  field_operator: "trabajo de campo",
  material_maker: "oficio material",
  performer: "presencia escénica",
  commercial_connector: "conexión comercial",
  transversal: "lectura transversal",
};

const TECHNICAL_ID_PATTERN = /\b[a-z]+(?:_[a-z]+)+\b/g;

function labelForTechnicalId(id: string): string {
  return TECHNICAL_ID_LABELS[id] ?? "";
}

/** Quita ids snake_case de copy mostrado al usuario; conserva el resto del texto. */
export function sanitizePublicThemeCopy(text: string): string {
  if (!text.trim()) return text;

  let out = text.replace(TECHNICAL_ID_PATTERN, (id) => labelForTechnicalId(id) || "");

  out = out
    .replace(/\(\s*\/\s*\)/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s*\/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();

  return out || text.trim();
}
