import type { PresentationForView } from "@/components/diagnostic/PersonalizedDiagnosticDeliverable";
import type { ProfileFamilyId } from "@/lib/types/profileFamilies";
import { PROFILE_FAMILIES } from "@/lib/registries/profileFamilies";

/** Frases humanas para etiquetas internas en inglés (UI pública). */
const ENGLISH_FAMILY_PHRASE: Record<string, string> = {
  "Community Builder": "armar espacios con otros",
  "Empathic Guide": "acompañar de cerca a alguien",
  "Diplomatic Social Connector": "acercar posiciones entre personas",
  "Public Communicator": "poner una voz en público",
  "Creative Storyteller": "convertir experiencia en relato",
  "System Designer": "ordenar sistemas o procesos",
  "Technical Builder": "hacer funcionar algo concreto",
  "Civic Advocate": "transformar una causa en acción",
  "Educator Interpreter": "explicar para que otros entiendan",
  "Analytical Strategist": "leer caminos y criterio",
  "Cultural Explorer": "explorar y conectar contextos",
  "Operational Organizer": "ordenar operación y prioridades",
  "Institutional Operator": "navegar instituciones y normas",
  "Venture Builder": "emprender y hacer crecer una idea",
  "Artistic Creator": "crear con forma propia",
};

const FAMILY_ID_PHRASE: Partial<Record<ProfileFamilyId, string>> = {
  community_builder: "armar espacios con otros",
  empathic_guide: "acompañar de cerca a alguien",
  diplomatic_social_connector: "acercar posiciones entre personas",
  public_communicator: "poner una voz en público",
  creative_storyteller: "convertir experiencia en relato",
  system_designer: "ordenar sistemas o procesos",
  technical_builder: "hacer funcionar algo concreto",
  civic_advocate: "transformar una causa en acción",
  educator_interpreter: "explicar para que otros entiendan",
  analytical_strategist: "leer caminos con criterio",
  cultural_explorer: "explorar y conectar contextos",
};

const TECHNICAL_PHRASE_REPLACEMENTS: [RegExp, string][] = [
  [/juez contextual/gi, "lectura contextual"],
  [/family\s*score/gi, "señal de lectura"],
  [/learning\s*trace/gi, "trazas internas"],
  [/frontier\s*famil/gi, "frontera de lectura"],
  [/rivalidad\s*diagnóstica/gi, "dos caminos que se parecen"],
  [/familia\s*diagnóstica/gi, "lectura"],
  [/familias\s*diagnósticas/gi, "lecturas"],
  [/metadata/gi, "datos internos"],
  [/calibración\s*del\s*motor/gi, "ajuste de lectura"],
  [/el\s+sistema\s+está\s+dudando/gi, "la lectura necesita distinguir"],
  [/el\s+sistema\s+duda/gi, "la lectura necesita distinguir"],
  [/el\s+sistema\s+llega/gi, "llegamos en la lectura"],
  [/el\s+sistema\b/gi, "la lectura"],
  [/el\s+modelo\b/gi, "la lectura"],
  [/scoring/gi, "ponderación interna"],
  [/adjudicación/gi, "cierre de lectura"],
  [/evidencia\s+general/gi, "más escenas concretas"],
  [/patrón\s+central/gi, "lectura central"],
  [/direcciones\s+posibles/gi, "dos caminos posibles"],
];

const GRAMMAR_REPLACEMENTS: [RegExp, string][] = [
  [/\bvos\s+ha\s+vivido\b/gi, "viviste"],
  [/\bvos\s+ha\s+/gi, "vos "],
  [/\bvos\s+tiene\b/gi, "tenés"],
  [/\bvos\s+fue\b/gi, "fuiste"],
  [/\bvos\s+son\b/gi, "sos"],
  [/\bvos\s+están\b/gi, "estás"],
  [/\bel\s+usuario\b/gi, "vos"],
  [/\bla\s+usuaria\b/gi, "vos"],
  [/\bla\s+persona\b/gi, "vos"],
];

const GENDER_NEUTRAL_REPLACEMENTS: [RegExp, string][] = [
  [/\bdónde\s+estás\s+parad[oa]\s+hoy\b/gi, "Tu punto de partida hoy"],
  [/\bestás\s+parad[oa]\b/gi, "estás hoy"],
  [/\bestás\s+preparad[oa]\b/gi, "tenés preparación"],
  [/\bestás\s+cansad[oa]\b/gi, "hay cansancio"],
  [/\bacompañador[a]?\b/gi, "tu modo de acompañar"],
  [/\borientad[oa]\b/gi, "tu dirección aparece"],
  [/\bpreparad[oa]\s+para\b/gi, "con preparación para"],
];

function replaceEnglishFamilies(text: string): string {
  let out = text;
  const labels = [
    ...Object.keys(ENGLISH_FAMILY_PHRASE),
    ...PROFILE_FAMILIES.map((f) => f.label),
  ].sort((a, b) => b.length - a.length);

  for (const label of labels) {
    const phrase = ENGLISH_FAMILY_PHRASE[label] ?? FAMILY_ID_PHRASE[label as ProfileFamilyId];
    if (!phrase) continue;
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "gi"), phrase);
  }

  for (const [id, phrase] of Object.entries(FAMILY_ID_PHRASE)) {
    const escaped = id.replace(/_/g, "[_ ]");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "gi"), phrase);
  }

  return out;
}

function applyReplacements(text: string, pairs: [RegExp, string][]): string {
  let out = text;
  for (const [pattern, replacement] of pairs) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/** Cinturón de seguridad: copy público sin metadata diagnóstica ni errores de voz/género. */
export function sanitizePublicDiagnosticCopy(text: string): string {
  if (!text?.trim()) return text;

  let out = text.trim();
  out = replaceEnglishFamilies(out);
  out = applyReplacements(out, TECHNICAL_PHRASE_REPLACEMENTS);
  out = applyReplacements(out, GRAMMAR_REPLACEMENTS);
  out = applyReplacements(out, GENDER_NEUTRAL_REPLACEMENTS);

  out = out
    .replace(/\s*\/\s*\/\s*/g, " — ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();

  return out || text.trim();
}

function sanitizeOptional(text: string | undefined): string | undefined {
  if (!text?.trim()) return text;
  return sanitizePublicDiagnosticCopy(text);
}

/** Sanitiza todo el entregable antes de mostrarlo. */
export function sanitizePresentationForView(
  presentation: PresentationForView,
): PresentationForView {
  const lc = presentation.lecturaCentral;
  return {
    ...presentation,
    lecturaCentral: lc
      ? {
          sentenciaRevelacion: sanitizeOptional(lc.sentenciaRevelacion),
          resumen: sanitizeOptional(lc.resumen),
          tensionViva: sanitizeOptional(lc.tensionViva),
          porQue: sanitizeOptional(lc.porQue),
        }
      : lc,
    enTusPalabras: presentation.enTusPalabras?.map((c) => ({
      ...c,
      texto: sanitizeOptional(c.texto),
      fundamento: sanitizeOptional(c.fundamento),
      momento: sanitizeOptional(c.momento),
    })),
    alertasLectura: presentation.alertasLectura?.map((a) => ({
      ...a,
      titulo: sanitizeOptional(a.titulo),
      cuerpo: sanitizeOptional(a.cuerpo),
    })),
    momentoVital: sanitizeOptional(presentation.momentoVital),
    referenciasQueResuenan: presentation.referenciasQueResuenan?.map((r) => ({
      ...r,
      referenceTitle: sanitizeOptional(r.referenceTitle),
      referenceBody: sanitizeOptional(r.referenceBody),
      puenteNarrativo: sanitizeOptional(r.puenteNarrativo),
    })),
    comoArmamosTuLectura: sanitizeOptional(presentation.comoArmamosTuLectura),
    loQueNoCerramos: sanitizeOptional(presentation.loQueNoCerramos),
    siguientePaso: presentation.siguientePaso
      ? {
          invitation: sanitizeOptional(presentation.siguientePaso.invitation),
          themeTeaser: presentation.siguientePaso.themeTeaser?.map((t) =>
            sanitizePublicDiagnosticCopy(t),
          ),
          activacionSugerida: presentation.siguientePaso.activacionSugerida
            ? {
                label: sanitizeOptional(
                  presentation.siguientePaso.activacionSugerida.label,
                ),
                plazaWelcomeLine: sanitizeOptional(
                  presentation.siguientePaso.activacionSugerida.plazaWelcomeLine,
                ),
              }
            : undefined,
        }
      : undefined,
  };
}
